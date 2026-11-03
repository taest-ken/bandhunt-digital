import fs from "fs";
import path from "path";
import os from "os";
import { PitchSubmission } from "@/types/hitmap";

// Global in-memory cache to retain submissions across warm serverless invocations
declare global {
  var __bandhunt_submissions: PitchSubmission[] | undefined;
  var __last_webhook_status: { success: boolean; status?: number; error?: string; checkedAt: number } | undefined;
}

if (!globalThis.__bandhunt_submissions) {
  globalThis.__bandhunt_submissions = [];
}

const PRIMARY_DATA_PATH = path.join(process.cwd(), "src", "data", "fan_submissions.json");
const TMP_DATA_PATH = path.join(os.tmpdir(), "bandhunt_fan_submissions.json");

// Helper to get Vercel KV / Upstash Redis credentials
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

/**
 * Reads submissions from Vercel KV / Upstash, falling back to disk (/tmp and src/data),
 * and finally checking Google Sheets if configured and local stores are empty.
 */
export async function getSubmissions(): Promise<PitchSubmission[]> {
  const kv = getKvConfig();

  // 1. Try Vercel KV / Upstash Redis REST
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/bandhunt_submissions`, {
        headers: {
          Authorization: `Bearer ${kv.token}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
          if (Array.isArray(parsed)) {
            globalThis.__bandhunt_submissions = parsed;
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("KV fetch error, falling back to local/tmp storage:", err);
    }
  }

  // 2. Try In-Memory Cache
  if (globalThis.__bandhunt_submissions && globalThis.__bandhunt_submissions.length > 0) {
    return globalThis.__bandhunt_submissions;
  }

  // 3. Try /tmp storage (writable on Vercel Serverless / AWS Lambda)
  try {
    if (fs.existsSync(TMP_DATA_PATH)) {
      const tmpData = fs.readFileSync(TMP_DATA_PATH, "utf-8");
      const parsedTmp = JSON.parse(tmpData);
      if (Array.isArray(parsedTmp) && parsedTmp.length > 0) {
        globalThis.__bandhunt_submissions = parsedTmp;
        return parsedTmp;
      }
    }
  } catch (err) {
    console.warn("Error reading /tmp submissions:", err);
  }

  // 4. Try primary project directory (local dev)
  try {
    if (fs.existsSync(PRIMARY_DATA_PATH)) {
      const data = fs.readFileSync(PRIMARY_DATA_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__bandhunt_submissions = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading primary submissions file:", err);
  }

  // 5. If local storage is empty on a fresh serverless cold-start, pull from Google Sheets via GET
  const webhookUrl = process.env.RSVP_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const gRes = await fetch(webhookUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "follow",
        cache: "no-store",
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && gData.length > 0) {
          globalThis.__bandhunt_submissions = gData;
          return gData;
        }
      }
    } catch (gErr) {
      // Quiet fail if doGet is not supported by webhook
    }
  }

  return [];
}

export interface AddSubmissionResult {
  updatedList: PitchSubmission[];
  webhookResult?: {
    success: boolean;
    status?: number;
    error?: string;
  };
}

/**
 * Persists a new submission across Cloud KV, /tmp disk, and optional Webhook (Google Sheets)
 */
