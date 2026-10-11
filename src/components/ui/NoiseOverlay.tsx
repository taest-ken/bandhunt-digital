"use client";

import React from "react";

export const NoiseOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Subtle CRT Scanline Bars without edge darkness */}
      <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none" />
      
      {/* Ultra-subtle film grain */}
      <div className="absolute inset-0 grain-overlay opacity-25 pointer-events-none" />
      
      {/* No dark vignette edge shading - crystal clear edges for blueprint art */}
    </div>
  );
};
