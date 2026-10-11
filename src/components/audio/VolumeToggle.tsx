"use client";

import React, { useState } from "react";
import { getHitmapAudioEngine } from "@/lib/audio/audioGraph";
import { Volume2, VolumeX } from "lucide-react";

export const VolumeToggle: React.FC = () => {
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const engine = getHitmapAudioEngine();
    const newMuteState = engine.toggleMute();
    setMuted(newMuteState);
  };

  return (
    <button
      onClick={toggle}
      title={muted ? "Unmute Beats" : "Mute Beats"}
      className="y2k-sticker p-2 border-2 border-[#1C1C1C] hover:bg-[#F2F5FF] y2k-btn-bounce transition-all flex items-center justify-center cursor-pointer shadow-sticker"
    >
      {muted ? (
        <VolumeX className="w-4 h-4 text-[#FF2E9A]" />
      ) : (
        <Volume2 className="w-4 h-4 text-[#5D00FF]" />
      )}
    </button>
  );
};
