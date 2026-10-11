"use client";

import React from "react";
import Image from "next/image";

interface BrandCollabLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  bandhuntHeight?: number;
  taestHeight?: number;
}

export const BrandCollabLogo: React.FC<BrandCollabLogoProps> = ({
  className = "",
  size = "md",
  bandhuntHeight,
  taestHeight,
}) => {
  const actualBandhuntHeight =
    bandhuntHeight || (size === "sm" ? 20 : size === "lg" ? 32 : 24);
  const actualTaestHeight =
    taestHeight || (size === "sm" ? 14 : size === "lg" ? 22 : 17);

  return (
    <div className={`inline-flex items-center justify-center gap-2.5 select-none ${className}`}>
      {/* Bandhunt Official Logo */}
      <Image
        src="/assets/logo.png"
        alt="Bandhunt"
        width={120}
        height={32}
        style={{ height: `${actualBandhuntHeight}px`, width: "auto" }}
        className="object-contain"
        priority
      />

      {/* Comic Cross / X Collab Divider */}
      <span className="font-mono font-black text-xs sm:text-sm text-[#1C1C1C] px-1 py-0.2 rounded bg-[#CFFF04] border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C] leading-none">
        ✕
      </span>

      {/* Taest Official Black Logo */}
      <Image
        src="/assets/taest-logo-black.png"
        alt="taest.club"
        width={100}
        height={28}
        style={{ height: `${actualTaestHeight}px`, width: "auto" }}
        className="object-contain"
        priority
      />
    </div>
  );
};
