"use client";

import React, { useRef, useState, useEffect } from "react";
import { ColorSpectrumResult } from "@/types/hitmap";

interface ElasticJoystickCompassProps {
  bearing: number; // 0-360 degrees target bearing
  proximity: number; // 0.0 to 1.0
  spectrum: ColorSpectrumResult;
  onVelocityChange: (vx: number, vy: number) => void;
  isLockedIn: boolean;
  onLockInTap?: () => void;
  headImageSrc?: string; // Optional custom co-founder PNG
  needleImageSrc?: string; // Optional custom co-founder PNG
}

export const ElasticJoystickCompass: React.FC<ElasticJoystickCompassProps> = ({
  bearing,
  proximity,
  spectrum,
  onVelocityChange,
  isLockedIn,
  onLockInTap,
  headImageSrc,
  needleImageSrc,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const maxRadius = 52; // Max deflection in pixels
  const maxSpeed = 380; // Speed cap (pixels per second) to prevent violent flicking

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLockedIn) {
      if (onLockInTap) onLockInTap();
      return;
    }

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = e.clientX - centerX;
    const rawDy = e.clientY - centerY;
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

    let dx = rawDx;
    let dy = rawDy;

    if (dist > maxRadius) {
      dx = (rawDx / dist) * maxRadius;
      dy = (rawDy / dist) * maxRadius;
    }

    setDragOffset({ x: dx, y: dy });

    // Non-linear acceleration curve for fine neighborhood searching vs. cruising
    const normalizedDist = Math.min(1, dist / maxRadius);
    const speedFactor = Math.pow(normalizedDist, 1.25);

    const vx = (dx / maxRadius) * maxSpeed * speedFactor;
    const vy = (dy / maxRadius) * maxSpeed * speedFactor;

    onVelocityChange(vx, vy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    setIsDragging(false);
    onVelocityChange(0, 0);

    // Spring-back damping physics animation
    let startX = dragOffset.x;
    let startY = dragOffset.y;
    let startTime: number | null = null;
    const duration = 240;

    const springStep = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Bouncy overshoot curve
      const ease = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 1.5);
      const curX = startX * (1 - ease);
      const curY = startY * (1 - ease);

      setDragOffset({ x: curX, y: curY });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(springStep);
      } else {
        setDragOffset({ x: 0, y: 0 });
      }
    };

    animFrameRef.current = requestAnimationFrame(springStep);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center ${
        isLockedIn ? "animate-sticker-bounce cursor-pointer scale-110" : ""
      }`}
      style={{ width: "160px", height: "160px" }}
    >
      {/* Outer Y2K Comic Base Ring */}
      <svg
        viewBox="0 0 140 140"
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
        style={{
          filter: "drop-shadow(4px 4px 0px #1C1C1C)",
        }}
      >
        {/* Outer Circular Boundary */}
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="rgba(255, 255, 255, 0.92)"
          stroke="#1C1C1C"
          strokeWidth="3"
        />

        {/* Inner Colorful Guide Rim */}
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke={spectrum.hex}
          strokeWidth="3.5"
          strokeDasharray="6 4"
        />

        {/* Playful Cardinal Directions */}
        <text x="70" y="24" textAnchor="middle" fill="#FF2E9A" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          N
        </text>
        <text x="122" y="73" textAnchor="middle" fill="#1C1C1C" fontSize="8" fontWeight="800" fontFamily="sans-serif">
          E
        </text>
        <text x="70" y="125" textAnchor="middle" fill="#1C1C1C" fontSize="8" fontWeight="800" fontFamily="sans-serif">
          S
        </text>
        <text x="18" y="73" textAnchor="middle" fill="#1C1C1C" fontSize="8" fontWeight="800" fontFamily="sans-serif">
          W
        </text>
      </svg>

      {/* Draggable Comic Joystick Puck */}
      <div
        className="absolute w-22 h-22 rounded-full flex items-center justify-center pointer-events-none transition-shadow"
        style={{
          width: "84px",
          height: "84px",
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${isDragging ? 1.06 : 1})`,
          boxShadow: isLockedIn ? "0 0 35px #FF2E9A, 5px 5px 0px #1C1C1C" : "4px 4px 0px #1C1C1C",
          backgroundColor: isLockedIn ? "#FF2E9A" : "#FFFFFF",
          border: "3px solid #1C1C1C",
        }}
      >
        {isLockedIn ? (
          /* Locked-In Floating Flower Sticker */
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl animate-spin [animation-duration:6s]">🌸</span>
            <span className="text-[9px] font-sans font-black text-white uppercase tracking-tighter drop-shadow">
              TAP FRED!
            </span>
          </div>
        ) : headImageSrc ? (
          /* Custom Co-Founder Puck PNG */
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <img src={headImageSrc} alt="Compass Head" className="w-full h-full object-contain" />
            {needleImageSrc && (
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
                style={{ transform: `rotate(${bearing}deg)` }}
              >
                <img src={needleImageSrc} alt="Needle" className="w-3/4 h-3/4 object-contain" />
              </div>
            )}
          </div>
        ) : (
          /* Default Procedural Comic Bearing Pointer */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
            style={{ transform: `rotate(${bearing}deg)` }}
          >
            <div className="relative flex flex-col items-center h-full justify-between py-2 pointer-events-none">
              {/* Chunky Comic Arrow Pointer */}
              <div
                className="w-0 h-0 border-x-[8px] border-x-transparent border-b-[24px] filter drop-shadow-[2px_2px_0px_#1C1C1C]"
                style={{
                  borderBottomColor: spectrum.hex,
                }}
              />
              
              {/* Center Smile Jewel */}
              <div
                className="w-4 h-4 rounded-full border-2 border-[#1C1C1C] flex items-center justify-center text-[8px] shadow-sm"
                style={{ backgroundColor: spectrum.hex }}
              >
                ✨
              </div>

              {/* Counterweight Tail */}
              <div
                className="w-1.5 h-3.5 rounded-full border border-[#1C1C1C]"
                style={{ backgroundColor: "#1C1C1C" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Y2K Action Sticker Tag */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
        <span
          className="taped-label text-[10px] px-2.5 py-1 rounded-md transition-colors"
          style={{
            backgroundColor: isLockedIn ? "#FF2E9A" : "#FFFFFF",
            color: isLockedIn ? "#FFFFFF" : "#1C1C1C",
          }}
        >
          {isLockedIn ? "FRED LOCATED! 🌸" : isDragging ? "STEERING MAP 🧭" : "DRAG ME TO SEARCH"}
        </span>
      </div>
    </div>
  );
};
