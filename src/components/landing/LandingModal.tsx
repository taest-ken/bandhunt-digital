"use client";

import React from "react";
import Image from "next/image";
import { Headphones, Radio, Sparkles, MapPin } from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface LandingModalProps {
  onStart: () => void;
}

export const LandingModal: React.FC<LandingModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08123B]/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      {/* Landing Card */}
      <div className="relative w-full max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1C1C1C] flex flex-col items-center text-center gap-4">
        {/* Top Floating Logo Unit with Center-Aligned Collab Logo */}
        <div className="w-full flex items-center justify-center border-b-2 border-[#1C1C1C]/15 pb-3">
          <BrandCollabLogo bandhuntHeight={28} taestHeight={18} />
        </div>

        {/* Headline & Subhead (Center Aligned) */}
        <div className="flex flex-col items-center gap-1.5 mt-1 text-center">
          <h1 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-[1.1]">
            no real fred fan left behind
          </h1>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#5D00FF] uppercase tracking-wide">
            A digital game of hot &amp; cold.
          </p>
        </div>

        {/* Body Copy (Center Aligned) */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-4 w-full flex flex-col items-center shadow-inner">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-relaxed text-center">
            Drag the handheld detector. Follow the heat and the beat.<br />
            Keep your eyes and ears open. Find the last seen location of<br />
            fredagain India tour bands. Cross level 6 to unlock<br />
            the “offline Bandhunt” place, date and time.
          </p>
        </div>

        {/* Action Button & Taped Badge */}
        <div className="w-full flex flex-col items-center gap-3 pt-1 relative">
          <button
            onClick={onStart}
            className="w-full py-4 px-6 rounded-2xl bg-[#CFFF04] hover:bg-[#bcf000] active:scale-95 text-[#1C1C1C] font-black text-sm uppercase border-[2.5px] border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] transition-all flex items-center justify-center gap-2.5 cursor-pointer y2k-btn-bounce"
          >
            <Headphones className="w-5 h-5 text-[#1C1C1C]" />
            <span>Grab headphones &amp; start hunting.</span>
          </button>

          {/* Taped Yellow Badge "BEST FOR LAPTOP USE" */}
          <div className="self-center -mt-1 rotate-[-2deg]">
            <div className="taped-label text-[10px] sm:text-[11px] font-sans font-black uppercase px-3 py-1 bg-[#FFE600] text-[#1C1C1C] border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
              ★ BEST FOR LAPTOP USE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
