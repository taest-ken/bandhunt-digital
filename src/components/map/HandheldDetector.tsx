"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ColorSpectrumResult } from "@/types/hitmap";
import { Navigation, Flame } from "lucide-react";

interface HandheldDetectorProps {
  proximity: number; // 0.0 to 1.0
  bearing: number; // 0 to 360 deg
  spectrum: ColorSpectrumResult;
  isLockedIn: boolean;
  onVelocityChange: (vx: number, vy: number) => void;
  onTapUnlock: () => void;
}

export const HandheldDetector: React.FC<HandheldDetectorProps> = ({
  proximity,
  bearing,
  spectrum,
  isLockedIn,
  onVelocityChange,
  onTapUnlock,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPointerRef = useRef({ x: 0, y: 0 });

  // Spring Physics constants
  const MAX_RADIUS = 48; // Max physical deflection when dragging the half-sized device
  const SPEED_MULTIPLIER = 1200; // Map panning velocity

  // Needle angle: -48deg (Cold/Left) to +48deg (Hot/Right)
  const jitterAngle = !isLockedIn ? Math.sin(Date.now() / 150) * (1 - proximity) * 4 : 0;
  const needleAngle = -48 + proximity * 96 + jitterAngle;

  // Single LED Color based on Proximity (Blue -> Cyan -> Yellow -> Orange -> Red)
  let ledColor = "#00F0FF"; // Cold blue
  let ledShadow = "0 0 10px #00F0FF";
  if (isLockedIn || proximity >= 0.88) {
    ledColor = "#FF0040"; // Hot Red
    ledShadow = "0 0 16px #FF0040, 0 0 28px #FF0040";
  } else if (proximity >= 0.7) {
    ledColor = "#FF8A00"; // Orange
    ledShadow = "0 0 12px #FF8A00";
  } else if (proximity >= 0.45) {
    ledColor = "#FFE600"; // Yellow
    ledShadow = "0 0 10px #FFE600";
  } else if (proximity >= 0.22) {
    ledColor = "#00E5FF"; // Cyan
    ledShadow = "0 0 8px #00E5FF";
  }

  // RAF-throttled velocity updater to prevent React render stutter
  const lastVelocityRef = useRef({ vx: 0, vy: 0 });
  const pendingVelocityRef = useRef({ vx: 0, vy: 0 });
  const rafRef = useRef<number | null>(null);

  const scheduleVelocityUpdate = useCallback((vx: number, vy: number) => {
    pendingVelocityRef.current = { vx, vy };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (
          pendingVelocityRef.current.vx !== lastVelocityRef.current.vx ||
          pendingVelocityRef.current.vy !== lastVelocityRef.current.vy
        ) {
          lastVelocityRef.current = pendingVelocityRef.current;
          onVelocityChange(pendingVelocityRef.current.vx, pendingVelocityRef.current.vy);
        }
      });
    }
  }, [onVelocityChange]);

  // Window-level pointer listeners while dragging (guarantees silky smooth tracking with zero capture loss)
  useEffect(() => {
    if (!isDragging) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      if (isLockedIn) return;
      let dx = e.clientX - startPointerRef.current.x;
      let dy = e.clientY - startPointerRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }

      setDragOffset({ x: dx, y: dy });
      const normVx = (dx / MAX_RADIUS) * SPEED_MULTIPLIER;
      const normVy = (dy / MAX_RADIUS) * SPEED_MULTIPLIER;
      scheduleVelocityUpdate(normVx, normVy);
    };

    const onWindowPointerUp = () => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastVelocityRef.current = { vx: 0, vy: 0 };
      onVelocityChange(0, 0);
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    };
  }, [isDragging, isLockedIn, scheduleVelocityUpdate, onVelocityChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLockedIn) {
      onTapUnlock();
      return;
    }
    setIsDragging(true);
    startPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  // Keyboard navigation support (Arrow keys / WASD)
  useEffect(() => {
    if (isLockedIn) return;

    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      updateVelocityFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
      updateVelocityFromKeys();
    };

    const updateVelocityFromKeys = () => {
      let vx = 0;
      let vy = 0;
      if (keys["arrowleft"] || keys["a"]) vx -= SPEED_MULTIPLIER * 0.75;
      if (keys["arrowright"] || keys["d"]) vx += SPEED_MULTIPLIER * 0.75;
      if (keys["arrowup"] || keys["w"]) vy -= SPEED_MULTIPLIER * 0.75;
      if (keys["arrowdown"] || keys["s"]) vy += SPEED_MULTIPLIER * 0.75;

      setDragOffset({
        x: (vx / SPEED_MULTIPLIER) * MAX_RADIUS,
        y: (vy / SPEED_MULTIPLIER) * MAX_RADIUS,
      });
      scheduleVelocityUpdate(vx, vy);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isLockedIn, scheduleVelocityUpdate]);

  // Distance estimation indicator to help tracking
  let distanceHint = "COLD // FAR";
  if (isLockedIn) distanceHint = "TARGET LOCKED! 🎯";
  else if (proximity >= 0.85) distanceHint = "BOILING! (< 80m)";
  else if (proximity >= 0.6) distanceHint = "VERY HOT (~250m)";
  else if (proximity >= 0.35) distanceHint = "WARMING UP (~800m)";
  else if (proximity >= 0.15) distanceHint = "SIGNAL DETECTED (~1.8km)";

  return (
    <div className="relative flex flex-col items-center select-none touch-none">
      {/* Handheld Device Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className={`relative w-[84px] h-[187px] sm:w-[94px] sm:h-[209px] cursor-grab active:cursor-grabbing transition-transform select-none ${
          isLockedIn
            ? "cursor-pointer animate-pulse"
            : isDragging
            ? "scale-105 drop-shadow-[5px_5px_0px_#1C1C1C]"
            : "hover:scale-102 drop-shadow-[4px_4px_0px_#1C1C1C]"
        }`}
        style={{
          transform: !isLockedIn
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.12}deg)`
            : undefined,
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Unified Pixel Art Device Body */}
        <Image
          src="/assets/detector/body.png"
          alt="Handheld Detector"
          fill
          className={`object-contain pointer-events-none transition-all ${
            isLockedIn ? "brightness-110" : ""
          }`}
          priority
        />

        {/* 1. Directional Heading Beacon (Positioned floating directly above antenna tip) */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#1C1C1C] flex items-center justify-center pointer-events-none z-30 shadow-[1px_1px_0px_#1C1C1C] border border-[#FFE600]/40"
          title="Direction to target"
        >
          <Navigation
            className="w-2.5 h-2.5 text-[#CFFF04] transition-transform duration-200"
            style={{
              transform: `rotate(${bearing}deg)`,
            }}
          />
        </div>

        {/* 2. GLOWING DOT & COLOR-CHANGING SONAR RADAR PULSE ON THE ANTENNA TIP */}
        <div className="absolute top-[4.7%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-30">
          {/* Concentric Expanding Pulsing Sonar Waves */}
          <div
            className="absolute w-7 h-7 rounded-full border-2 animate-ping opacity-60"
            style={{ borderColor: ledColor }}
          />
          <div
            className="absolute w-12 h-12 rounded-full border animate-pulse opacity-30"
            style={{ borderColor: ledColor }}
          />

          {/* Radial Light Glow around antenna tip */}
          <div
            className="absolute w-7 h-7 rounded-full transition-all duration-300 opacity-70 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${ledColor} 0%, rgba(0,0,0,0) 70%)`,
            }}
          />

          {/* Physical Glowing LED Dot Overlapping Antenna Tip */}
          <div
            className="w-2.5 h-2.5 rounded-full border border-[#1C1C1C] transition-all duration-300"
            style={{
              backgroundColor: ledColor,
              boxShadow: ledShadow,
            }}
          />
        </div>

        {/* 3. Analog Gauge: Needle Pivoting from Black Semicircle at Bottom of Screen Dial */}
        <div className="absolute top-[52.1%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
          {/* Rotating Needle Arm */}
          <div
            className="absolute bottom-0 w-0.5 h-[18px] sm:h-[20px] origin-bottom transition-transform duration-75 ease-out"
            style={{
              transform: `rotate(${needleAngle}deg)`,
            }}
          >
            {/* Needle shaft */}
            <div
              className={`w-full h-full rounded-t-full transition-colors ${
                isLockedIn
                  ? "bg-[#FF0040] shadow-[0_0_6px_#FF0040]"
                  : proximity > 0.7
                  ? "bg-[#FF8A00]"
                  : "bg-[#1C1C1C]"
              }`}
            />
            {/* Red tip */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FF0040] rounded-t-full" />
          </div>

          {/* Pivot cap seated directly on the printed black semicircle */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1C] border border-[#FFE600]/60 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Floating Status & Directional Clue Bar Under the Device */}
      <div className="mt-2 flex flex-col items-center gap-1 pointer-events-none">
        <div
          className={`taped-label text-[10px] sm:text-[11px] font-black uppercase px-3 py-1 border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition-all ${
            isLockedIn
              ? "bg-[#FF0040] text-white animate-pulse"
              : isDragging
              ? "bg-[#FFE600] text-[#1C1C1C]"
              : "bg-white text-[#1C1C1C]"
          }`}
        >
          {isLockedIn
            ? "BAND FREQUENCY LOCKED! TAP TO REVEAL"
            : isDragging
            ? "DRAGGING DETECTOR // SWEEPING CITY..."
            : "DRAG DETECTOR ACROSS MAP TO SEARCH"}
        </div>

        {/* Direction & Distance Hint */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/90 border border-[#1C1C1C] text-[#1C1C1C] shadow-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: ledColor }}
          />
          <span>{distanceHint}</span>
        </div>
      </div>
    </div>
  );
};
