"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ColorSpectrumResult } from "@/types/hitmap";
import { VolumeToggle } from "@/components/audio/VolumeToggle";
import { Flame, Radio, Search, Calendar, ExternalLink, Ticket, RotateCcw } from "lucide-react";

interface HitmapHUDProps {
  cityName: string;
  nodeIndex: number;
  totalNodes: number;
  spotNumber?: number;
  locationName?: string;
  isUnlocked?: boolean;
  clueText: string;
  proximity: number;
  spectrum: ColorSpectrumResult;
  trackTitle: string;
  trackArtist: string;
  onOpenRSVP: () => void;
  onRestartGame?: () => void;
  isAllCompleted?: boolean;
}

export const HitmapHUD: React.FC<HitmapHUDProps> = ({
  cityName,
  nodeIndex,
  totalNodes,
  spotNumber = 1,
  locationName,
  isUnlocked = false,
  clueText,
  proximity,
  spectrum,
  trackTitle,
  trackArtist,
  onOpenRSVP,
  onRestartGame,
  isAllCompleted = false,
}) => {
  const [showLockedTooltip, setShowLockedTooltip] = useState(false);

  const handleOfflineDetailsClick = () => {
    if (!isAllCompleted) {
      setShowLockedTooltip(true);
      setTimeout(() => setShowLockedTooltip(false), 3000);
      return;
    }
    onOpenRSVP();
  };

  const percent = Math.round(proximity * 100);

  // Playful Heat state
  let heatStatus = "FREEZING COLD";
  if (percent > 85) heatStatus = "BOILING HOT! 🔥";
  else if (percent > 60) heatStatus = "WARMING UP ⚡";
  else if (percent > 30) heatStatus = "GETTING WARMER 🎧";

  return (
    <header className="fixed top-0 inset-x-0 z-30 p-3 sm:p-4 pointer-events-none flex flex-col gap-2.5">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between gap-2 pointer-events-auto">
        {/* Left: bandhunt | taest logo | Level #1 | live icon | Restart button */}
        <div className="flex items-center gap-2">
          <div className="y2k-sticker px-3 py-1.5 flex items-center gap-2 sm:gap-2.5 bg-white border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C]">
            <Image
              src="/assets/logo.png"
              alt="Bandhunt"
              width={100}
              height={26}
              className="h-5 sm:h-6 w-auto object-contain"
              priority
            />
            <div className="h-4 w-[1.5px] bg-[#1C1C1C]/20" />
            <a
              href="https://taest.in"
              target="_blank"
              rel="noopener noreferrer"
              title="Visit taest.in"
              className="hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center"
            >
              <Image
                src="/assets/taest-logo-black.png"
                alt="taest.in"
                width={70}
                height={18}
                className="h-3.5 sm:h-4 w-auto object-contain"
                priority
              />
            </a>
            <div className="h-4 w-[1.5px] bg-[#1C1C1C]/20" />
            <span className="text-[11px] sm:text-xs font-mono font-black uppercase text-[#5D00FF]">
              Level {nodeIndex}
            </span>
            <div className="h-4 w-[1.5px] bg-[#1C1C1C]/20" />
            <span className="relative flex h-2.5 w-2.5" title="Live hunt active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2E9A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2E9A]"></span>
            </span>

            {onRestartGame && (
              <>
                <div className="h-4 w-[1.5px] bg-[#1C1C1C]/20" />
                <button
                  onClick={onRestartGame}
                  title="Restart hunt from Level 1"
                  className="py-0.5 px-2 rounded-md bg-gray-100 hover:bg-[#FFE600] active:scale-95 border border-[#1C1C1C] text-[9px] font-mono font-black uppercase text-[#1C1C1C] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>RESTART</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Taped Badge + Offline Bandhunt Details Pill + Volume */}
        <div className="flex items-center gap-2">
          {/* Taped Badge from k.pdf Page 2 */}
          <div className="hidden md:flex rotate-[-1deg]">
            <div className="taped-label text-[10px] md:text-[11px] font-sans font-black uppercase px-3 py-1 bg-[#FFE600] text-[#1C1C1C] border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
              ★ searching last seen location of fredagain India tour bands
            </div>
          </div>

          {/* Offline Bandhunt Button: "Cross level 6 to unlock “Offline Bandhunt” details" */}
          <div className="relative">
            <button
              onClick={handleOfflineDetailsClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] text-[10px] font-sans font-black uppercase transition-all ${
                isAllCompleted
                  ? "bg-[#CFFF04] hover:bg-[#b8e600] text-[#1C1C1C] cursor-pointer active:scale-95 animate-pulse"
                  : "bg-gray-200 text-gray-700 cursor-pointer opacity-90 hover:bg-gray-300"
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-[#FF2E9A]" />
              <span className="hidden sm:inline">
                {isAllCompleted
                  ? "OFFLINE BANDHUNT DETAILS (UNLOCKED! 🎉)"
                  : "Cross level 6 to unlock “Offline Bandhunt” details"}
              </span>
              <span className="sm:hidden">
                {isAllCompleted ? "OFFLINE DETAILS 🎉" : "UNLOCK AT LEVEL 6 🔒"}
              </span>
            </button>

            {/* Popup message tooltip when tapped before clearing Level 6 */}
            {showLockedTooltip && (
              <div className="absolute top-full right-0 mt-2 z-50 w-64 p-2.5 bg-[#1C1C1C] text-white text-[11px] font-bold rounded-xl border-2 border-[#CFFF04] shadow-[4px_4px_0px_#CFFF04] animate-in fade-in slide-in-from-top-1 text-center">
                <span>🔒 Complete all 6 levels to unlock Mumbai&apos;s offline Bandhunt place, date &amp; time!</span>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <VolumeToggle />
        </div>
      </div>

      {/* 2. Middle Row: Multiline Lyric Clue Box (no bullets) & Dual Radars */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2.5 pointer-events-auto">
        {/* Multiline Lyric Clue Box without bullet points */}
        <div className="bg-white border-2 border-[#1C1C1C] rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-[4px_4px_0px_#1C1C1C] max-w-lg flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3 border-b border-[#1C1C1C]/10 pb-1">
            <span className="text-[10px] font-sans font-black uppercase text-[#FF2E9A] flex items-center gap-1">
              <span>✦</span>
              <span>CLUE // LISTEN CLOSELY</span>
            </span>

            {/* Hint to zoom in to pinpoint location */}
            <div className="flex items-center gap-1 text-[9px] font-sans font-black text-[#5D00FF] bg-[#5D00FF]/10 px-2 py-0.5 rounded-full border border-[#5D00FF]/25">
              <Search className="w-2.5 h-2.5 text-[#5D00FF]" />
              <span>ZOOM IN TO PINPOINT!</span>
            </div>
          </div>

          {/* Multiline lyric clue without bullet points */}
          <p className="text-xs sm:text-[13px] font-sans font-black text-[#1C1C1C] italic tracking-tight whitespace-pre-line leading-snug">
            &ldquo;{clueText}&rdquo;
          </p>
        </div>

        {/* Dual Radars HUD: HEAT RADAR & HITS RADAR */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Heat Radar */}
          <div className="bg-white border-2 border-[#1C1C1C] rounded-2xl px-3 py-1.5 shadow-[3px_3px_0px_#1C1C1C] flex items-center gap-2.5">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono font-black uppercase text-gray-500 tracking-wider">
                HEAT RADAR
              </span>
              <span
                className="text-[11px] font-sans font-black tracking-tight"
                style={{ color: spectrum.hex === "#FFFFFF" ? "#1C1C1C" : spectrum.hex }}
              >
                {heatStatus}
              </span>
            </div>

            {/* 5-bar heat level */}
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isActive = lvl <= spectrum.signalBars;
                return (
                  <div
                    key={lvl}
                    className="w-1.5 rounded-xs border border-[#1C1C1C] transition-all duration-150"
                    style={{
                      height: `${lvl * 3 + 4}px`,
                      backgroundColor: isActive ? spectrum.hex : "#E2E8F0",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Hits Radar (Audio Signal Frequency) */}
          <div className="bg-white border-2 border-[#1C1C1C] rounded-2xl px-3 py-1.5 shadow-[3px_3px_0px_#1C1C1C] flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${percent > 70 ? "text-[#FF2E9A] animate-pulse" : "text-[#5D00FF]"}`} />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono font-black uppercase text-gray-500 tracking-wider">
                HITS RADAR
              </span>
              <span className="text-[11px] font-sans font-black text-[#1C1C1C]">
                {percent}% SIGNAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
