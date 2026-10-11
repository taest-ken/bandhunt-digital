"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Share2,
  Sparkles,
  MapPin,
  CheckCircle2,
  Send,
  RotateCcw,
  Play,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Download,
  Calendar,
  Ticket,
} from "lucide-react";
import { BrandCollabLogo } from "@/components/ui/BrandCollabLogo";

interface RewardModalProps {
  spotNumber?: number;
  targetName: string;
  locationName?: string;
  catchphrase: string;
  clueText?: string;
  storyTitle?: string;
  imageUrl?: string;
  isFinalNode?: boolean;
  timeRemainingMs: number;
  onClose: () => void;
  onNextLevel?: () => void;
  onHuntAgain?: () => void;
  onOpenRSVP?: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  spotNumber = 1,
  targetName,
  locationName = "Mumbai Landmark",
  catchphrase,
  clueText,
  storyTitle,
  imageUrl,
  isFinalNode = false,
  timeRemainingMs,
  onClose,
  onNextLevel,
  onHuntAgain,
  onOpenRSVP,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [secondsLeft, setSecondsLeft] = useState(59);

  // Individual 59-second countdown when modal is viewed
  useEffect(() => {
    setSecondsLeft(59);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [spotNumber]);

  // Fallback image map
  const defaultImageMap: Record<number, string> = {
    74: "/assets/nodes/spot1_andheri.jpg",
    118: "/assets/nodes/spot2_dadar.jpg",
    162: "/assets/nodes/spot3_paagal_pan.jpg",
    89: "/assets/nodes/spot4_chor_bazaar.jpg",
    147: "/assets/nodes/spot5_marine_drive.jpg",
    195: "/assets/nodes/spot6_asiatic_library.jpg",
    1: "/assets/nodes/spot1_andheri.jpg",
    2: "/assets/nodes/spot2_dadar.jpg",
    3: "/assets/nodes/spot3_paagal_pan.jpg",
    4: "/assets/nodes/spot4_chor_bazaar.jpg",
    5: "/assets/nodes/spot5_marine_drive.jpg",
    6: "/assets/nodes/spot6_asiatic_library.jpg",
  };

  const currentImage = imageUrl || defaultImageMap[spotNumber] || "/assets/nodes/spot1_andheri.jpg";

  // Story titles from k.pdf
  const defaultTitleMap: Record<number, string> = {
    74: "FRED JUST GOT DOWN A MOVING LOCAL TRAIN",
    118: "FRED JUST WALKED DADAR FLOWER MARKET WITHOUT BEING PICKPOCKETED",
    162: "SOMEONE GIVE FRED AN AADHAR CARD ALREADY. HE JUST ATE A FIRE PAAN AT PAAGAL PANWAADI",
    89: "THE FORTUNE-TELLING WEIGHT MACHINES IN CHOR BAZAAR JUST TOLD FRED HIS FORTUNE",
    147: "FRED JUST GOT A SEA-VIEW TEL-MAALISH AT MARINE DRIVE PROMENADE",
    195: "FRED JUST ROMANCED A GIRL ON THE ASIATIC LIBRARY STAIRS",
  };

  const displayTitle = storyTitle || defaultTitleMap[spotNumber] || targetName;

  // Social Share & Crowdsource Pitch States
  const [copiedShare, setCopiedShare] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [pitchText, setPitchText] = useState("");
  const [pitchSubmitted, setPitchSubmitted] = useState(false);
  const [isPlayingFallback, setIsPlayingFallback] = useState(false);

  // Procedural 2D Animated Cartoon Loop (Fallback when user clicks replay)
  useEffect(() => {
    if (!isPlayingFallback) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#152066";
      ctx.fillRect(0, 0, w, h);

      // Warm festival glow
      const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.7);
      grad.addColorStop(0, "rgba(255, 46, 154, 0.4)");
      grad.addColorStop(1, "rgba(21, 32, 102, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Swaying Marigold Garlands
      const sway = Math.sin(frame * 0.05) * 8;
      for (let i = 0; i < 7; i++) {
        const x = 30 + i * 45;
        const garlandLength = 90 + (i % 3) * 20;

        ctx.strokeStyle = "#CFFF04";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.quadraticCurveTo(x + sway, garlandLength / 2, x, garlandLength);
        ctx.stroke();

        for (let j = 15; j < garlandLength; j += 18) {
          ctx.fillStyle = j % 36 === 0 ? "#FF8A00" : "#FFE600";
          ctx.beginPath();
          ctx.arc(x + Math.sin(j + frame * 0.05) * 4, j, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1C1C1C";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Fred Again Cartoon Character Figure
      const charX = w / 2;
      const bounce = Math.sin(frame * 0.12) * 6;
      const charY = h / 2 + 10 + bounce;

      // Shadow on floor
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(charX, h - 25, 45, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.fillStyle = "#FF2E9A";
      ctx.beginPath();
      ctx.roundRect(charX - 22, charY - 10, 44, 48, 10);
      ctx.fill();
      ctx.strokeStyle = "#1C1C1C";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Head
      ctx.fillStyle = "#FFE0BD";
      ctx.beginPath();
      ctx.arc(charX, charY - 32, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1C1C1C";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Hair
      ctx.fillStyle = "#4A2E18";
      ctx.beginPath();
      ctx.arc(charX, charY - 38, 20, Math.PI, Math.PI * 2);
      ctx.fill();

      // DJ Headphones
      ctx.strokeStyle = "#CFFF04";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(charX, charY - 36, 23, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();

      // Smile
      ctx.fillStyle = "#D62828";
      ctx.beginPath();
      ctx.arc(charX, charY - 26, 6, 0, Math.PI);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingFallback]);

  // Handle Share to specific platforms
  const handlePlatformShare = (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://bandhunt.taest.club";
    const shareText = `🎯 I just unlocked Level ${spotNumber}: ${displayTitle} on Fred Again's India Tour Bandhunt!\nGive Fred his first real India tour: ${url}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "instagram") {
      // Trigger card download and open IG
      handleDownloadCard();
      setTimeout(() => {
        window.open("https://instagram.com/taest.club", "_blank");
      }, 500);
    } else if (platform === "youtube") {
      window.open("https://www.youtube.com/@taestclub", "_blank");
    }
  };

  // Download Story Card for Instagram
  const handleDownloadCard = () => {
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `FredAgain_Bandhunt_Spot${spotNumber}.jpg`;
    link.click();
    setCopiedShare("Instagram Story Card Downloaded! 📸");
    setTimeout(() => setCopiedShare(null), 3000);
  };

  // Handle Fan Vote Pitch Submission
  const handlePitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchText.trim()) return;

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestedCity: selectedCity,
          experienceDescription: pitchText,
          submittedBy: "Fred Fan",
        }),
      });

      if (res.ok) {
        setPitchSubmitted(true);
      }
    } catch (err) {
      console.error("Pitch error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border-[3.5px] border-[#1C1C1C] rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_#1C1C1C] flex flex-col gap-4 my-auto">
        {/* 1. Top Logo Unit: BrandCollabLogo center-aligned, Level left-aligned, Close right-aligned */}
        <div className="relative flex items-center justify-between border-b-2 border-[#1C1C1C]/15 pb-2.5">
          <span className="text-[11px] font-mono font-black uppercase px-2.5 py-1 rounded bg-[#CFFF04] border border-[#1C1C1C] text-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C]">
            Level {spotNumber}
          </span>

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

        {/* 2. Pixel Artwork Illustration / Video Window */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-[2.5px] border-[#1C1C1C] shadow-inner bg-[#152066]">
          {isPlayingFallback ? (
            <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt={displayTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Badge over artwork */}
          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
            <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 bg-white text-[#1C1C1C] border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] rounded-md">
              ★ {locationName}
            </span>
          </div>

          {/* Replay Overlay Button */}
          <button
            onClick={() => setIsPlayingFallback(!isPlayingFallback)}
            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-sans font-black uppercase flex items-center gap-1 border border-white/40 cursor-pointer transition-all"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>{isPlayingFallback ? "Show Art" : "Replay video"}</span>
          </button>
        </div>

        {/* 3. Node Revealed Story Title & Lore - Center Aligned */}
        <div className="flex flex-col gap-1 text-center items-center">
          <h2 className="text-base sm:text-lg font-black font-sans uppercase tracking-tight text-[#1C1C1C] leading-snug">
            {displayTitle}
          </h2>
          <p className="text-xs font-sans text-gray-700 font-medium leading-relaxed">
            &ldquo;{catchphrase}&rdquo;
          </p>
        </div>

        {/* 4. Hindi Branding Banner with line break */}
        <div className="bg-[#F8FAFC] border-2 border-[#1C1C1C] rounded-2xl p-3 text-center flex flex-col gap-1 shadow-[2px_2px_0px_#1C1C1C]">
          <p className="text-xs sm:text-[13px] font-sans font-bold text-[#1C1C1C] leading-relaxed">
            Your hunt for fred&apos;s India tour bands,
            <br />
            just gave him his first real{" "}
            <span className="text-[#FF2E9A] font-black text-sm sm:text-base inline-block px-1">
              इंडिया टूर
            </span>
            .
          </p>
        </div>

        {/* 5. Follow taest.club IG and WA Channel Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://instagram.com/taest.club"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] text-[11px] font-sans font-black uppercase text-[#1C1C1C] flex items-center justify-center gap-1.5 transition-all"
          >
            <Instagram className="w-4 h-4 text-[#E1306C]" />
            <span>Follow on IG</span>
          </a>
          <a
            href="https://whatsapp.com/channel/0029Va9y6XU0VycF8v8R6D1O"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] text-[11px] font-sans font-black uppercase text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Join WA Channel</span>
          </a>
        </div>

        {/* 6. Social Share Row + Story Card Download */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-black text-gray-500 uppercase">
            <span>SHARE THIS LEVEL:</span>
            {copiedShare && (
              <span className="text-[#FF2E9A] font-bold animate-pulse">
                {copiedShare}
              </span>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            <button
              onClick={() => handlePlatformShare("instagram")}
              className="py-2 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Share to Instagram Stories"
            >
              <Instagram className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePlatformShare("whatsapp")}
              className="py-2 rounded-xl bg-[#25D366] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePlatformShare("twitter")}
              className="py-2 rounded-xl bg-[#000000] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Share on X"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePlatformShare("youtube")}
              className="py-2 rounded-xl bg-[#FF0000] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Watch on YouTube"
            >
              <Youtube className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePlatformShare("linkedin")}
              className="py-2 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePlatformShare("facebook")}
              className="py-2 rounded-xl bg-[#1877F2] text-white flex items-center justify-center border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7. Community Signup Box (City names removed from copy; Goa removed from selector) */}
        <div className="bg-[#F5F8FF] border-2 border-[#1C1C1C] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-[3px_3px_0px_#1C1C1C]">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-sans font-black uppercase text-[#5D00FF]">
              ★ JOIN THE OFFLINE BANDHUNT
            </span>
            <p className="text-xs font-sans font-bold text-[#1C1C1C] leading-snug">
              Sign up for invites to the offline bandhunt event in your city. Solve clues, hunt tickets, find your tribe. Follow taest.club.
            </p>
          </div>

          {pitchSubmitted ? (
            <div className="bg-[#CFFF04] border border-[#1C1C1C] rounded-xl p-2.5 text-center text-xs font-black uppercase text-[#1C1C1C] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>YOU&apos;RE ON THE TRIBE DISPATCH LIST! 🎉</span>
            </div>
          ) : (
            <form onSubmit={handlePitchSubmit} className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1">
                {["Mumbai", "Delhi", "Bengaluru"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border border-[#1C1C1C] cursor-pointer transition-colors ${
                      selectedCity === city
                        ? "bg-[#5D00FF] text-white shadow-[1px_1px_0px_#1C1C1C]"
                        : "bg-white text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={pitchText}
                  onChange={(e) => setPitchText(e.target.value)}
                  placeholder={`WhatsApp number or email for ${selectedCity} drop alerts...`}
                  required
                  className="flex-1 px-3 py-1.5 rounded-xl border-2 border-[#1C1C1C] bg-white text-xs font-bold text-[#1C1C1C] placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#CFFF04] hover:bg-[#b8e600] text-[#1C1C1C] font-black text-xs uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 8. Individual 59s Timer / Hunt Next Level / Offline Bandhunt Milestone Button */}
        {secondsLeft > 0 ? (
          <div className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] border-2 border-[#1C1C1C] text-[#1C1C1C] font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1C1C1C]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF2E9A] animate-ping" />
            <span>
              Next known location of the band unlocks in 00:00:
              {secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </span>
          </div>
        ) : spotNumber >= 6 || isFinalNode ? (
          <button
            onClick={() => {
              onClose();
              if (onOpenRSVP) onOpenRSVP();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FFE600] hover:bg-[#fed900] active:scale-98 text-[#1C1C1C] font-black text-xs sm:text-sm uppercase border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] flex items-center justify-center gap-2 transition-all cursor-pointer animate-bounce"
          >
            <Ticket className="w-4 h-4" />
            <span>That’s it. You just unlocked the location of Mumbai’s offline Bandhunt. ➔</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onClose();
              if (onNextLevel) onNextLevel();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-[#CFFF04] hover:bg-[#bceb00] active:scale-98 text-[#1C1C1C] font-black text-xs sm:text-sm uppercase border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
          >
            <span>HUNT NEXT LEVEL ({spotNumber + 1}) ➔</span>
          </button>
        )}

        {/* 9. Hunt This Spot Again Button */}
        {onHuntAgain && (
          <button
            onClick={onHuntAgain}
            className="w-full py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-[#1C1C1C] font-black text-[11px] uppercase border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>HUNT THIS LEVEL AGAIN 🔄</span>
          </button>
        )}
      </div>
    </div>
  );
};
