"use client";

import React from "react";

interface AmbientRadarSweepProps {
  mode?: "cyan" | "crimson";
}

export const AmbientRadarSweep: React.FC<AmbientRadarSweepProps> = ({ mode = "cyan" }) => {
  const isCrimson = mode === "crimson";
  const sweepColor = isCrimson ? "rgba(255, 0, 60, 0.25)" : "rgba(0, 240, 255, 0.2)";
  const ringBorder = isCrimson ? "border-rose-600/30" : "border-cyan-500/25";

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
      {/* Concentric Sonar Rings */}
      <div className={`w-[260px] h-[260px] rounded-full border ${ringBorder} animate-ping [animation-duration:4s]`} />
      <div className={`absolute w-[440px] h-[440px] rounded-full border ${ringBorder}`} />
      <div className={`absolute w-[620px] h-[620px] rounded-full border ${ringBorder} opacity-60`} />
      <div className={`absolute w-[800px] h-[800px] rounded-full border ${ringBorder} opacity-30`} />

      {/* Rotating 360-degree Radar Sweep Beam */}
      <div className="absolute w-[800px] h-[800px] rounded-full overflow-hidden animate-radar-sweep pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 300deg, ${sweepColor} 360deg)`,
          }}
        />
      </div>
    </div>
  );
};
