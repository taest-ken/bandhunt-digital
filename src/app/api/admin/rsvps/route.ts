import { NextResponse } from "next/server";
import { PitchSubmission } from "@/types/hitmap";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "fan_submissions.json");

function readSubmissions(): PitchSubmission[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read submissions:", err);
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const submissions = readSubmissions();

  if (format === "csv") {
    // Generate RFC 4180 compliant CSV
    const headers = ["Timestamp (UTC)", "City", "Contact / Input", "Level Unlocked", "Source", "Submitted By"];
    const rows = submissions.map((sub) => {
      const date = sub.createdAt || new Date().toISOString();
      const city = `"${(sub.suggestedCity || "").replace(/"/g, '""')}"`;
      const contact = `"${(sub.contact || sub.experienceDescription || "").replace(/"/g, '""')}"`;
      const level = sub.levelUnlocked ? `Level ${sub.levelUnlocked}` : "All";
      const source = `"${(sub.source || "web").replace(/"/g, '""')}"`;
      const user = `"${(sub.submittedBy || "").replace(/"/g, '""')}"`;
      return [date, city, contact, level, source, user].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="taest_bandhunt_rsvps.csv"',
        "Cache-Control": "no-store",
      },
    });
  }

  // City breakdown
  const cityCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const city = s.suggestedCity || "Unknown";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  return NextResponse.json({
    totalCount: submissions.length,
    cityCounts,
    submissions,
    downloadCsvUrl: "/api/admin/rsvps?format=csv",
  });
}
