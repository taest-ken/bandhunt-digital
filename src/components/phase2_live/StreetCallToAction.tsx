"use client";

import React from "react";
import { Footprints, Sparkles } from "lucide-react";

export const StreetCallToAction: React.FC = () => {
  return (
    <div className="w-full max-w-md y2k-sticker bg-white p-5 rounded-3xl border-[3px] border-[#1C1C1C] text-center flex flex-col items-center gap-3 shadow-sticker-lg pointer-events-auto">
      <div className="w-13 h-13 rounded-2xl bg-[#FF2E9A] border-2 border-[#1C1C1C] flex items-center justify-center shadow-sticker-sm text-2xl animate-sticker-bounce">
        🏃💨
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-sans font-black tracking-widest text-[#5D00FF] uppercase">
          COMMUNITY MISSION // TIME CRITICAL
        </span>
        <h3 className="text-base sm:text-lg font-black font-sans text-[#1C1C1C] uppercase tracking-tight leading-tight">
          PUT THE PHONE IN YOUR POCKET &amp; RUN!
        </h3>
        <p className="text-xs font-sans text-gray-700 font-bold leading-normal">
          Wristbands are taped behind lampposts, tea stalls, and iconic street corners near Asiatic Society Library right now. If you&apos;re staring at this screen, you&apos;re already missing them!
        </p>
      </div>

      <div className="w-full py-3 px-4 rounded-2xl bg-[#CFFF04] hover:bg-[#b8e600] font-sans text-xs font-black text-[#1C1C1C] tracking-wider uppercase border-2 border-[#1C1C1C] shadow-sticker y2k-btn-bounce cursor-pointer flex items-center justify-center gap-2">
        <span>LOCK SCREEN &amp; HIT THE STREETS 🚀</span>
      </div>
    </div>
  );
};
