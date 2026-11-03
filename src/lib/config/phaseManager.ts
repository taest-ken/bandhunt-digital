import fs from "fs";
import path from "path";
import os from "os";
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

declare global {
  var __bandhunt_phase_config: PhaseConfig | undefined;
}

const PRIMARY_CONFIG_PATH = path.join(process.cwd(), "src", "data", "phase_config.json");
const TMP_CONFIG_PATH = path.join(os.tmpdir(), "bandhunt_phase_config.json");

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

export function getPhaseConfig(): PhaseConfig {
  if (globalThis.__bandhunt_phase_config) {
    return globalThis.__bandhunt_phase_config;
  }

  // 1. Try /tmp
  try {
    if (fs.existsSync(TMP_CONFIG_PATH)) {
      const raw = fs.readFileSync(TMP_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__bandhunt_phase_config = {
        phase2StartTime: parsed.phase2StartTime || DEFAULT_CONFIG.phase2StartTime,
        phase3StartTime: parsed.phase3StartTime || DEFAULT_CONFIG.phase3StartTime,
        manualOverride: parsed.manualOverride || DEFAULT_CONFIG.manualOverride,
      };
      return globalThis.__bandhunt_phase_config;
    }
  } catch (err) {
    console.warn("Could not read /tmp phase_config.json:", err);
  }

  // 2. Try primary project directory
  try {
    if (fs.existsSync(PRIMARY_CONFIG_PATH)) {
      const raw = fs.readFileSync(PRIMARY_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      globalThis.__bandhunt_phase_config = {
        phase2StartTime: parsed.phase2StartTime || DEFAULT_CONFIG.phase2StartTime,
        phase3StartTime: parsed.phase3StartTime || DEFAULT_CONFIG.phase3StartTime,
        manualOverride: parsed.manualOverride || DEFAULT_CONFIG.manualOverride,
      };
      return globalThis.__bandhunt_phase_config;
    }
  } catch (err) {
    console.warn("Could not read phase_config.json, using defaults:", err);
  }

  globalThis.__bandhunt_phase_config = { ...DEFAULT_CONFIG };
  return globalThis.__bandhunt_phase_config;
}

export async function getPhaseConfigAsync(): Promise<PhaseConfig> {
  const kv = getKvConfig();
  if (kv) {
    try {
      const res = await fetch(`${kv.url}/get/bandhunt_phase_config`, {
        headers: { Authorization: `Bearer ${kv.token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
          globalThis.__bandhunt_phase_config = {
            phase2StartTime: parsed.phase2StartTime || DEFAULT_CONFIG.phase2StartTime,
            phase3StartTime: parsed.phase3StartTime || DEFAULT_CONFIG.phase3StartTime,
            manualOverride: parsed.manualOverride || DEFAULT_CONFIG.manualOverride,
          };
          return globalThis.__bandhunt_phase_config;
        }
      }
    } catch (e) {
      console.warn("KV get phase error:", e);
    }
  }

  return getPhaseConfig();
}

export function savePhaseConfig(updated: Partial<PhaseConfig>): PhaseConfig {
  const current = getPhaseConfig();
  const nextConfig: PhaseConfig = {
    phase2StartTime: updated.phase2StartTime || current.phase2StartTime,
    phase3StartTime: updated.phase3StartTime || current.phase3StartTime,
    manualOverride: updated.manualOverride || current.manualOverride,
  };

  globalThis.__bandhunt_phase_config = nextConfig;

  // 1. Write to /tmp (always succeeds on Serverless)
  try {
    fs.writeFileSync(TMP_CONFIG_PATH, JSON.stringify(nextConfig, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write /tmp phase_config.json:", err);
  }

  // 2. Try primary (succeeds in local development)
  try {
    const dir = path.dirname(PRIMARY_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_CONFIG_PATH, JSON.stringify(nextConfig, null, 2), "utf-8");
  } catch (err) {
    // Expected on Vercel (read-only)
  }

  // 3. Write to KV if available
  const kv = getKvConfig();
  if (kv) {
    fetch(`${kv.url}/set/bandhunt_phase_config`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextConfig),
    }).catch((e) => console.warn("KV set phase error:", e));
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
