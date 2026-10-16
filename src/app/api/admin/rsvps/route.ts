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

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "taest2026";

function checkAuth(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  const headerPwd = request.headers.get("x-admin-password");
  const queryPwd = searchParams.get("pwd");
  return headerPwd === ADMIN_PASSWORD || queryPwd === ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized access: Founder password required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const listType = searchParams.get("list"); // 'city_invites' | 'mumbai_registrations' | null
  const pwd = searchParams.get("pwd") || request.headers.get("x-admin-password") || "";
  const submissions = readSubmissions();

  // Helper to test if submission belongs to List 2 (Mumbai Offline Bandhunt Early Access Registrations)
  const isMumbaiOffline = (s: PitchSubmission) =>
    s.source === "mumbai_offline_registration" ||
    s.source === "offline_bandhunt_modal" ||
    s.submittedBy === "Mumbai Offline Bandhunt Early Access";

  const mumbaiOfflineRegistrations = submissions.filter(isMumbaiOffline);
  const cityInviteRequests = submissions.filter((s) => !isMumbaiOffline(s));

  if (format === "csv") {
    let targetList: PitchSubmission[];
    let filename: string;
    let headers: string[];

    if (listType === "mumbai_registrations") {
      targetList = mumbaiOfflineRegistrations;
      filename = "mumbai_offline_bandhunt_registrations.csv";
      headers = ["Index", "Timestamp (UTC)", "Contact (Phone / Email)", "Access Type", "City", "Source"];
    } else if (listType === "city_invites") {
      targetList = cityInviteRequests;
      filename = "city_specific_invite_requests.csv";
      headers = ["Index", "Timestamp (UTC)", "Contact (Phone / Email)", "Target City", "Level Unlocked", "Source"];
    } else {
      targetList = submissions;
      filename = "all_bandhunt_submissions.csv";
      headers = ["Index", "Timestamp (UTC)", "List Category", "Contact (Phone / Email)", "City", "Level Unlocked", "Source", "Submitted By"];
    }

    const rows = targetList.map((sub, idx) => {
      const date = sub.createdAt || new Date().toISOString();
      const contact = `"${(sub.contact || sub.experienceDescription || "").replace(/"/g, '""')}"`;
      const city = `"${(sub.suggestedCity || "Mumbai").replace(/"/g, '""')}"`;
      const source = `"${(sub.source || "web").replace(/"/g, '""')}"`;
      const level = sub.levelUnlocked ? `Level ${sub.levelUnlocked}` : "All";
      const category = isMumbaiOffline(sub) ? "List 2: Mumbai Offline Registration" : "List 1: City Specific Invite";

      if (listType === "mumbai_registrations") {
        return [idx + 1, date, contact, '"Early Access Pass"', city, source].join(",");
      } else if (listType === "city_invites") {
        return [idx + 1, date, contact, city, level, source].join(",");
      } else {
        const user = `"${(sub.submittedBy || "").replace(/"/g, '""')}"`;
        return [idx + 1, date, `"${category}"`, contact, city, level, source, user].join(",");
      }
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // City breakdown
  const cityCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const city = s.suggestedCity || "Unknown";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  return NextResponse.json(
    {
      totalCount: submissions.length,
      list1Count: cityInviteRequests.length,
      list2Count: mumbaiOfflineRegistrations.length,
      cityCounts,
      cityInviteRequests,
      mumbaiOfflineRegistrations,
      submissions,
      downloadList1CsvUrl: `/api/admin/rsvps?format=csv&list=city_invites&pwd=${encodeURIComponent(pwd)}`,
      downloadList2CsvUrl: `/api/admin/rsvps?format=csv&list=mumbai_registrations&pwd=${encodeURIComponent(pwd)}`,
      downloadAllCsvUrl: `/api/admin/rsvps?format=csv&pwd=${encodeURIComponent(pwd)}`,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
