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
    const { suggestedCity, experienceDescription, submittedBy, levelUnlocked, source } = body as PitchSubmission;

    if (!suggestedCity || !experienceDescription) {
      return NextResponse.json({ error: "City and contact/experience are required" }, { status: 400 });
    }

    const currentSubmissions = readSubmissions();

    const newSubmission: PitchSubmission = {
      suggestedCity: suggestedCity.trim(),
      experienceDescription: experienceDescription.trim(),
      contact: experienceDescription.trim(),
      submittedBy: submittedBy?.trim() || "Anonymous Fred Fan",
      levelUnlocked: typeof levelUnlocked === "number" ? levelUnlocked : undefined,
      source: source || "bandhunt_web",
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

    return NextResponse.json({
      success: true,
      message: "Registration recorded successfully! You're on the taest invite list.",
      submissionCount: currentSubmissions.length,
      storedLocation: "src/data/fan_submissions.json",
    });
  } catch (e) {
    console.error("Submissions error:", e);
    return NextResponse.json({ error: "Failed to submit pitch" }, { status: 500 });
  }
}

export async function GET() {
  const items = readSubmissions();
  return NextResponse.json({
    totalPitches: items.length,
    pitches: items,
    storageFile: "src/data/fan_submissions.json",
  });
}
