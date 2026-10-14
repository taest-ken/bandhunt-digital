"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Instagram, MessageCircle } from "lucide-react";
import { TourScheduleResponse, RadarPingResponse, TourPhase } from "@/types/hitmap";
import { getRandomMumbaiSpawn, TOUR_NODES } from "@/lib/config/tourSchedule";
import { getProximityColorSpectrum } from "@/lib/colors/spectrum";
import { getHitmapAudioEngine } from "@/lib/audio/audioGraph";
import { LandingModal } from "@/components/landing/LandingModal";
import { HitmapHUD } from "@/components/phase1/HitmapHUD";
import { DiscoveryAlert } from "@/components/phase1/DiscoveryAlert";
import { RewardModal } from "@/components/phase1/RewardModal";
import { PhysicalDropRSVPModal } from "@/components/phase1/PhysicalDropRSVPModal";
import { StreetLockdownBanner } from "@/components/phase2_live/StreetLockdownBanner";
import { LiveDropTracker } from "@/components/phase2_live/LiveDropTracker";
import { StreetCallToAction } from "@/components/phase2_live/StreetCallToAction";
import { Phase2PerimeterDoodle } from "@/components/map/Phase2PerimeterDoodle";
import { Phase3RoadmapDoodles } from "@/components/map/Phase3RoadmapDoodles";
import { WaitingRoomHUD } from "@/components/phase3_waiting/WaitingRoomHUD";
import { OfflineRecapModal } from "@/components/phase3_waiting/OfflineRecapModal";
import { MapCanvas } from "@/components/map/MapCanvas";
import { HandheldDetector } from "@/components/map/HandheldDetector";
import { AmbientRadarSweep } from "@/components/map/AmbientRadarSweep";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

