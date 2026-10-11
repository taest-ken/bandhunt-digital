"use client";

import React from "react";
import { Radio, ArrowRight, Bell } from "lucide-react";

interface DiscoveryAlertProps {
  locationName: string;
  discoveryQuote?: string;
  onReveal: () => void;
}

export const DiscoveryAlert: React.FC<DiscoveryAlertProps> = ({
  locationName,
  discoveryQuote,
  onReveal,
}) => {
  const defaultText = `Band was last seen 15m ago on the packed ${locationName} platforms. Tap to give Fred an इंडिया टूर before his India tour.`;

  return (
    <div className="fixed top-24 sm:top-28 inset-x-0 z-40 flex justify-center p-3 pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div
        onClick={onReveal}
        className="pointer-events-auto cursor-pointer max-w-lg w-full bg-[#FF0040] text-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {/* Left Side: Notification Icon + Sentence 1 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#FF0040] border-2 border-[#1C1C1C] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1C1C1C] animate-bounce">
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#FFE600] text-[#1C1C1C] border border-[#1C1C1C]">
                NOTIFICATION ⚡
              </span>
              <span className="text-[10px] font-mono font-bold text-white/90">
                100% SIGNAL LOCK
              </span>
            </div>

            <p className="text-xs sm:text-[13px] font-sans font-black leading-snug tracking-tight text-white">
              Band was last seen 15m ago on the packed {locationName} platforms.
            </p>
          </div>
        </div>

        {/* Right Side: 3-Line CTA Stack */}
        <div className="flex flex-col items-center sm:items-end text-center sm:text-right shrink-0 gap-1">
          <span className="text-[11px] sm:text-xs font-black uppercase text-white/95 tracking-wide">
            Tap to give Fred an
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onReveal();
            }}
            className="px-4 py-2 rounded-xl bg-[#CFFF04] hover:bg-[#bcf000] text-[#1C1C1C] font-black text-xs sm:text-sm uppercase border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>इंडिया टूर</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <span className="text-[11px] sm:text-xs font-black uppercase text-white/95 tracking-wide">
            before his India tour.
          </span>
        </div>
      </div>
    </div>
  );
};
