import { NextResponse } from "next/server";
import { PitchSubmission } from "@/types/hitmap";
import { addSubmission, getSubmissions, getStorageDiagnostics } from "@/lib/storage/submissionsStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactValue = (body.contact || body.phone || body.email || body.experienceDescription || "").trim();
    const cityValue = (body.suggestedCity || "Mumbai").trim();

    if (!contactValue) {
      return NextResponse.json({ error: "Contact (phone number or email) is required" }, { status: 400 });
    }

    // Determine normalized source
    let normalizedSource = body.source || "bandhunt_web";
    if (
      body.submittedBy === "Mumbai Offline Bandhunt Early Access" ||
      body.submittedBy === "Mumbai Offline RSVP (offlyn.life)" ||
      normalizedSource.includes("offline")
    ) {
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

    const { updatedList, webhookResult } = await addSubmission(newSubmission);

    return NextResponse.json(
      {
        success: true,
        message: "Registration recorded successfully! You're on the taest invite list.",
        submissionCount: updatedList.length,
        webhook: webhookResult,
        diagnostics: getStorageDiagnostics(),
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
  const items = await getSubmissions();
  return NextResponse.json(
    {
      submissions: items,
      count: items.length,
      diagnostics: getStorageDiagnostics(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
