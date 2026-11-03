import { NextResponse } from "next/server";
import {
  fetchRemoteSubmissions,
  mergeSubmissions,
  setConfiguredSheetUrl,
  parseCsv,
  mapCsvRowsToSubmissions,
  getSubmissions,
} from "@/lib/storage/submissionsStore";
import fs from "fs";
import path from "path";
import os from "os";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "taest2026";
const PRIMARY_DATA_PATH = path.join(process.cwd(), "src", "data", "fan_submissions.json");
const TMP_DATA_PATH = path.join(os.tmpdir(), "bandhunt_fan_submissions.json");

function checkAuth(request: Request, bodyPassword?: string): boolean {
  if (bodyPassword && bodyPassword === ADMIN_PASSWORD) return true;
  const headerPwd = request.headers.get("x-admin-password");
  if (headerPwd && headerPwd === ADMIN_PASSWORD) return true;
  const { searchParams } = new URL(request.url);
  const queryPwd = searchParams.get("pwd");
  return queryPwd === ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!checkAuth(request, body.password)) {
      return NextResponse.json({ error: "Unauthorized access: Founder password required" }, { status: 401 });
    }

    const { sheetUrl, rawCsv } = body;

    let importedList = [];

    // If raw CSV is provided (pasted by founder)
    if (rawCsv && typeof rawCsv === "string") {
      const rows = parseCsv(rawCsv);
      importedList = mapCsvRowsToSubmissions(rows);
    } else {
      // Sync from sheet URL / Apps script
      if (sheetUrl && typeof sheetUrl === "string") {
        setConfiguredSheetUrl(sheetUrl.trim());
      }
      importedList = await fetchRemoteSubmissions(sheetUrl);
    }

    if (importedList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No attendee records could be found. Check that your Google Sheet has 'Anyone with link can view' or that the Apps Script doGet function is deployed.",
        },
        { status: 400 }
      );
    }

    // Merge with current submissions
    const current = await getSubmissions();
    const merged = mergeSubmissions(importedList, current);

    // Save to memory and disk
    globalThis.__bandhunt_submissions = merged;
    globalThis.__last_sheet_sync_time = Date.now();

    try {
      fs.writeFileSync(TMP_DATA_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch {}

    try {
      const dir = path.dirname(PRIMARY_DATA_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(PRIMARY_DATA_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully synced ${importedList.length} rows from Google Sheet! (Total: ${merged.length} registrations)`,
      importedCount: importedList.length,
      totalCount: merged.length,
    });
  } catch (err: any) {
    console.error("Sync sheet error:", err);
    return NextResponse.json({ error: err?.message || "Failed to sync sheet" }, { status: 500 });
  }
}
