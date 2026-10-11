"use client";

import React, { useState } from "react";
import { getHitmapAudioEngine } from "@/lib/audio/audioGraph";
import { Volume2, Sparkles, Compass, MapPin, Music } from "lucide-react";

interface AudioGateModalProps {
  onUnlocked: () => void;
}

export const AudioGateModal: React.FC<AudioGateModalProps> = ({ onUnlocked }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleEngage = async () => {
    setIsUnlocking(true);
    const engine = getHitmapAudioEngine();
    const success = await engine.unlockAudio();
    if (success) {
      onUnlocked();
    } else {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B113B]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Playful Floating Background Doodles */}
      <div className="absolute top-12 left-10 text-4xl animate-float-slow select-none opacity-80">🌸</div>
      <div className="absolute bottom-16 right-12 text-4xl animate-sticker-bounce select-none opacity-80">🎧</div>
      <div className="absolute top-1/4 right-8 text-3xl animate-wiggle select-none opacity-80">✨</div>
      <div className="absolute bottom-1/4 left-8 text-3xl animate-float-slow select-none opacity-80">🛺</div>

      <div className="relative max-w-md w-full y2k-sticker bg-white p-7 sm:p-8 rounded-3xl border-[3px] border-[#1C1C1C] shadow-sticker-lg text-center flex flex-col items-center">
        {/* Top Festival Lanyard Slot */}
        <div className="w-14 h-3 rounded-full bg-[#1C1C1C] mb-3" />

        {/* Agency Tag Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2E9A] border-2 border-[#1C1C1C] shadow-sticker-sm mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-sans font-black uppercase text-white tracking-widest">
            TAEST. DIGITAL ADVENTURE
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-xl sm:text-2xl font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-tight mb-1">
          Fred&apos;s India Tour Before The India Tour
        </h1>
        
        <p className="text-xs font-sans font-black text-[#5D00FF] tracking-wider mb-4 uppercase">
          THE HITMAP // EPISODIC SOUND QUEST 🎧
        </p>

        {/* How to Play Card */}
        <div className="w-full bg-[#F4F6FF] border-2 border-[#1C1C1C] rounded-2xl p-4 mb-5 text-left space-y-2.5 text-xs font-sans font-bold text-gray-800 shadow-sticker-sm">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">🧭</span>
            <span>Drag the center compass joystick with your thumb to pilot the blueprint map.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">🔊</span>
            <span>Listen with headphones—the louder and clearer the beat gets, the closer you are to Fred!</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">🌸</span>
            <span>Follow the needle as the radar shifts from cold indigo to hot fuchsia to unlock secret levels.</span>
          </div>
        </div>

        {/* Unlock Button */}
        <button
          onClick={handleEngage}
          disabled={isUnlocking}
          className="w-full py-4 px-6 rounded-2xl font-sans text-sm font-black tracking-wider uppercase transition-all duration-200 bg-[#CFFF04] hover:bg-[#bbf000] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-sticker y2k-btn-bounce flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {isUnlocking ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>TUNING BEATS...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-[#1C1C1C]" />
              <span>GRAB HEADPHONES &amp; UNLOCK RADAR</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-500 font-sans font-bold mt-3.5 tracking-wider uppercase">
          HEADPHONES ON // REAL-TIME SOUND SCANNER
        </p>
      </div>
    </div>
  );
};
