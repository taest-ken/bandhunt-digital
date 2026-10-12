import { NextResponse } from "next/server";
import { TOUR_NODES, TOUR_CONFIG } from "@/lib/config/tourSchedule";
import { TourScheduleResponse, TourPhase } from "@/types/hitmap";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const now = Date.now();

  // Allow query param override for demo/agency testing (?phase=PHASE_1_HUNT | PHASE_2_LIVE | PHASE_3_WAITING)
  const overridePhase = searchParams.get("phase") as TourPhase | null;
  const phase: TourPhase = overridePhase || TOUR_CONFIG.activePhase;

  const elapsedMs = Math.max(0, now - TOUR_CONFIG.tourStartTime);
  const nodeDurationMs = TOUR_CONFIG.nodeDurationMinutes * 60 * 1000;

  // Allow query param override for nodeIndex (0..5 for sequential Levels 1..6)
  const nodeIndexParam = searchParams.get("nodeIndex");
  const activeIndex =
    nodeIndexParam !== null && !isNaN(parseInt(nodeIndexParam, 10))
      ? Math.max(0, Math.min(TOUR_NODES.length - 1, parseInt(nodeIndexParam, 10)))
      : Math.floor(elapsedMs / nodeDurationMs) % TOUR_NODES.length;
  const timeRemainingInNodeMs = nodeDurationMs - (elapsedMs % nodeDurationMs);

  const activeNode = TOUR_NODES[activeIndex];

  const response: TourScheduleResponse = {
    phase,
    phaseTitle:
      phase === "PHASE_1_HUNT"
        ? "THE HITMAP // FRED'S SECRET QUEST 🎧"
        : phase === "PHASE_2_LIVE"
        ? "STREET SQUAD ASSEMBLE! // PHYSICAL BANDHUNT LIVE 🎉"
        : "ROAD TRIP LOADING // ROAD TO NEXT CITY 🚌💨",
    activeCity: activeNode.cityName,
    currentNodeIndex: activeIndex + 1,
    totalNodes: TOUR_NODES.length,
    currentNode: {
      id: activeNode.id,
      spotNumber: activeNode.spotNumber,
      city: activeNode.cityName,
      clueText: activeNode.clueText,
      trackTitle: activeNode.trackTitle,
      trackArtist: activeNode.trackArtist,
      trackUrl: activeNode.trackUrl,
      videoLoopUrl: activeNode.videoLoopUrl,
      audioLoopStart: activeNode.audioLoopStart,
      audioLoopEnd: activeNode.audioLoopEnd,
      timecodes: activeNode.timecodes,
      discoveryQuote: activeNode.discoveryQuote,
      isFinalNode: activeNode.isFinalNode,
    },
    tourStartTime: TOUR_CONFIG.tourStartTime,
    nodeDurationMinutes: TOUR_CONFIG.nodeDurationMinutes,
    timeRemainingInNodeMs,
    nextCity: TOUR_CONFIG.nextCity,
    meetupCoordinates: TOUR_CONFIG.meetupCoordinates,
    liveDropMeta: {
      emergencyZone: "FORT / ASIATIC SOCIETY SECTOR",
      meetupLocationName: "Asiatic Society Library Steps, Fort",
      activeSightingsCount: 3,
      remainingPasses: 4,
      totalPasses: 10,
      runnersCount: 100,
      funnel: {
        signedUpCount: 100,
        crossedClue1: 50,
        crossedClue2: 20,
        closeToClue3: 10,
        ticketsRemaining: 4,
      },
      sightings: [
        { id: "s1", location: "Asiatic Library White Steps", timeAgo: "2m ago", status: "HOT" },
        { id: "s2", location: "Horniman Circle Chai Stall", timeAgo: "5m ago", status: "VERIFIED" },
        { id: "s3", location: "Flora Fountain Lamppost", timeAgo: "9m ago", status: "RECENT" },
      ],
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
