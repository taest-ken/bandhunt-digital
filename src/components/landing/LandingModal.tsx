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
      <div className="relative w-[94%] max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-5 sm:p-8 shadow-[8px_8px_0px_#1C1C1C] flex flex-col items-center text-center gap-3.5 sm:gap-4">
        {/* Top Floating Logo Unit with Center-Aligned Collab Logo */}
        <div className="w-full flex items-center justify-center border-b-2 border-[#1C1C1C]/15 pb-2.5 sm:pb-3">
          <BrandCollabLogo bandhuntHeight={28} taestHeight={18} />
        </div>

        {/* Headline & Subhead (Center Aligned) */}
        <div className="flex flex-col items-center gap-1 mt-0.5 sm:mt-1 text-center">
          <h1 className="text-xl sm:text-3xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-[1.15]">
            no real fred fan left behind
          </h1>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#5D00FF] uppercase tracking-wide">
            A digital game of hot &amp; cold.
          </p>
        </div>

        {/* Body Copy (1 single flowing paragraph with bold last sentence) */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-3.5 sm:p-4 w-full flex flex-col items-center shadow-inner">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-relaxed text-center">
            Move Fred along the map. Follow the heat and the beat. Keep your eyes and ears open. Find the last seen location of fredagain India tour bands.{" "}
            <strong className="font-black text-[#1C1C1C]">
              Cross level 6 to unlock the “offline Bandhunt” place, date and time.
            </strong>
          </p>
        </div>

        {/* Action Button & Taped Badge */}
        <div className="w-full flex flex-col items-center gap-2 sm:gap-2.5 pt-1 relative">
          <div className="relative w-full">
            <button
              onClick={onStart}
              className="w-full py-3.5 sm:py-4 pl-16 sm:pl-20 pr-5 sm:pr-6 rounded-2xl bg-[#CFFF04] hover:bg-[#bcf000] active:scale-95 text-[#1C1C1C] font-black text-[11px] sm:text-xs uppercase border-[2.5px] border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] transition-all flex items-center justify-center relative cursor-pointer y2k-btn-bounce overflow-visible"
            >
              {/* Headphone emoji on the badge that the sticker covers */}
              <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm select-none">
                🎧
              </span>
              <span className="whitespace-nowrap tracking-tight">Grab headphones &amp; start hunting.</span>
            </button>

            {/* Sticker 2: Halftone Headphones - Covers the headphone emoji badge on the left, NEVER covering text */}
            <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-18 sm:w-22 h-18 sm:h-22 pointer-events-none rotate-[-12deg] drop-shadow-[4px_4px_0px_#1C1C1C] z-30">
              <Image
                src="/assets/stickers/headphones.png"
                alt="Headphones"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Taped Yellow Badge "BEST FOR LAPTOP USE" */}
          <div className="self-center -mt-0.5 rotate-[-2deg]">
            <div className="taped-label text-[10px] sm:text-[11px] font-sans font-black uppercase px-2.5 sm:px-3 py-1 bg-[#FFE600] text-[#1C1C1C] border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
              ★ BEST FOR LAPTOP USE
            </div>
          </div>
        </div>

        {/* Sticker 1: Handheld Detector - Top-Right Corner (Consistent scale, completely clear of text) */}
        <div className="absolute -top-9 -right-2 sm:-top-11 sm:-right-3 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none rotate-[12deg] drop-shadow-[5px_5px_0px_#1C1C1C] z-30">
          <Image
            src="/assets/detector/body.png"
            alt="Handheld Detector"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Sticker 3: Pink Pixel Ticket - Bottom-Right Corner (Consistent scale, completely clear of text) */}
        <div className="absolute -bottom-5 -right-4 sm:-bottom-6 sm:-right-5 w-20 sm:w-24 h-16 sm:h-20 pointer-events-none rotate-[10deg] drop-shadow-[4px_4px_0px_#1C1C1C] z-30">
          <Image
            src="/assets/stickers/stickers.png"
            alt="Ticket"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};
