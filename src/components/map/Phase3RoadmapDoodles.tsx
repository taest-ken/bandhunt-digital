"use client";

import React from "react";

export const Phase3RoadmapDoodles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-15 overflow-hidden">
      {/* Hand-Drawn Chalk Smiley Sun in Top-Right Sky */}
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full pointer-events-none select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Hand-Drawn Chalk Smiley Sun safely placed in Far Top-Right Corner */}
        <g transform="translate(930, 80) scale(0.9)">
          <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2.5" />
          <ellipse cx="-9" cy="-7" rx="3" ry="5.5" fill="rgba(255, 255, 255, 0.85)" />
          <ellipse cx="9" cy="-7" rx="3" ry="5.5" fill="rgba(255, 255, 255, 0.85)" />
          <path d="M -14,9 Q 0,22 14,9" fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="-38" x2="0" y2="-32" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2" />
          <line x1="27" y1="-27" x2="22" y2="-22" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2" />
          <line x1="38" y1="0" x2="32" y2="0" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2" />
          <line x1="27" y1="27" x2="22" y2="22" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
