import { NextResponse } from "next/server";
import { getPhaseConfig, savePhaseConfig, computeActivePhase, PhaseConfig } from "@/lib/config/phaseManager";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(request: Request, bodyPassword?: string): boolean {
  if (bodyPassword && bodyPassword === ADMIN_PASSWORD) return true;
  const headerPwd = request.headers.get("x-admin-password");
  if (headerPwd && headerPwd === ADMIN_PASSWORD) return true;
  const { searchParams } = new URL(request.url);
  const queryPwd = searchParams.get("pwd");
  return queryPwd === ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const config = getPhaseConfig();
  const activePhase = computeActivePhase(config);

  return NextResponse.json({
    config,
    activePhase,
    currentTime: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!checkAuth(request, body.password)) {
      return NextResponse.json({ error: "Unauthorized access: Founder password required" }, { status: 401 });
    }

    const { phase2StartTime, phase3StartTime, manualOverride } = body;

    const updated = savePhaseConfig({
      ...(phase2StartTime ? { phase2StartTime } : {}),
      ...(phase3StartTime ? { phase3StartTime } : {}),
      ...(manualOverride ? { manualOverride } : {}),
    });

    const activePhase = computeActivePhase(updated);

    return NextResponse.json({
      success: true,
      config: updated,
      activePhase,
    });
  } catch (err) {
    console.error("Error updating phase config:", err);
    return NextResponse.json({ error: "Failed to update phase config" }, { status: 500 });
  }
}
