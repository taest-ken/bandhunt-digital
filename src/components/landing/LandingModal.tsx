"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageSquare, Phone } from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface LandingModalProps {
  onStart: (phone?: string) => void;
}

export const LandingModal: React.FC<LandingModalProps> = ({ onStart }) => {
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore saved mobile number if returning
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bandhunt_player_phone");
      if (saved) {
        setMobileNumber(saved);
      }
    } catch {}
  }, []);

  const handleStartClick = async () => {
    const trimmed = mobileNumber.trim();
    // Validate phone number: minimum 7 characters (to allow international or standard 10-digit mobile)
    const cleanedDigits = trimmed.replace(/\D/g, "");
    if (!trimmed || cleanedDigits.length < 7) {
      setErrorMsg("Please enter your mobile number to start");
      return;
    }

    setErrorMsg(null);

    // Persist phone number in localStorage
    try {
      localStorage.setItem("bandhunt_player_phone", trimmed);
    } catch {}

    // Track registration in backend database (List 1: Players & City Specific Invites)
    try {
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          contact: trimmed,
          suggestedCity: "Mumbai",
          source: "landing_page",
          submittedBy: "Landing Registration",
          levelUnlocked: 0,
        }),
      }).catch((e) => console.warn("Landing tracking error:", e));
    } catch {}

    onStart(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08123B]/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      {/* Landing Card */}
      <div className="relative w-[94%] max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#1C1C1C] flex flex-col items-center text-center gap-3.5 sm:gap-4">
        {/* Top Floating Logo Unit with Scaled-Up Center-Aligned Collab Logo */}
        <div className="w-full flex items-center justify-center border-b-2 border-[#1C1C1C]/15 pb-3 sm:pb-4 pt-1.5 overflow-hidden">
          <BrandCollabLogo bandhuntHeight={48} taestHeight={32} className="scale-110 sm:scale-125 my-1" />
        </div>

        {/* Headline & Subhead (Center Aligned) */}
        <div className="flex flex-col items-center gap-1 mt-0.5 text-center max-w-[280px] sm:max-w-xs mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-[1.15]">
            No Real Fred Fan
            <br />
            Left Behind
          </h1>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#5D00FF] uppercase tracking-wide">
            A digital game of hot &amp; cold.
          </p>
        </div>

        {/* Body Copy (1 single flowing paragraph with updated discount code copy) */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-3.5 sm:p-4 w-full flex flex-col items-center shadow-inner">
          <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-relaxed text-center">
            Move Fred along the map. Follow the heat and the beat. Keep your eyes and ears open. Find the last seen location of fredagain India tour bands.{" "}
            <strong className="font-black text-[#1C1C1C] block mt-1">
              Cross level 6 to unlock “discount code” for<br />
              the offline Bombay Bandhunt.
            </strong>
          </p>
        </div>

        {/* Dialogue Box Sticker Input + Action Button & Taped Badge */}
        <div className="w-full flex flex-col items-center gap-2.5 pt-0.5 relative">
          {/* Dialogue Box Sticker Input for Mobile Number */}
          <div className="relative w-full max-w-[290px] sm:max-w-[310px]">
            <div className="relative flex items-center bg-white border-2 border-[#1C1C1C] rounded-2xl p-1.5 shadow-[3px_3px_0px_#1C1C1C] transition-all focus-within:shadow-[4px_4px_0px_#FFE600] focus-within:border-black">
              <div className="pl-2.5 pr-1.5 text-[#1C1C1C]">
                <Phone className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStartClick();
                }}
                placeholder="Enter mobile number"
                className="w-full bg-transparent px-2 py-1 text-xs sm:text-[13px] font-mono font-black text-[#1C1C1C] placeholder:text-gray-400 placeholder:font-sans placeholder:font-bold placeholder:uppercase tracking-wider outline-none select-text pointer-events-auto"
              />
            </div>

            {/* Comic Dialogue Notch pointing downwards toward the action button */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#1C1C1C]" />
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="text-[11px] font-mono font-black text-[#FF0040] animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Grab Headphones Action Button */}
          <button
            onClick={handleStartClick}
            className="w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-[#CFFF04] hover:bg-[#bcf000] active:scale-95 text-[#1C1C1C] font-black text-xs sm:text-[13px] uppercase border-[2.5px] border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] transition-all flex items-center justify-center cursor-pointer y2k-btn-bounce"
          >
            <span className="whitespace-nowrap tracking-tight">Grab headphones &amp; start hunting.</span>
          </button>

          {/* Taped Yellow Badge "BEST FOR LAPTOP USE" */}
          <div className="self-center -mt-0.5 rotate-[-2deg]">
            <div className="taped-label text-[10px] sm:text-[11px] font-sans font-black uppercase px-2.5 sm:px-3 py-1 bg-[#FFE600] text-[#1C1C1C] border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
              ★ BEST FOR LAPTOP USE
            </div>
          </div>
        </div>

        {/* Sticker 1: Halftone Headphones - Bottom-Left Corner */}
        <div className="absolute -bottom-4 sm:-bottom-6 -left-7 sm:-left-9 w-[110px] sm:w-[130px] h-[148px] sm:h-[175px] pointer-events-none rotate-[-10deg] drop-shadow-[6px_6px_0px_#1C1C1C] z-30">
          <Image
            src="/assets/stickers/headphones.png"
            alt="Headphones"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Sticker 2: Pink Pixel Ticket - Bottom-Right Corner */}
        <div className="absolute -bottom-5 sm:-bottom-7 -right-5 sm:-right-7 w-[120px] sm:w-[145px] h-[111px] sm:h-[134px] pointer-events-none rotate-[5deg] drop-shadow-[6px_6px_0px_#1C1C1C] z-30">
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