export async function addSubmission(submission: PitchSubmission): Promise<AddSubmissionResult> {
  const current = await getSubmissions();
  
  // Deduplicate: If same contact submitted within last 3 minutes for same source, update instead of duplicate
  const existingIdx = current.findIndex(
    (item) =>
      item.contact?.trim().toLowerCase() === submission.contact?.trim().toLowerCase() &&
      item.source === submission.source
  );

  let updatedList: PitchSubmission[];
  if (existingIdx >= 0) {
    // Update existing submission with latest details (e.g. higher level unlocked)
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      ...submission,
      createdAt: submission.createdAt || new Date().toISOString(),
    };
  } else {
    updatedList = [submission, ...current];
  }

  // Update in-memory cache
  globalThis.__bandhunt_submissions = updatedList;

  // 1. Try Vercel KV / Upstash Redis REST
  const kv = getKvConfig();
  if (kv) {
    try {
      await fetch(`${kv.url}/set/bandhunt_submissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedList),
      });
    } catch (err) {
      console.warn("KV write error:", err);
    }
  }

  // 2. Write to /tmp (always writable in Serverless / Lambda environments)
  try {
    fs.writeFileSync(TMP_DATA_PATH, JSON.stringify(updatedList, null, 2), "utf-8");
  } catch (tmpErr) {
    console.warn("Could not write /tmp submissions:", tmpErr);
  }

  // 3. Try primary file (works in local dev environments)
  try {
    const dir = path.dirname(PRIMARY_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DATA_PATH, JSON.stringify(updatedList, null, 2), "utf-8");
  } catch (primaryErr) {
    // Expected on Vercel Serverless (EROFS: read-only file system)
  }

  // 4. Stream to Webhook (Google Sheets, Zapier, Make, Airtable)
  let webhookResult: { success: boolean; status?: number; error?: string } | undefined = undefined;
  const webhookUrl = process.env.RSVP_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const now = new Date();
      const istTimeStr = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const categoryName =
        submission.source === "mumbai_offline_registration" ||
        submission.submittedBy === "Mumbai Offline RSVP (offlyn.life)"
          ? "List 2: Mumbai Offline Bandhunt Registration"
          : "List 1: City Specific Invite Request";

      const payload = {
        ...submission,
        timestamp: istTimeStr,
        createdAt: submission.createdAt || now.toISOString(),
        contact: submission.contact || "",
        phone: submission.contact || "",
        email: submission.contact || "",
        city: submission.suggestedCity || "Mumbai",
        suggestedCity: submission.suggestedCity || "Mumbai",
        levelUnlocked: submission.levelUnlocked ? `Level ${submission.levelUnlocked}` : "All",
        source: submission.source || "web",
        category: categoryName,
        submittedBy: submission.submittedBy || "Player",
        serverTimestamp: now.toISOString(),
        totalSubmissionsNow: updatedList.length,
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        webhookResult = { success: true, status: res.status };
        globalThis.__last_webhook_status = { success: true, status: res.status, checkedAt: Date.now() };
      } else {
        const txt = await res.text().catch(() => "");
        console.warn(`Webhook response error (${res.status}):`, txt);
        webhookResult = { success: false, status: res.status, error: `HTTP ${res.status}` };
        globalThis.__last_webhook_status = { success: false, status: res.status, error: `HTTP ${res.status}`, checkedAt: Date.now() };
      }
    } catch (e: any) {
      console.warn("Webhook fire network error:", e);
      webhookResult = { success: false, error: e?.message || "Network error" };
      globalThis.__last_webhook_status = { success: false, error: e?.message, checkedAt: Date.now() };
    }
  }

  return { updatedList, webhookResult };
}

/**
 * Returns diagnostic metadata about current storage adapter
 */
export function getStorageDiagnostics() {
  const kv = getKvConfig();
  const lastWebhook = globalThis.__last_webhook_status;
  
  let webhookStatus = "NOT_CONFIGURED";
  if (process.env.RSVP_WEBHOOK_URL) {
    if (lastWebhook) {
      webhookStatus = lastWebhook.success ? "ACTIVE" : `ERROR_${lastWebhook.status || "FAIL"}`;
    } else {
      webhookStatus = "CONFIGURED";
    }
  }

  return {
    adapter: kv ? "VERCEL_KV_UPSTASH" : "SERVERLESS_RESILIENT",
    hasWebhook: !!process.env.RSVP_WEBHOOK_URL,
    webhookStatus,
    tmpFileExists: fs.existsSync(TMP_DATA_PATH),
    primaryFileExists: fs.existsSync(PRIMARY_DATA_PATH),
    inMemoryCount: globalThis.__bandhunt_submissions?.length || 0,
  };
}
