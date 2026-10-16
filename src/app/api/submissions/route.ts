import { NextResponse } from "next/server";
import { PitchSubmission } from "@/types/hitmap";
import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "fan_submissions.json");

// Read existing submissions from disk
function readSubmissions(): PitchSubmission[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read submissions from file, using fallback:", err);
  }
  return [];
}

// Write submissions to disk
function writeSubmissions(items: PitchSubmission[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write submissions to file:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactValue = (body.contact || body.phone || body.email || body.experienceDescription || "").trim();
    const cityValue = (body.suggestedCity || "Mumbai").trim();

    if (!contactValue) {
      return NextResponse.json({ error: "Contact (phone number or email) is required" }, { status: 400 });
    }

    const currentSubmissions = readSubmissions();

    // Determine normalized source
    let normalizedSource = body.source || "bandhunt_web";
    if (body.submittedBy === "Mumbai Offline Bandhunt Early Access" || normalizedSource.includes("offline")) {
      normalizedSource = "mumbai_offline_registration";
    }

    const newSubmission: PitchSubmission = {
      suggestedCity: cityValue,
      contact: contactValue,
      experienceDescription: contactValue,
      submittedBy: body.submittedBy?.trim() || "Fred Fan",
      levelUnlocked: typeof body.levelUnlocked === "number" ? body.levelUnlocked : undefined,
      source: normalizedSource,
      createdAt: new Date().toISOString(),
    };

    currentSubmissions.push(newSubmission);
    writeSubmissions(currentSubmissions);

    // Optional webhook forwarder for founders (Google Sheets / Zapier / Airtable / Luma)
    const webhookUrl = process.env.RSVP_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSubmission),
        }).catch((err) => console.warn("Webhook forward failed:", err));
      } catch (wErr) {
        console.warn("Could not fire webhook:", wErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration recorded successfully! You're on the taest invite list.",
        submissionCount: currentSubmissions.length,
        storedLocation: "src/data/fan_submissions.json",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (e) {
    console.error("Submissions error:", e);
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 });
  }
}

export async function GET() {
  const items = readSubmissions();
  return NextResponse.json(
    {
      totalPitches: items.length,
      pitches: items,
      storageFile: "src/data/fan_submissions.json",
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
