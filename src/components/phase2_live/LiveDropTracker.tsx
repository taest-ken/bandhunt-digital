"use client";

import React from "react";
import { Ticket, Users, MapPin, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

interface LiveDropTrackerProps {
  emergencyZone: string;
  meetupLocationName?: string;
  remainingPasses?: number;
  totalPasses?: number;
  runnersCount?: number;
  sightings?: Array<{
    id: string;
    location: string;
    timeAgo: string;
    status: "VERIFIED" | "RECENT" | "HOT";
  }>;
}

export const LiveDropTracker: React.FC<LiveDropTrackerProps> = ({
  emergencyZone,
  meetupLocationName = "The Steps of Asiatic Society Library",
  remainingPasses = 4,
  totalPasses = 100,
  runnersCount = 100,
  sightings = [],
}) => {
  // Page 11 High-Contrast Funnel Progression:
  const funnelSteps: Array<{ label: string; count: number | string; bg: string }> = [
    { label: "SIGNED UP", count: 100, bg: "bg-white text-[#1C1C1C]" },
    { label: "CROSSED CLUE 1", count: 50, bg: "bg-[#00F0FF] text-[#1C1C1C]" },
    { label: "CROSSED CLUE 2", count: 20, bg: "bg-[#CFFF04] text-[#1C1C1C]" },
    { label: "CLOSE TO CLUE 3", count: 10, bg: "bg-[#FFE600] text-[#1C1C1C]" },
    { label: "TICKETS REMAINING", count: "FEW LEFT", bg: "bg-[#FF0040] text-white" },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border-[3.5px] border-[#1C1C1C] w-full max-w-md flex flex-col gap-3.5 shadow-[6px_6px_0px_#1C1C1C] pointer-events-auto">
      {/* Header with Zone & Urgent Counter */}
      <div className="flex items-center justify-between border-b-2 border-[#1C1C1C]/15 pb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-black text-gray-600 uppercase tracking-wider">
            PHASE 2 // STREET LOCKDOWN
          </span>
          <span className="text-xs font-sans font-black text-[#5D00FF] uppercase">
            {emergencyZone}
          </span>
          <span className="text-[11px] font-sans font-black text-[#FF2E9A]">
            MEET AT: {meetupLocationName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FF0040] text-white border-2 border-[#1C1C1C] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#1C1C1C] animate-pulse">
          <Ticket className="w-4 h-4 text-white" />
          <span className="text-xs font-mono font-black uppercase">
            FEW PASSES LEFT!
          </span>
        </div>
      </div>

      {/* Page 11 High-Contrast Real-Time Street Funnel */}
      <div className="flex flex-col gap-2 bg-[#F8FAFC] border-2 border-[#1C1C1C] p-3 rounded-2xl shadow-inner">
        <span className="text-[10px] font-mono font-black uppercase text-[#1C1C1C] flex items-center gap-1">
          <span>⚡ LIVE HUNTER FUNNEL:</span>
        </span>

        <div className="flex flex-col gap-1.5">
          {funnelSteps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] ${step.bg}`}
            >
              <span className="font-sans font-black text-xs uppercase tracking-tight">
                {step.label}
              </span>
              <span
                className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-md border border-[#1C1C1C] ${
                  step.label === "TICKETS REMAINING"
                    ? "bg-white text-[#FF0040]"
                    : "bg-[#1C1C1C] text-white"
                }`}
              >
                {step.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time crowd sightings */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono font-black text-gray-700 uppercase tracking-wider">
          👀 REAL-TIME SIGHTINGS:
        </span>

        <div className="flex flex-col gap-1">
          <div className="bg-white border-2 border-[#1C1C1C] px-3 py-2 rounded-xl flex items-center justify-between shadow-sm">
            <span className="font-black text-xs text-[#1C1C1C] truncate">
              📍 2 runners spotted sprinting up Asiatic steps
            </span>
            <span className="text-[10px] font-mono font-black text-gray-600 shrink-0 ml-2">
              1m ago
            </span>
          </div>
          <div className="bg-white border-2 border-[#1C1C1C] px-3 py-2 rounded-xl flex items-center justify-between shadow-sm">
            <span className="font-black text-xs text-[#1C1C1C] truncate">
              🔥 Clue 3 envelope opened near Horniman Circle
            </span>
            <span className="text-[10px] font-mono font-black text-gray-600 shrink-0 ml-2">
              3m ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
