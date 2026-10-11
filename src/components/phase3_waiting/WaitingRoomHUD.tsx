"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface WaitingRoomHUDProps {
  currentCity?: string;
  nextCity?: string;
  onPlayRecap: () => void;
}

export const WaitingRoomHUD: React.FC<WaitingRoomHUDProps> = ({
  currentCity = "Mumbai",
  nextCity = "Delhi",
  onPlayRecap,
}) => {
  const [votedCity, setVotedCity] = useState<string | null>(null);
  const [votes, setVotes] = useState({ Bangalore: 1420, Delhi: 1680 });

  const handleVote = (city: "Bangalore" | "Delhi") => {
    if (votedCity) return;
    setVotedCity(city);
    setVotes((prev) => ({
      ...prev,
      [city]: prev[city] + 1,
    }));
  };

  return (
    <div className="fixed inset-y-0 right-4 sm:right-6 md:right-12 lg:right-20 z-30 pointer-events-none flex flex-col justify-center max-w-[calc(100vw-2rem)] sm:max-w-md w-full">
      <div className="w-full bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-5 md:p-6 text-center flex flex-col items-center gap-3.5 shadow-[6px_6px_0px_#1C1C1C] pointer-events-auto relative max-h-[92vh] overflow-y-auto my-auto">
        {/* Top Header: Centered BrandCollabLogo */}
        <div className="flex flex-col items-center gap-2.5 border-b-2 border-[#1C1C1C]/15 pb-3 w-full">
          <BrandCollabLogo size="md" />

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E9A] animate-ping" />
            <h2 className="text-base sm:text-lg font-black text-[#1C1C1C] tracking-tight uppercase">
              MUMBAI CHAPTER COMPLETED
            </h2>
          </div>
        </div>

        {/* Exact Specification Story Copy - Center-aligned with distinct line breaks */}
        <div className="flex flex-col gap-2.5 text-center bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-4 w-full shadow-inner">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug text-center">
            Fans of fredagain came together and stashed secret india tour bands across the city.
          </p>
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug text-center">
            4 winners, solved the clues, paired up and hunted these bands in pair.
          </p>
        </div>

        {/* Next Pitstop Block: Just Above Voting Buttons */}
        <div className="w-full flex flex-col gap-2 bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-[#5D00FF] uppercase tracking-wide">
              Next Pitstop: Your city.
            </span>
            <span className="text-[10px] font-mono font-black uppercase text-gray-500">
              {votedCity ? `VOTE SAVED! 🎉` : "VOTE FOR NEXT CITY"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVote("Bangalore")}
              className={`py-3 px-3.5 rounded-xl border-2 border-[#1C1C1C] font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer ${
                votedCity === "Bangalore"
                  ? "bg-[#CFFF04] text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]"
                  : "bg-white text-[#1C1C1C] hover:bg-[#CFFF04]/30"
              }`}
            >
              <span>BANGALORE</span>
              <span className="font-mono text-[10px] text-gray-700 font-bold">{votes.Bangalore}</span>
            </button>

            <button
              onClick={() => handleVote("Delhi")}
              className={`py-3 px-3.5 rounded-xl border-2 border-[#1C1C1C] font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer ${
                votedCity === "Delhi"
                  ? "bg-[#5D00FF] text-white shadow-[2px_2px_0px_#1C1C1C]"
                  : "bg-white text-[#1C1C1C] hover:bg-[#5D00FF]/20"
              }`}
            >
              <span>DELHI</span>
              <span className={`font-mono text-[10px] font-bold ${votedCity === "Delhi" ? "text-white" : "text-gray-700"}`}>
                {votes.Delhi}
              </span>
            </button>
          </div>
        </div>

        {/* Watch Mumbai Bandhunt Highlight Reel Button */}
        <button
          onClick={onPlayRecap}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-xs md:text-sm tracking-wider uppercase bg-[#CFFF04] hover:bg-[#bdf300] active:scale-95 text-[#1C1C1C] border-[2.5px] border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-[#1C1C1C]" />
          <span>Watch Mumbai Bandhunt Highlight Reel</span>
        </button>

        {/* Subtitle status badge: Next location unlocks in November */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B2E8C]/10 border border-[#1B2E8C]/30 text-[#1B2E8C] text-[10px] font-mono font-black uppercase">
          <span className="w-2 h-2 rounded-full bg-[#FF2E9A] animate-ping" />
          <span>Next location unlocks in November</span>
        </div>
      </div>
    </div>
  );
};
