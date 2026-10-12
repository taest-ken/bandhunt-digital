"use client";

import React from "react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

export const StreetLockdownBanner: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center pointer-events-auto">
      {/* Top Playful Comic Hazard Bar */}
      <div className="w-full h-2.5 bg-[#FF2E9A] border-b-2 border-[#1C1C1C]" />

      {/* Main Alert Banner - Form-fitted to content without excess whitespace */}
      <div className="w-fit max-w-xl mx-auto bg-white px-6 py-3.5 sm:px-8 sm:py-4 mt-2 flex flex-col items-center justify-center text-center gap-2 shadow-[6px_6px_0px_#1C1C1C] border-[3.5px] border-[#1C1C1C] rounded-2xl">
        <BrandCollabLogo size="md" />

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans font-black tracking-wider text-white uppercase bg-[#FF2E9A] px-2.5 py-0.5 rounded-md border border-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C] animate-pulse">
              OFFLINE BANDHUNT LIVE NOW! 🏃💨
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black font-sans tracking-tight text-[#1C1C1C] uppercase">
            GRAB PHYSICAL BANDS IN THE STREETS!
          </h2>
        </div>
      </div>
    </div>
  );
};
