import fs from "fs";
import path from "path";
import { TourPhase } from "@/types/hitmap";

export type ManualOverrideMode = "AUTO" | "FORCE_PHASE_1" | "FORCE_PHASE_2" | "FORCE_PHASE_3";

export interface PhaseConfig {
  phase2StartTime: string; // e.g. "2026-11-14T00:00:00+05:30"
  phase3StartTime: string; // e.g. "2026-11-15T00:00:00+05:30"
  manualOverride: ManualOverrideMode;
}

const DEFAULT_CONFIG: PhaseConfig = {
  phase2StartTime: "2026-11-14T00:00:00+05:30",
  phase3StartTime: "2026-11-15T00:00:00+05:30",
  manualOverride: "AUTO",
};

const CONFIG_FILE_PATH = path.join(process.cwd(), "src", "data", "phase_config.json");

// In-memory cache to ensure speed across serverless invocations
let cachedConfig: PhaseConfig | null = null;

export function getPhaseConfig(): PhaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      cachedConfig = {
        phase2StartTime: parsed.phase2StartTime || DEFAULT_CONFIG.phase2StartTime,
        phase3StartTime: parsed.phase3StartTime || DEFAULT_CONFIG.phase3StartTime,
        manualOverride: parsed.manualOverride || DEFAULT_CONFIG.manualOverride,
      };
      return cachedConfig;
    }
  } catch (err) {
    console.warn("Could not read phase_config.json, using defaults:", err);
  }

  cachedConfig = { ...DEFAULT_CONFIG };
  return cachedConfig;
}

export function savePhaseConfig(updated: Partial<PhaseConfig>): PhaseConfig {
  const current = getPhaseConfig();
  const nextConfig: PhaseConfig = {
    phase2StartTime: updated.phase2StartTime || current.phase2StartTime,
    phase3StartTime: updated.phase3StartTime || current.phase3StartTime,
    manualOverride: updated.manualOverride || current.manualOverride,
  };

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(nextConfig, null, 2), "utf-8");
    cachedConfig = nextConfig;
  } catch (err) {
    console.error("Failed to write phase_config.json:", err);
  }

  return nextConfig;
}

export function computeActivePhase(config?: PhaseConfig): TourPhase {
  const conf = config || getPhaseConfig();

  if (conf.manualOverride === "FORCE_PHASE_1") return "PHASE_1_HUNT";
  if (conf.manualOverride === "FORCE_PHASE_2") return "PHASE_2_LIVE";
  if (conf.manualOverride === "FORCE_PHASE_3") return "PHASE_3_WAITING";

  // AUTO Mode: Check current wall-clock timestamp
  const now = Date.now();
  const p2Time = new Date(conf.phase2StartTime).getTime();
  const p3Time = new Date(conf.phase3StartTime).getTime();

  // If timestamp is invalid or in the future of phase 2
  if (isNaN(p2Time) || now < p2Time) {
    return "PHASE_1_HUNT";
  }

  // If timestamp is on/after phase 2 and before phase 3
  if (isNaN(p3Time) || (now >= p2Time && now < p3Time)) {
    return "PHASE_2_LIVE";
  }

  // On/after phase 3
  return "PHASE_3_WAITING";
}
