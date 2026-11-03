"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Sparkles,
  Ticket,
  MessageCircle,
  MapPin,
  Instagram,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface PhysicalDropRSVPModalProps {
  onClose: () => void;
}

export const PhysicalDropRSVPModal: React.FC<PhysicalDropRSVPModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText("TAESTACTUALLIFE20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRSVP = () => {
    // Retrieve player phone from localStorage if stored from landing page
    let playerPhone = "";
    try {
      playerPhone = localStorage.getItem("bandhunt_player_phone") || "";
    } catch {}

    // Track this offline RSVP in database (List 2: Mumbai Offline Bandhunt Registrations)
    try {
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: playerPhone || "Registered Player",
          suggestedCity: "Mumbai",
          source: "mumbai_offline_registration",
          submittedBy: "Mumbai Offline RSVP (offlyn.life)",
          levelUnlocked: 6,
        }),
      }).catch((e) => console.warn("RSVP tracking error:", e));
    } catch {}

    // Redirect to the official Offlyn event page
    window.open("https://offlyn.life/e/PtKgUuh", "_blank");
  };

  const addToGoogleCalendar = () => {
    const title = encodeURIComponent("Fred Again.. Offline Bombay Bandhunt");
    const details = encodeURIComponent(
      "The official offline Bombay Bandhunt by taest.club! Use coupon code: TAESTACTUALLIFE20 for a flat discount on our offline scavenger hunt experience at https://offlyn.life/e/PtKgUuh"
    );
    const location = encodeURIComponent("Outside Taj Palace, Mumbai, Maharashtra, India");
    const start = "20261114T110000Z";
    const end = "20261114T150000Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#1C1C1C] overflow-hidden flex flex-col items-center gap-3.5 sm:gap-4 my-auto text-center">
        {/* Top Header: Centered BrandCollabLogo & Close Button */}
        <div className="relative w-full flex items-center justify-between border-b-2 border-[#1C1C1C]/15 pb-2.5">
          <div className="w-6" /> {/* Spacer for symmetry */}

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <BrandCollabLogo size="md" />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white text-[#1C1C1C] border-2 border-[#1C1C1C] hover:bg-[#FF2E9A] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1C1C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Title & Unlocked Announcement */}
        <div className="flex flex-col gap-1.5 text-center items-center w-full">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-[#CFFF04] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C]">
              OFFLINE BANDHUNT UNLOCKED 🎟️
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-snug">
            Congratulations! You’re all set to attend the offline Bombay Bandhunt.
          </h2>
        </div>

        {/* Subheading & Copiable Coupon Code Box */}
        <div className="flex flex-col items-center gap-1.5 w-full bg-[#F5F8FF] border-2 border-[#1C1C1C] rounded-2xl p-3 sm:p-3.5 shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-xs sm:text-[13px] font-sans font-bold text-gray-800">
            Use the coupon code:
          </span>

          {/* Interactive Copiable Code Badge */}
          <div className="relative flex items-center justify-between gap-2.5 w-full max-w-[260px] bg-[#FFE600] border-2 border-[#1C1C1C] rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#1C1C1C]">
            <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-[#1C1C1C] select-all">
              TAESTACTUALLIFE20
            </span>
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="px-2 py-0.5 rounded-lg bg-white hover:bg-gray-100 active:scale-95 border border-[#1C1C1C] text-[10px] font-mono font-black uppercase text-[#1C1C1C] flex items-center gap-1 cursor-pointer transition-all shadow-[1px_1px_0px_#1C1C1C]"
              title="Copy coupon code"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          <span className="text-xs sm:text-[12px] font-sans font-medium text-gray-700 leading-snug text-center">
            for a flat discount on our offline scavenger hunt experience.
          </span>
        </div>

        {/* Event Details Card: Location & Date */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2 w-full text-left shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-black text-[#1C1C1C]">
            <MapPin className="w-4 h-4 text-[#5D00FF] shrink-0" />
            <span>Outside Taj Palace, Mumbai</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-black text-[#1C1C1C]">
            <Calendar className="w-4 h-4 text-[#FF2E9A] shrink-0" />
            <span>Date: 14th November</span>
          </div>
        </div>

        {/* RSVP Section (No input box, redirects to offlyn.life) */}
        <div className="bg-[#FFF8F0] border-2 border-[#1C1C1C] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 w-full shadow-[3px_3px_0px_#1C1C1C]">
          <div className="flex items-center justify-center text-center">
            <span className="text-xs sm:text-[13px] font-sans font-black uppercase text-[#FF0040] flex items-center justify-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#FF0040]" />
              <span>Only a few spots left for the offline Bombay Bandhunt</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleRSVP}
            className="w-full py-3.5 px-4 rounded-xl bg-[#CFFF04] hover:bg-[#bcf000] text-[#1C1C1C] font-black text-sm uppercase border-[2.5px] border-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 y2k-btn-bounce"
          >
            <span>RSVP NOW!</span>
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Calendar Add Button */}
        <button
          onClick={addToGoogleCalendar}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 text-[#1C1C1C] font-black text-xs uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#5D00FF]" />
          <span>ADD TO GOOGLE CALENDAR</span>
        </button>

        {/* Action Links Row: WhatsApp + Instagram */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Join WA Channel */}
          <a
            href="https://chat.whatsapp.com/EM12Mf0PE6J007pdF1w1Ne?s=cl&p=a&mlu=4&ilr=4"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-[11px] uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>JOIN WA CHANNEL</span>
          </a>

          {/* Follow taest on IG */}
          <a
            href="https://instagram.com/taest.club"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white font-black text-[11px] uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>FOLLOW ON IG</span>
          </a>
        </div>
      </div>
    </div>
  );
};