export default function HitmapApp() {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [schedule, setSchedule] = useState<TourScheduleResponse | null>(null);
  const [activePhase, setActivePhase] = useState<TourPhase>("PHASE_1_HUNT");

  // Coordinates & Camera Velocity: Random initial spawn across Mumbai landmass!
  const [currentCoord, setCurrentCoord] = useState<[number, number]>(() => getRandomMumbaiSpawn());
  const [resetCoord, setResetCoord] = useState<[number, number] | undefined>(undefined);
  const [velocity, setVelocity] = useState<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // Radar Oracle State
  const [radar, setRadar] = useState<RadarPingResponse>({
    proximity: 0.05,
    bearing: 42,
    jitter: 14,
    zone: "COLD",
    verified: false,
  });

  // Modals & Lock-In dismissal flags
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [hasDismissedReward, setHasDismissedReward] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [selectedPastLevelIndex, setSelectedPastLevelIndex] = useState<number | null>(null);

  // Level Timer Persistence: recorded on first reveal of node, does not reset on modal close
  const [levelTimerStartMs, setLevelTimerStartMs] = useState<number | undefined>(undefined);

  // 250m Proximity auto-dismissing toast
  const [showProximityToast, setShowProximityToast] = useState(false);
  const hasShownToastForLevelRef = useRef<number | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Level Progression: 0..5 index corresponding to Level 1..6
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevelIndexRef = useRef(0);
  useEffect(() => {
    currentLevelIndexRef.current = currentLevelIndex;
  }, [currentLevelIndex]);

  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  // Restore progression from localStorage on initial load
  useEffect(() => {
    try {
      const savedLvl = localStorage.getItem("bandhunt_level");
      if (savedLvl !== null) {
        const parsedLvl = parseInt(savedLvl, 10);
        if (!isNaN(parsedLvl) && parsedLvl >= 0 && parsedLvl < 6) {
          setCurrentLevelIndex(parsedLvl);
          currentLevelIndexRef.current = parsedLvl;
        }
      }
      const savedCompleted = localStorage.getItem("bandhunt_completed");
      if (savedCompleted) {
        const parsedComp = JSON.parse(savedCompleted);
        if (Array.isArray(parsedComp)) {
          setCompletedLevels(parsedComp);
        }
      }
      const savedTimer = localStorage.getItem("bandhunt_timer_start");
      if (savedTimer) {
        const parsedTimer = parseInt(savedTimer, 10);
        if (!isNaN(parsedTimer)) {
          setLevelTimerStartMs(parsedTimer);
        }
      }
    } catch (e) {
      console.warn("Error restoring bandhunt local progress:", e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bandhunt_level", String(currentLevelIndex));
    } catch {}
  }, [currentLevelIndex]);

  useEffect(() => {
    try {
      localStorage.setItem("bandhunt_completed", JSON.stringify(completedLevels));
    } catch {}
  }, [completedLevels]);

  // Ping Throttle
  const lastPingTimeRef = useRef<number>(0);

  // 1. Fetch Tour Schedule on load & phase change
  const fetchSchedule = useCallback(
    async (phaseOverride?: TourPhase, levelIdxOverride?: number) => {
      try {
        const targetPhase = phaseOverride || activePhase;
        const targetLevel =
          typeof levelIdxOverride === "number" ? levelIdxOverride : currentLevelIndexRef.current;
        const url = `/api/tour/schedule?phase=${targetPhase}&nodeIndex=${targetLevel}`;
        const res = await fetch(url);
        if (res.ok) {
          const data: TourScheduleResponse = await res.json();
          setSchedule(data);
          if (phaseOverride) {
            setActivePhase(phaseOverride);
          } else {
            setActivePhase(data.phase);
          }
        }
      } catch (e) {
        console.error("Error fetching schedule:", e);
      }
    },
    [activePhase]
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // 2. React to Phase Changes (Audio Engine Radio Intercept)
  useEffect(() => {
    const engine = getHitmapAudioEngine();
    if (activePhase === "PHASE_2_LIVE") {
      engine.setRadioInterceptMode(true);
    } else {
      engine.setRadioInterceptMode(false);
    }
  }, [activePhase]);

  // 2b. Play official node track whenever audio is unlocked or level changes
  useEffect(() => {
    if (!audioUnlocked || !schedule?.currentNode) return;
    const engine = getHitmapAudioEngine();
    const node = schedule.currentNode;
    if (node.trackUrl) {
      engine.playNodeTrack(node.trackUrl, node.audioLoopStart ?? 0, node.audioLoopEnd);
    }
  }, [audioUnlocked, schedule?.currentNode?.id]);

  // 3. Distance & Bearing Oracle Ping
  const pingRadarOracle = useCallback(
    async (coord: [number, number], levelIdx?: number) => {
      try {
        const targetLevel =
          typeof levelIdx === "number" ? levelIdx : currentLevelIndexRef.current;
        const res = await fetch("/api/radar/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentCoord: coord, nodeIndex: targetLevel }),
        });

        if (res.ok) {
          const data: RadarPingResponse = await res.json();
          setRadar(data);

          // Update Web Audio DSP lowpass filter and gain
          const engine = getHitmapAudioEngine();
          engine.updateProximity(data.proximity);

          // 250m Proximity auto-dismissing toast (triggers once per level approach)
          if (
            data.distanceMeters &&
            data.distanceMeters <= 250 &&
            data.distanceMeters > 25 &&
            !data.verified
          ) {
            if (hasShownToastForLevelRef.current !== targetLevel) {
              hasShownToastForLevelRef.current = targetLevel;
              setShowProximityToast(true);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
              toastTimerRef.current = setTimeout(() => {
                setShowProximityToast(false);
              }, 4500);
            }
          }
        }
      } catch (e) {
        console.error("Error pinging radar oracle:", e);
      }
    },
    []
  );

  // 4. Handle Map Center Change
  const handleCenterChange = useCallback(
    (newCenter: [number, number], levelIndex?: number) => {
      setCurrentCoord(newCenter);
      const now = performance.now();
      if (now - lastPingTimeRef.current > 80) {
        lastPingTimeRef.current = now;
        const activeLvl =
          typeof levelIndex === "number" ? levelIndex : currentLevelIndexRef.current;
        pingRadarOracle(newCenter, activeLvl);
      }
    },
    [pingRadarOracle]
  );

  // 5. Hunt For The Node Again: resets spawn point safely away from node
  const handleHuntAgain = useCallback(() => {
    currentLevelIndexRef.current = currentLevelIndex;
    const currentNode = TOUR_NODES[currentLevelIndex];
    const targetCoord = currentNode?.coordinates || radar.nodeReward?.coordinates;
    const newSpawn = getRandomMumbaiSpawn(targetCoord, 3.5);
    setCurrentCoord(newSpawn);
    setResetCoord(newSpawn);
    setVelocity({ vx: 0, vy: 0 });
    setHasDismissedReward(false);
    setShowRewardModal(false);
    setSelectedPastLevelIndex(null);
    setShowProximityToast(false);
    hasShownToastForLevelRef.current = null;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setRadar({
      proximity: 0.05,
      bearing: 42,
      jitter: 14,
      zone: "COLD",
      verified: false,
      nodeReward: undefined,
    });
    if (currentNode?.trackUrl && audioUnlocked) {
      const engine = getHitmapAudioEngine();
      engine.playNodeTrack(
        currentNode.trackUrl,
        currentNode.audioLoopStart ?? 0,
        currentNode.audioLoopEnd
      );
      engine.updateProximity(0.05);
    }
    pingRadarOracle(newSpawn, currentLevelIndex);
  }, [currentLevelIndex, radar.nodeReward, audioUnlocked, pingRadarOracle]);

  // 6. Advance to Next Level (1 -> 2 -> ... -> 6)
  const handleNextLevel = useCallback(() => {
    const nextIdx = (currentLevelIndex + 1) % 6;
    currentLevelIndexRef.current = nextIdx; // Update ref immediately!
    setCurrentLevelIndex(nextIdx);
    setCompletedLevels((prev) => Array.from(new Set([...prev, currentLevelIndex + 1])));
    setShowRewardModal(false);
    setHasDismissedReward(false);
    setSelectedPastLevelIndex(null);
    setShowProximityToast(false);
    hasShownToastForLevelRef.current = null;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    // Reset level timer for the new level
    setLevelTimerStartMs(undefined);
    try {
      localStorage.removeItem("bandhunt_timer_start");
    } catch {}

    const nextNode = TOUR_NODES[nextIdx];
    console.log(
      `[HITMAP] Target updated to Level ${nextIdx + 1} (${nextNode.locationName}): [${nextNode.coordinates.join(", ")}]`
    );

    const newSpawn = getRandomMumbaiSpawn(nextNode?.coordinates, 3.5);
    setCurrentCoord(newSpawn);
    setResetCoord(newSpawn);
    setVelocity({ vx: 0, vy: 0 });
    setRadar({
      proximity: 0.05,
      bearing: 42,
      jitter: 14,
      zone: "COLD",
      verified: false,
      nodeReward: undefined,
    });

    if (nextNode?.trackUrl && audioUnlocked) {
      const engine = getHitmapAudioEngine();
      engine.playNodeTrack(
        nextNode.trackUrl,
        nextNode.audioLoopStart ?? 0,
        nextNode.audioLoopEnd
      );
      engine.updateProximity(0.05);
    }

    fetchSchedule(activePhase, nextIdx);
    pingRadarOracle(newSpawn, nextIdx);
  }, [currentLevelIndex, activePhase, audioUnlocked, fetchSchedule, pingRadarOracle]);

  const isAllCompleted = completedLevels.length >= 6 || (currentLevelIndex === 5 && radar.verified);

  // Continuous 60fps Color Spectrum
  const spectrum = getProximityColorSpectrum(radar.proximity);

  // Velocity change from Handheld Detector with 50m magnetic lock
  const handleVelocityChange = useCallback((vx: number, vy: number) => {
    if (radar.verified) {
      // Freeze movement when frequency lock-in reached
      setVelocity({ vx: 0, vy: 0 });
      return;
    }

    // 50m Magnetic lock: gently bias joystick velocity towards target coordinates
    if (
      radar.distanceMeters &&
      radar.distanceMeters <= 50 &&
      radar.distanceMeters > 20 &&
      (vx !== 0 || vy !== 0)
    ) {
      const angleRad = (radar.bearing * Math.PI) / 180;
      const pullX = Math.sin(angleRad);
      const pullY = -Math.cos(angleRad);
      const speed = Math.hypot(vx, vy);
      const pullFactor = 0.55;
      const magneticVx = vx * (1 - pullFactor) + pullX * speed * pullFactor;
      const magneticVy = vy * (1 - pullFactor) + pullY * speed * pullFactor;
      setVelocity({ vx: magneticVx, vy: magneticVy });
      return;
    }

    setVelocity({ vx, vy });
  }, [radar.verified, radar.distanceMeters, radar.bearing]);

  // Handle landing start
  const handleLandingStart = async () => {
    try {
      const engine = getHitmapAudioEngine();
      await engine.unlockAudio();
      if (schedule?.currentNode?.trackUrl) {
        engine.playNodeTrack(
          schedule.currentNode.trackUrl,
          schedule.currentNode.audioLoopStart ?? 0,
          schedule.currentNode.audioLoopEnd
        );
      }
    } catch (e) {
      console.warn("Audio resume requires user gesture:", e);
    }
    setAudioUnlocked(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white select-none">
      {/* 1. CRT Grain Overlay */}
      <NoiseOverlay />

      {/* 2. Page 1 Landing Screen Modal (No background emojis, headphones unlock CTA) */}
      {!audioUnlocked && (
        <LandingModal onStart={handleLandingStart} />
      )}

      {/* 3. Base Map Canvas (Carto Positron: Sky Blue buildings, Pure White background & roads) */}
      <MapCanvas
        initialCenter={currentCoord}
        resetCoord={resetCoord}
        currentLevelIndex={currentLevelIndex}
        completedLevels={completedLevels}
        onSelectPastNode={(idx) => {
          setSelectedPastLevelIndex(idx);
          setShowRewardModal(true);
        }}
        velocity={velocity}
        onCenterChange={handleCenterChange}
        isLockedIn={radar.verified}
        lockedCoordinates={radar.nodeReward?.coordinates}
        activePhase={activePhase}
        meetupCoordinates={schedule?.meetupCoordinates}
      />

      {/* 250m Proximity Notification Toast */}
      {showProximityToast && !radar.verified && (
        <div className="fixed top-28 sm:top-32 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div
            onClick={() => setShowProximityToast(false)}
            className="pointer-events-auto cursor-pointer bg-[#FFE600] text-[#1C1C1C] border-[3px] border-[#1C1C1C] rounded-2xl px-4 py-2.5 shadow-[4px_4px_0px_#1C1C1C] flex items-center gap-2.5 font-sans font-black text-xs sm:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-base">🔍</span>
            <span>ZOOM IN TO PINPOINT! FRED IS WITHIN 250M!</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProximityToast(false);
              }}
              className="ml-2 w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px] font-bold hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 4. Ambient Radar Sweeps */}
      {activePhase === "PHASE_2_LIVE" && <AmbientRadarSweep mode="crimson" />}
      {activePhase === "PHASE_3_WAITING" && <AmbientRadarSweep mode="cyan" />}

      {/* 5. Phase-Specific Overlays */}

      {/* PHASE 1: Active HITMAP Sound Hunt */}
      {activePhase === "PHASE_1_HUNT" && schedule && (
        <>
          {/* Top HUD with single lyric clue, dual radars (Heat & Hits), taped badge, social links */}
          <HitmapHUD
            cityName={schedule.activeCity}
            nodeIndex={schedule.currentNodeIndex}
            totalNodes={schedule.totalNodes}
            spotNumber={schedule.currentNode.spotNumber || 1}
            locationName={radar.verified ? radar.nodeReward?.locationName : undefined}
            isUnlocked={radar.verified}
            clueText={schedule.currentNode.clueText}
            proximity={radar.proximity}
            spectrum={spectrum}
            trackTitle={schedule.currentNode.trackTitle}
            trackArtist={schedule.currentNode.trackArtist}
            isAllCompleted={isAllCompleted}
            onOpenRSVP={() => setShowRSVPModal(true)}
          />

          {/* Page 3 Discovery State Alert Banner (when lock-in achieved before modal) */}
          {radar.verified && !showRewardModal && (
            <DiscoveryAlert
              locationName={
                radar.nodeReward?.locationName ||
                TOUR_NODES[currentLevelIndex]?.locationName ||
                schedule.currentNode.locationName ||
                "Landmark"
              }
              discoveryQuote={
                radar.nodeReward?.discoveryQuote ||
                TOUR_NODES[currentLevelIndex]?.discoveryQuote ||
                schedule.currentNode.discoveryQuote
              }
              onReveal={() => {
                if (!levelTimerStartMs && currentLevelIndex < 5) {
                  const now = Date.now();
                  setLevelTimerStartMs(now);
                  try {
                    localStorage.setItem("bandhunt_timer_start", String(now));
                  } catch {}
                }
                setSelectedPastLevelIndex(null);
                setHasDismissedReward(false);
                setShowRewardModal(true);
              }}
            />
          )}

          {/* Handheld Detector with Fred's animated pixel face (Happy/Sad) */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <HandheldDetector
              proximity={radar.proximity}
              bearing={radar.bearing}
              spectrum={spectrum}
              isLockedIn={radar.verified}
              onVelocityChange={handleVelocityChange}
              onTapUnlock={() => {
                if (!levelTimerStartMs && currentLevelIndex < 5) {
                  const now = Date.now();
                  setLevelTimerStartMs(now);
                  try {
                    localStorage.setItem("bandhunt_timer_start", String(now));
                  } catch {}
                }
                setSelectedPastLevelIndex(null);
                setHasDismissedReward(false);
                setShowRewardModal(true);
              }}
            />
          </div>
        </>
      )}

      {/* PHASE 2: IRL BANDHUNT IS LIVE NOW (Street Lockdown Mode) */}
      {activePhase === "PHASE_2_LIVE" && schedule && (
        <>
          <Phase2PerimeterDoodle />

          <div className="fixed inset-0 z-30 flex flex-col justify-between p-4 pointer-events-none">
            <StreetLockdownBanner />

            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 w-full max-w-6xl mx-auto pb-4 pointer-events-none">
              {schedule.liveDropMeta && (
                <LiveDropTracker
                  emergencyZone={schedule.liveDropMeta.emergencyZone}
                  meetupLocationName="The Steps of Asiatic Society Library"
                  remainingPasses={schedule.liveDropMeta.remainingPasses}
                  sightings={schedule.liveDropMeta.sightings}
                />
              )}
              <StreetCallToAction />
            </div>
          </div>
        </>
      )}

      {/* PHASE 3: The Waiting Room & Roadmap Doodles */}
      {activePhase === "PHASE_3_WAITING" && schedule && (
        <>
          <Phase3RoadmapDoodles />

          <WaitingRoomHUD
            currentCity={schedule.activeCity}
            nextCity={schedule.nextCity}
            onPlayRecap={() => setShowRecapModal(true)}
          />
        </>
      )}

      {/* 6. Modals */}
      {/* 6.1 Node Unlocked Reward Modal (Active unlocked node OR past node without next-level component) */}
      {showRewardModal && schedule && (() => {
        const pastNode = selectedPastLevelIndex !== null ? TOUR_NODES[selectedPastLevelIndex] : null;
        const activeNode = radar.nodeReward || TOUR_NODES[currentLevelIndex];
        const displayNode = pastNode || activeNode;
        const isPast = pastNode !== null;

        if (!displayNode) return null;

        return (
          <RewardModal
            spotNumber={displayNode.spotNumber || 1}
            targetName={displayNode.targetName}
            locationName={displayNode.locationName}
            catchphrase={displayNode.catchphrase}
            clueText={displayNode.clueText}
            storyTitle={displayNode.storyTitle}
            imageUrl={displayNode.imageUrl}
            videoLoopUrl={displayNode.videoLoopUrl || schedule.currentNode.videoLoopUrl}
            isFinalNode={displayNode.isFinalNode}
            isPastNode={isPast}
            levelTimerStartMs={isPast ? undefined : levelTimerStartMs}
            timeRemainingMs={schedule.timeRemainingInNodeMs}
            onClose={() => {
              setShowRewardModal(false);
              if (isPast) {
                setSelectedPastLevelIndex(null);
              } else {
                setHasDismissedReward(true);
              }
            }}
            onHuntAgain={handleHuntAgain}
            onNextLevel={handleNextLevel}
            onOpenRSVP={() => {
              setShowRewardModal(false);
              setSelectedPastLevelIndex(null);
              setShowRSVPModal(true);
            }}
          />
        );
      })()}

      {/* 6.2 Phase 1 / Spot #6 Physical Bandhunt RSVP Modal (Page 10 in k.pdf) */}
      {showRSVPModal && (
        <PhysicalDropRSVPModal onClose={() => setShowRSVPModal(false)} />
      )}

      {/* 6.3 Phase 3 Offline Video Recap Modal */}
      {showRecapModal && schedule && (
        <OfflineRecapModal
          currentCity={schedule.activeCity}
          nextCity={schedule.nextCity}
          onClose={() => setShowRecapModal(false)}
        />
      )}

      {/* 7. Persistent Bottom Follow Bar on the LEFT: taest.club IG & WA Channel across all phases */}
      <div className="fixed bottom-3 left-3 sm:left-4 z-40 flex items-center gap-2 pointer-events-auto">
        <a
          href="https://instagram.com/taest.club"
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-3 rounded-xl bg-white hover:bg-gray-50 border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] text-[10px] font-sans font-black uppercase text-[#1C1C1C] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
          <span>Follow IG</span>
        </a>
        <a
          href="https://chat.whatsapp.com/EM12Mf0PE6J007pdF1w1Ne?s=cl&p=a&mlu=4&ilr=4"
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] text-[10px] font-sans font-black uppercase text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Join WA</span>
        </a>
      </div>

      {/* 8. Demo Phase Switcher on the RIGHT (Y2K Comic Aesthetic) */}
      <aside className="fixed bottom-3 right-3 sm:right-4 z-40 flex items-center gap-1.5 bg-white border-2 border-[#1C1C1C] px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#1C1C1C] text-[10px] font-sans font-black pointer-events-auto">
        <span className="text-gray-500 uppercase tracking-wider mr-1">
          DEMO PHASES:
        </span>
        <button
          onClick={() => fetchSchedule("PHASE_1_HUNT")}
          className={`px-2.5 py-1 rounded-lg cursor-pointer border border-[#1C1C1C] transition-all ${
            activePhase === "PHASE_1_HUNT"
              ? "bg-[#CFFF04] text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          PH1 (HUNT)
        </button>
        <button
          onClick={() => fetchSchedule("PHASE_2_LIVE")}
          className={`px-2.5 py-1 rounded-lg cursor-pointer border border-[#1C1C1C] transition-all ${
            activePhase === "PHASE_2_LIVE"
              ? "bg-[#FF2E9A] text-white shadow-[2px_2px_0px_#1C1C1C]"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          PH2 (STREET)
        </button>
        <button
          onClick={() => fetchSchedule("PHASE_3_WAITING")}
          className={`px-2.5 py-1 rounded-lg cursor-pointer border border-[#1C1C1C] transition-all ${
            activePhase === "PHASE_3_WAITING"
              ? "bg-[#5D00FF] text-white shadow-[2px_2px_0px_#1C1C1C]"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          PH3 (ROAD TRIP)
        </button>
      </aside>
    </main>
  );
}
