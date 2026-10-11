"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Tv, Sparkles, Trophy, Heart, Flame } from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface OfflineRecapModalProps {
  currentCity: string;
  nextCity: string;
  onClose: () => void;
}

export const OfflineRecapModal: React.FC<OfflineRecapModalProps> = ({
  currentCity,
  nextCity,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId: number;
    const totalFrames = 60 * 35; // 35 seconds simulation

    const render = () => {
      frame = (frame + 1) % totalFrames;
      setProgress(Math.round((frame / totalFrames) * 100));

      const w = canvas.width;
      const h = canvas.height;
      const sec = frame / 60;

      // Blueprint / festival background
      ctx.fillStyle = "#1B2E8C";
      ctx.fillRect(0, 0, w, h);

      // Blueprint grid dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let x = 20; x < w; x += 40) {
        for (let y = 20; y < h; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (sec < 4.0) {
        // ACT 1: Playful TV Test Card Intro
        ctx.fillStyle = "#FF2E9A";
        ctx.fillRect(30, 30, w - 60, h - 60);

        ctx.fillStyle = "#1C1C1C";
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📼 TAEST HOME VIDEO ARCHIVE 📼", w / 2, h / 2 - 25);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 20px sans-serif";
        ctx.fillText(`${currentCity.toUpperCase()} STREET HUNT RECAP!`, w / 2, h / 2 + 10);

        ctx.fillStyle = "#CFFF04";
        ctx.font = "bold 13px monospace";
        ctx.fillText("OVER 1,400 FANS SPRINTING ACROSS BANDRA 🏃💨", w / 2, h / 2 + 45);
      } else if (sec < 28.0) {
        // ACT 2: Kinetic Street Footage Simulation
        // Flashing comic festival background
        const beat = Math.sin(frame * 0.4);
        ctx.fillStyle = beat > 0.6 ? "#FF2E9A" : "#5D00FF";
        ctx.fillRect(20, 20, w - 40, h - 40);

        // Alleyway / stage mock
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(40, 50, w - 80, h - 100);

        // Fun comic confetti
        for (let i = 0; i < 15; i++) {
          const cx = (frame * 4 + i * 45) % w;
          const cy = (frame * 3 + i * 30) % h;
          ctx.fillStyle = i % 2 === 0 ? "#CFFF04" : "#FF2E9A";
          ctx.fillRect(cx, cy, 8, 8);
        }

        // Crowd Silhouette figures sprinting with neon glow
        for (let i = 0; i < 7; i++) {
          const runnerX = (w - 70) - ((frame * 7 + i * 65) % (w - 110));
          const runnerY = h - 90 + Math.sin(frame * 0.45 + i) * 6;

          ctx.fillStyle = "#1C1C1C";
          ctx.beginPath();
          ctx.arc(runnerX, runnerY - 26, 12, 0, Math.PI * 2); // head
          ctx.fill();
          ctx.fillRect(runnerX - 9, runnerY - 14, 18, 28); // body
        }

        // Glowing golden concert wristband / ticket
        ctx.fillStyle = "#FFE600";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 15, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1C1C1C";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#1C1C1C";
        ctx.font = "900 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎟️ PASS CLAIMED AT ROCK STAIRS!", w / 2, h - 60);
      } else {
        // ACT 3: Tour Bus En Route to Next City
        ctx.fillStyle = "#CFFF04";
        ctx.fillRect(20, 20, w - 40, h - 40);

        ctx.fillStyle = "#1C1C1C";
        ctx.font = "900 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`NEXT DESTINATION: ${nextCity.toUpperCase()} ✈️`, w / 2, h / 2 - 25);

        ctx.font = "bold 14px sans-serif";
        ctx.fillText("PREPARE YOUR SNEAKERS & HEADPHONES!", w / 2, h / 2 + 10);

        ctx.fillStyle = "#FF2E9A";
        ctx.font = "900 16px sans-serif";
        ctx.fillText("DROP FREQUENCY SYNCHRONIZING...", w / 2, h / 2 + 45);
      }

      // Vintage scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }

      // Live Timestamp HUD
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`📼 PLAY 00:${Math.floor(sec).toString().padStart(2, "0")}:35 // SP`, 35, 45);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentCity, nextCity]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border-[3px] border-[#1C1C1C] rounded-3xl overflow-hidden shadow-[8px_8px_0px_#1C1C1C]">
        {/* Header with centered BrandCollabLogo */}
        <div className="relative flex items-center justify-between px-5 py-3.5 bg-white border-b-[2.5px] border-[#1C1C1C]">
          <div className="flex items-center gap-2 text-[#1C1C1C]">
            <Tv className="w-4 h-4 text-[#FF2E9A]" />
            <span className="text-[11px] font-mono font-black tracking-wider uppercase">
              MUMBAI RECAP 📼
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <BrandCollabLogo size="md" />
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white text-[#1C1C1C] border-[2px] border-[#1C1C1C] hover:bg-[#FF2E9A] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1C1C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b-[2.5px] border-[#1C1C1C]">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />

          {/* Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-2 bg-black/40">
            <div
              className="h-full bg-[#CFFF04] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Lore */}
        <div className="p-5 flex flex-col gap-3.5 bg-[#FAFAFA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1C1C1C]">
              <Trophy className="w-4 h-4 text-[#FF2E9A]" />
              <span className="text-xs font-black uppercase">
                4 CONCERT PASSES CLAIMED IN MUMBAI STREETS!
              </span>
            </div>
            <span className="text-[10px] font-black bg-[#CFFF04] border border-[#1C1C1C] px-2 py-0.5 rounded-full text-[#1C1C1C]">
              35s ARCHIVE
            </span>
          </div>

          <p className="text-xs font-medium text-gray-700 leading-relaxed">
            Highlights from the chaotic offline sprint when Fred dropped the Pali Hill location clue. Delhi chapter unlocks next week!
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#5D00FF] hover:bg-[#4d00d6] text-white border-[2px] border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] transition-all cursor-pointer text-center"
          >
            BACK TO ROAD TRIP MAP 🗺️
          </button>
        </div>
      </div>
    </div>
  );
};
