"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Calendar, Bell, Sparkles, CheckCircle2, Ticket, Users, MessageCircle, MapPin, Instagram } from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface PhysicalDropRSVPModalProps {
  onClose: () => void;
}

export const PhysicalDropRSVPModal: React.FC<PhysicalDropRSVPModalProps> = ({ onClose }) => {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(21);

  // Fetch live count from backend (fallback to minimum 21)
  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.totalPitches === "number") {
          setRegisteredCount(Math.max(21, 21 + data.totalPitches));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestedCity: "Mumbai",
          experienceDescription: contact.trim(),
          submittedBy: "Offline Bandhunt RSVP",
          source: "offline_bandhunt_modal",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setRegisteredCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("RSVP error:", err);
      // Still show confirmed for great UX
      setSubmitted(true);
      setRegisteredCount((prev) => prev + 1);
    }
  };

  const addToGoogleCalendar = () => {
    const title = encodeURIComponent("Fred Again.. Offline Bandhunt: Mumbai Chapter");
    const details = encodeURIComponent(
      "The official Mumbai offline Bandhunt by taest.club! Real concert wristbands will be given away. Unlocked location: Asiatic Society Library."
    );
    const location = encodeURIComponent("Asiatic Society Library, Fort, Mumbai, Maharashtra, India");
    const start = "20261101T110000Z";
    const end = "20261101T150000Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  // Ambiguous progress calculation: starts at 64% at count 21, gradually grows, capped at 88%
  const progressPercent = Math.min(88, Math.max(64, 64 + (registeredCount - 21) * 1.5));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_#1C1C1C] overflow-hidden flex flex-col gap-4 my-auto">
        {/* Top Header: Centered BrandCollabLogo & Close Button */}
        <div className="relative flex items-center justify-between border-b-2 border-[#1C1C1C]/15 pb-2.5">
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
        <div className="flex flex-col gap-1 text-center items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-[#CFFF04] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C]">
              OFFLINE BANDHUNT UNLOCKED 🎟️
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-snug mt-1">
            CONGRATULATIONS, MUMBAI OFFLINE BANDHUNT LOCATION UNLOCKED!
          </h2>
          <p className="text-xs font-sans text-gray-700 font-medium leading-relaxed">
            Offline bandhunt is where real concert wristbands will be given away.
          </p>
        </div>

        {/* Event Details Card: Unlocked Location pushed to top, followed by date */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-4 flex flex-col gap-3 shadow-[3px_3px_0px_#1C1C1C]">
          <div className="flex items-center gap-2.5 text-xs font-black text-[#1C1C1C]">
            <MapPin className="w-4 h-4 text-[#5D00FF] shrink-0" />
            <span>UNLOCKED LOCATION: ASIATIC SOCIETY LIBRARY</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-black text-[#1C1C1C]">
            <Calendar className="w-4 h-4 text-[#FF2E9A] shrink-0" />
            <span>DATE: TO BE ANNOUNCED</span>
          </div>

          {/* Ambiguous Total Capacity with Minimum 21 Count */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1C1C1C]/10">
            <div className="flex items-center justify-between text-xs font-black text-[#1C1C1C]">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#FF2E9A]" />
                <span className="font-mono text-[11px] bg-[#CFFF04] px-2 py-0.5 rounded border border-[#1C1C1C]">
                  {registeredCount} ALREADY REGISTERED
                </span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#FF0040] uppercase animate-pulse">
                Slots exhausting rapidly
              </span>
            </div>

            {/* Dynamic Progress bar (never full, no % text) */}
            <div className="w-full h-3 rounded-full bg-gray-200 border border-[#1C1C1C] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5D00FF] to-[#FF2E9A] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>Demand Accelerating</span>
              <span>Slots Exhausting Rapidly</span>
            </div>
          </div>
        </div>

        {/* Form or Confirmation */}
        {submitted ? (
          <div className="bg-[#CFFF04] border-2 border-[#1C1C1C] rounded-full py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1C1C1C]">
            <CheckCircle2 className="w-4 h-4 text-[#1C1C1C]" />
            <span className="text-xs font-black uppercase text-[#1C1C1C]">
              YOU&apos;RE ON THE TAEST INVITE LIST! 🎉
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#1C1C1C] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#FF2E9A]" />
              <span>CLAIM INVITATION PASS:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="WhatsApp number or Email..."
                required
                className="flex-1 px-3.5 py-2 rounded-xl border-2 border-[#1C1C1C] bg-white text-xs font-bold text-[#1C1C1C] placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#CFFF04] hover:bg-[#b8e600] text-[#1C1C1C] font-black text-xs uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer whitespace-nowrap"
              >
                RSVP NOW
              </button>
            </div>
          </form>
        )}

        {/* Calendar Add Button (Precedes social links) */}
        <button
          onClick={addToGoogleCalendar}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 text-[#1C1C1C] font-black text-xs uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#5D00FF]" />
          <span>ADD TO GOOGLE CALENDAR</span>
        </button>

        {/* Action Links Row (Moved to the bottom): WhatsApp + Instagram */}
        <div className="grid grid-cols-2 gap-2">
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
