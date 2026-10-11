"use client";

import React from "react";
import { ColorSpectrumResult } from "@/types/hitmap";
import { Flame } from "lucide-react";

interface SignalMeterProps {
  proximity: number;
  spectrum: ColorSpectrumResult;
}

export const SignalMeter: React.FC<SignalMeterProps> = ({ proximity, spectrum }) => {
  const percent = Math.round(proximity * 100);

  // Playful labels
  let statusText = "FREEZING BLUE 🍦";
  if (percent > 85) statusText = "BOILING HOT! 🔥";
  else if (percent > 60) statusText = "WARMING UP! ✨";
  else if (percent > 30) statusText = "GETTING CLOSER 🎧";

  return (
    <div className="y2k-sticker px-3 py-1.5 flex items-center gap-2.5 shadow-sticker border-2 border-[#1C1C1C]">
      <div className="flex flex-col">
        <span className="text-[9px] font-sans font-black uppercase text-gray-500 tracking-wider">
          BEAT HEAT
        </span>
        <span
          className="text-xs font-sans font-black tracking-tight transition-colors duration-150"
          style={{ color: spectrum.hex === "#FFFFFF" ? "#1C1C1C" : spectrum.hex }}
        >
          {statusText}
        </span>
      </div>

      {/* 5-Bar Comic Heat Level Indicators */}
      <div className="flex items-end gap-1 h-5 px-1">
        {[1, 2, 3, 4, 5].map((level) => {
          const isActive = level <= spectrum.signalBars;
          const height = level * 3.5 + 4;

          return (
            <div
              key={level}
              className="w-2 rounded-sm border border-[#1C1C1C] transition-all duration-150"
              style={{
                height: `${height}px`,
                backgroundColor: isActive ? spectrum.hex : "#E2E8F0",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
