import fs from "fs";
import path from "path";
import os from "os";
import { PitchSubmission } from "@/types/hitmap";

// Global in-memory cache to retain submissions across warm serverless invocations
declare global {
  var __bandhunt_submissions: PitchSubmission[] | undefined;
  var __last_webhook_status: { success: boolean; status?: number; error?: string; checkedAt: number } | undefined;
  var __last_sheet_sync_time: number | undefined;
  var __configured_sheet_url: string | undefined;
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
 * Parses raw CSV text into a 2D array of string cells, preserving quotes and commas.
 */
export function parseCsv(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentVal.trim());
      if (row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((cell) => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Maps raw CSV rows into typed PitchSubmission objects with intelligent header detection.
 */
export function mapCsvRowsToSubmissions(rows: string[][]): PitchSubmission[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  let timeIdx = headers.findIndex((h) => h.includes("time") || h.includes("date") || h.includes("created"));
  let contactIdx = headers.findIndex(
    (h) => h.includes("contact") || h.includes("phone") || h.includes("mobile") || h.includes("email") || h.includes("number")
  );
  let cityIdx = headers.findIndex((h) => h.includes("city") || h.includes("location") || h.includes("town"));
  let levelIdx = headers.findIndex((h) => h.includes("level") || h.includes("tier"));
  let catIdx = headers.findIndex((h) => h.includes("cat") || h.includes("type") || h.includes("list"));
  let srcIdx = headers.findIndex((h) => h.includes("source"));
  let userIdx = headers.findIndex((h) => h.includes("submitt") || h.includes("name") || h.includes("user"));

  // Default fallback indices if headers are atypical
  if (contactIdx === -1) contactIdx = 1;
  if (cityIdx === -1) cityIdx = 2;
  if (timeIdx === -1) timeIdx = 0;

  const submissions: PitchSubmission[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const contactRaw = (r[contactIdx] || "").replace(/^'/, "").trim();
    if (!contactRaw) continue;

    const cityRaw = (cityIdx >= 0 && r[cityIdx] ? r[cityIdx] : "Mumbai").trim();
    const catRaw = (catIdx >= 0 && r[catIdx] ? r[catIdx] : "").toLowerCase();
    const srcRaw = (srcIdx >= 0 && r[srcIdx] ? r[srcIdx] : "").toLowerCase();
    const levelRaw = levelIdx >= 0 && r[levelIdx] ? r[levelIdx] : "";
    const userRaw = userIdx >= 0 && r[userIdx] ? r[userIdx] : "Player";
    const timeRaw = timeIdx >= 0 && r[timeIdx] ? r[timeIdx] : new Date().toISOString();

    const isList2 =
      catRaw.includes("list 2") ||
      catRaw.includes("mumbai offline") ||
      catRaw.includes("early access") ||
      srcRaw.includes("offline") ||
      userRaw.toLowerCase().includes("offline");

    let levelNum: number | undefined = undefined;
    const match = levelRaw.match(/\d+/);
    if (match) levelNum = parseInt(match[0], 10);

    submissions.push({
      contact: contactRaw,
      experienceDescription: contactRaw,
      suggestedCity: cityRaw || "Mumbai",
      levelUnlocked: levelNum,
      source: isList2 ? "mumbai_offline_registration" : (srcRaw || "bandhunt_web"),
      submittedBy: userRaw,
      createdAt: timeRaw,
    });
  }

  return submissions;
}

/**
 * Merges two lists of PitchSubmissions, deduplicating by contact and source.
 */
export function mergeSubmissions(primary: PitchSubmission[], secondary: PitchSubmission[]): PitchSubmission[] {
  const map = new Map<string, PitchSubmission>();

  // Process secondary first
  for (const s of secondary) {
    const key = `${(s.contact || "").trim().toLowerCase()}__${s.source || "web"}`;
    if (key.length > 5) {
      map.set(key, s);
    }
  }

  // Primary overwrites secondary
  for (const p of primary) {
    const key = `${(p.contact || "").trim().toLowerCase()}__${p.source || "web"}`;
    if (key.length > 5) {
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          ...p,
          levelUnlocked: Math.max(existing.levelUnlocked || 0, p.levelUnlocked || 0) || undefined,
        });
      } else {
        map.set(key, p);
      }
    } else {
      map.set(`idx_${Math.random()}`, p);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

function saveToDisks(list: PitchSubmission[]) {
  // 1. In-memory
  globalThis.__bandhunt_submissions = list;

  // 2. /tmp
  try {
    fs.writeFileSync(TMP_DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch {}

  // 3. primary local file
  try {
    const dir = path.dirname(PRIMARY_DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRIMARY_DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch {}
}

/**
 * Actively pulls attendee submissions from Google Sheets (via Apps Script GET or Google Sheets direct CSV).
 */
export async function fetchRemoteSubmissions(sheetUrlOverride?: string): Promise<PitchSubmission[]> {
  const webhookUrl = process.env.RSVP_WEBHOOK_URL;
  const targetSheet = sheetUrlOverride || globalThis.__configured_sheet_url || process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEET_ID;

  // 1. If Google Sheet URL or ID is provided, try direct CSV endpoint (fastest, no Apps Script required)
  if (targetSheet) {
    let csvUrl: string | null = null;
    const match = targetSheet.match(/[-\w]{25,}/);
    if (match) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${match[0]}/gviz/tq?tqx=out:csv`;
    } else if (targetSheet.startsWith("http")) {
      csvUrl = targetSheet;
    }

    if (csvUrl) {
      try {
        const res = await fetch(csvUrl, { cache: "no-store", redirect: "follow" });
        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes("<!DOCTYPE html>")) {
            const rows = parseCsv(text);
            const mapped = mapCsvRowsToSubmissions(rows);
            if (mapped.length > 0) {
              return mapped;
            }
          }
        }
      } catch (err) {
        console.warn("Direct Google Sheet CSV fetch failed:", err);
      }
    }
  }

  // 2. Try Apps Script Webhook GET
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "follow",
        cache: "no-store",
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0) {
            return json.map((item: any) => ({
              ...item,
              contact: String(item.contact || "").replace(/^'/, ""),
              suggestedCity: item.suggestedCity || item.city || "Mumbai",
              experienceDescription: item.contact || item.experienceDescription || "",
              createdAt: item.createdAt || item.timestamp || new Date().toISOString(),
              source: item.source || "google_sheets",
              submittedBy: item.submittedBy || "Player",
            }));
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Apps Script GET error:", e);
    }
  }

  return [];
}

/**
 * Reads submissions from Vercel KV, In-Memory, /tmp, and syncs with Google Sheets.
 */
export async function getSubmissions(forceRefresh = false): Promise<PitchSubmission[]> {
  const kv = getKvConfig();

  // 1. Read from Vercel KV if available
  if (kv && !forceRefresh) {
    try {
      const res = await fetch(`${kv.url}/get/bandhunt_submissions`, {
        headers: { Authorization: `Bearer ${kv.token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
          if (Array.isArray(parsed) && parsed.length > 0) {
            globalThis.__bandhunt_submissions = parsed;
            return parsed;
          }
        }
      }
    } catch {}
  }

  // 2. Read local disk / cache
  let local: PitchSubmission[] = [];
  if (globalThis.__bandhunt_submissions && globalThis.__bandhunt_submissions.length > 0) {
    local = globalThis.__bandhunt_submissions;
  } else {
    try {
      if (fs.existsSync(TMP_DATA_PATH)) {
        const tmpData = fs.readFileSync(TMP_DATA_PATH, "utf-8");
        const parsed = JSON.parse(tmpData);
        if (Array.isArray(parsed)) local = parsed;
      }
    } catch {}

    if (local.length === 0) {
      try {
        if (fs.existsSync(PRIMARY_DATA_PATH)) {
          const pData = fs.readFileSync(PRIMARY_DATA_PATH, "utf-8");
          const parsed = JSON.parse(pData);
          if (Array.isArray(parsed)) local = parsed;
        }
      } catch {}
    }
  }

  // 3. Actively sync with Google Sheets if requested or periodically (every 15s)
  const now = Date.now();
  const lastSync = globalThis.__last_sheet_sync_time || 0;
  const hasRemoteSource = Boolean(process.env.RSVP_WEBHOOK_URL || process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEET_ID || globalThis.__configured_sheet_url);

  if (hasRemoteSource && (forceRefresh || local.length === 0 || now - lastSync > 15000)) {
    try {
      const remote = await fetchRemoteSubmissions();
      if (remote.length > 0) {
        globalThis.__last_sheet_sync_time = now;
        const merged = mergeSubmissions(remote, local);
        saveToDisks(merged);
        return merged;
      }
    } catch (err) {
      console.warn("Failed pulling remote submissions:", err);
    }
  }

  globalThis.__bandhunt_submissions = local;
  return local;
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

  const existingIdx = current.findIndex(
    (item) =>
      item.contact?.trim().toLowerCase() === submission.contact?.trim().toLowerCase() &&
      item.source === submission.source
  );

  let updatedList: PitchSubmission[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      ...submission,
      createdAt: submission.createdAt || new Date().toISOString(),
    };
  } else {
    updatedList = [submission, ...current];
  }

  saveToDisks(updatedList);

  // Vercel KV write
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

  // Stream to Webhook (Google Sheets)
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
 * Sets an active Google Sheet URL for dynamic sheet sync.
 */
export function setConfiguredSheetUrl(url: string) {
  globalThis.__configured_sheet_url = url;
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
    configuredSheetUrl: globalThis.__configured_sheet_url || process.env.GOOGLE_SHEET_URL || process.env.GOOGLE_SHEET_ID || null,
    tmpFileExists: fs.existsSync(TMP_DATA_PATH),
    primaryFileExists: fs.existsSync(PRIMARY_DATA_PATH),
    inMemoryCount: globalThis.__bandhunt_submissions?.length || 0,
    lastSyncTime: globalThis.__last_sheet_sync_time || 0,
  };
}
