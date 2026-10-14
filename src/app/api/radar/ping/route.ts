import { NextResponse } from "next/server";
import { TOUR_NODES, TOUR_CONFIG } from "@/lib/config/tourSchedule";
import { calculateHaversineDistance, calculateBearing, distanceToProximity } from "@/lib/geo/distance";
import { RadarPingResponse } from "@/types/hitmap";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentCoord, nodeIndex } = body as {
      currentCoord?: [number, number];
      nodeIndex?: number;
    };

    if (!currentCoord || !Array.isArray(currentCoord) || currentCoord.length !== 2) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const now = Date.now();
    const elapsedMs = Math.max(0, now - TOUR_CONFIG.tourStartTime);
    const nodeDurationMs = TOUR_CONFIG.nodeDurationMinutes * 60 * 1000;
    const activeIndex =
      typeof nodeIndex === "number" && !isNaN(nodeIndex)
        ? Math.max(0, Math.min(TOUR_NODES.length - 1, nodeIndex))
        : Math.floor(elapsedMs / nodeDurationMs) % TOUR_NODES.length;
    const activeNode = TOUR_NODES[activeIndex];

    // Compute server-only distance and bearing
    const distanceMeters = calculateHaversineDistance(currentCoord, activeNode.coordinates);
    const trueBearing = calculateBearing(currentCoord, activeNode.coordinates);
    const proximity = distanceToProximity(distanceMeters);

    // Magnetic radio-interference jitter (fades as user gets closer)
    const jitterMagnitude = (1 - proximity) * 16;
    const jitter = Math.sin(now / 350) * jitterMagnitude;

    let zone: RadarPingResponse["zone"] = "COLD";
    if (proximity >= 0.98) zone = "LOCK_IN";
    else if (proximity >= 0.80) zone = "HOT";
    else if (proximity >= 0.55) zone = "WARM";
    else if (proximity >= 0.25) zone = "DETECTING";

    const isLockedIn = distanceMeters <= 25; // 25 meters lock-in radius

    const response: RadarPingResponse = {
      proximity: parseFloat(proximity.toFixed(4)),
      bearing: Math.round((trueBearing + jitter + 360) % 360),
      jitter: parseFloat(jitter.toFixed(1)),
      zone,
      verified: isLockedIn,
      distanceMeters: Math.round(distanceMeters),
    };

    if (isLockedIn) {
      response.unlockToken = `hitmap_token_${activeNode.id}_${now}`;
      response.nodeReward = {
        spotNumber: activeNode.spotNumber,
        targetName: activeNode.targetName,
        locationName: activeNode.locationName,
        storyTitle: activeNode.storyTitle,
        levelName: activeNode.levelName,
        discoveryQuote: activeNode.discoveryQuote,
        catchphrase: activeNode.catchphrase,
        clueText: activeNode.clueText,
        trackTitle: activeNode.trackTitle,
        imageUrl: activeNode.imageUrl,
        videoLoopUrl: activeNode.videoLoopUrl,
        coordinates: activeNode.coordinates,
        isFinalNode: activeNode.isFinalNode,
      };
    }

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("Radar ping error:", e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}
