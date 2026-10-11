"use client";

import React, { useState, useEffect } from "react";
import { Clock, Timer } from "lucide-react";

interface GlobalCountdownProps {
  initialRemainingMs: number;
  onExpire?: () => void;
}

export const GlobalCountdown: React.FC<GlobalCountdownProps> = ({
  initialRemainingMs,
  onExpire,
}) => {
  const [remainingMs, setRemainingMs] = useState(initialRemainingMs);

  useEffect(() => {
    setRemainingMs(initialRemainingMs);
  }, [initialRemainingMs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  // Format ms to HH:MM:SS
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  return (
    <div className="tactical-glass px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
      <Timer className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
          GLOBAL ROTATION IN
        </span>
        <span className="text-sm font-mono font-bold tracking-widest text-cyan-300">
          {formatted}
        </span>
      </div>
    </div>
  );
};
