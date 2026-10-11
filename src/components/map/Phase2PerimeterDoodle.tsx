"use client";

import React from "react";
import { MapPin, Sparkles, Navigation } from "lucide-react";

export const Phase2PerimeterDoodle: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15 overflow-hidden">
      {/* SVG Hand-Drawn Pink Bubble Boundary (Image 3 Pocket-Guide Style) */}
      <svg
        viewBox="0 0 600 450"
        className="w-[85vw] max-w-[620px] h-auto pointer-events-none drop-shadow-[5px_5px_0px_#1C1C1C]"
      >
        {/* Black Outer Shadow/Border for the Bubble */}
        <path
          d="M 120,90 C 220,50 380,60 480,100 C 530,130 520,280 470,340 C 390,380 230,390 130,350 C 70,300 60,140 120,90 Z"
          fill="rgba(255, 46, 154, 0.08)"
          stroke="#1C1C1C"
          strokeWidth="14"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Thick Neon Fuchsia Hand-Drawn Route Perimeter */}
        <path
          d="M 120,90 C 220,50 380,60 480,100 C 530,130 520,280 470,340 C 390,380 230,390 130,350 C 70,300 60,140 120,90 Z"
          fill="none"
          stroke="#FF2E9A"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Cute Pocket-Guide Doodles along Perimeter (Image 3 Style) */}
        {/* Doodle Sun at Top */}
        <g transform="translate(300, 45)">
          <circle cx="0" cy="0" r="14" fill="#CFFF04" stroke="#1C1C1C" strokeWidth="2.5" />
          <line x1="0" y1="-20" x2="0" y2="-15" stroke="#1C1C1C" strokeWidth="2.5" />
          <line x1="15" y1="-15" x2="11" y2="-11" stroke="#1C1C1C" strokeWidth="2.5" />
          <line x1="20" y1="0" x2="15" y2="0" stroke="#1C1C1C" strokeWidth="2.5" />
          <line x1="-15" y1="15" x2="-11" y2="11" stroke="#1C1C1C" strokeWidth="2.5" />
          <text x="0" y="4" textAnchor="middle" fontSize="10">😊</text>
        </g>

        {/* Chai Glass Doodle at Right */}
        <g transform="translate(510, 200)">
          <rect x="-10" y="-12" width="20" height="24" rx="4" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2.5" />
          <line x1="-6" y1="-4" x2="6" y2="-4" stroke="#FF2E9A" strokeWidth="2" />
          <text x="0" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif">CHAI</text>
        </g>

        {/* Lightning Bolt Doodle at Left */}
        <g transform="translate(70, 220)">
          <polygon points="0,-12 8,-2 -2,-2 4,12 -8,2 2,2" fill="#CFFF04" stroke="#1C1C1C" strokeWidth="2" />
        </g>

        {/* Star Sticker at Bottom */}
        <g transform="translate(290, 385)">
          <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" fill="#FF2E9A" stroke="#1C1C1C" strokeWidth="2" />
        </g>
      </svg>

      {/* Inside Perimeter: Starting Meetup Point Animation (Paagal Pan Bhandaar) */}
      <div className="absolute flex flex-col items-center animate-sticker-bounce pointer-events-auto">
        {/* Animated Meetup Pin */}
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#FF2E9A] opacity-60 animate-ping absolute" />
          <div className="w-12 h-12 rounded-full bg-[#CFFF04] border-[3px] border-[#1C1C1C] shadow-sticker flex items-center justify-center text-xl cursor-pointer">
            📍
          </div>
        </div>

        {/* Meetup Sticker Tag */}
        <div className="taped-label text-[11px] px-3 py-1 rounded-xl bg-[#FFFFFF] border-2 border-[#1C1C1C] shadow-sticker text-[#1C1C1C] mt-2 flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#FF2E9A] animate-pulse" />
          <span>START / MEETUP BASE: PAAGAL PAN BHANDAAR</span>
        </div>

        <span className="text-[9px] font-sans font-black bg-[#1C1C1C] text-white px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">
          ACTIVE SEARCH PERIMETER (BANDRA WEST)
        </span>
      </div>
    </div>
  );
};
