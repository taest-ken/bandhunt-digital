"use client";

import React from "react";
import { Disc3 } from "lucide-react";

interface TrackInfoBadgeProps {
  trackTitle: string;
  trackArtist: string;
  proximity: number;
}

export const TrackInfoBadge: React.FC<TrackInfoBadgeProps> = ({
  trackTitle,
  trackArtist,
  proximity,
}) => {
  const activeBars = Math.min(4, Math.max(1, Math.ceil(proximity * 4)));

  return (
    <div className="y2k-sticker px-3 py-1.5 flex items-center gap-2 border-2 border-[#1C1C1C] max-w-[200px] sm:max-w-xs shadow-sticker">
      <div className="w-5 h-5 rounded-full bg-[#5D00FF] flex items-center justify-center text-white shrink-0">
        <Disc3 className="w-3.5 h-3.5 animate-spin [animation-duration:3s]" />
      </div>
      
      <div className="overflow-hidden flex flex-col leading-none">
        <span className="text-[11px] font-sans font-black text-[#1C1C1C] truncate uppercase">
          {trackTitle}
        </span>
        <span className="text-[9px] font-sans font-semibold text-gray-500 truncate mt-0.5">
          {trackArtist}
        </span>
      </div>

      {/* Mini Equalizer Bars */}
      <div className="flex items-end gap-0.5 ml-auto shrink-0 h-3.5 px-1">
        {[1, 2, 3, 4].map((bar) => {
          const isActive = bar <= activeBars;
          return (
            <div
              key={bar}
              className={`w-1 rounded-sm border border-[#1C1C1C] transition-all duration-150 ${
                isActive ? "bg-[#CFFF04]" : "bg-gray-200"
              }`}
              style={{
                height: isActive ? `${5 + (bar % 3) * 3 + Math.round(proximity * 3)}px` : "3px",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
