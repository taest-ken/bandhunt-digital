import { ColorSpectrumResult } from "@/types/hitmap";

// Y2K Festival Rave Spectrum across p in [0.0, 1.0]
// Smooth transition: Electric Indigo -> Icy Cyan -> Cyber Lime -> Yellow -> Neon Fuchsia (#FF2E9A)
export function getProximityColorSpectrum(proximity: number): ColorSpectrumResult {
  const p = Math.max(0, Math.min(1, proximity));

  // Color Stops: [threshold, r, g, b]
  const stops: [number, number, number, number][] = [
    [0.0, 93, 0, 255],     // #5D00FF - Electric Indigo (Cold)
    [0.35, 0, 240, 255],   // #00F0FF - Icy Cyan
    [0.65, 207, 255, 4],   // #CFFF04 - Cyber Lime (Warm)
    [0.85, 255, 230, 0],   // #FFE600 - Sunny Yellow (Hot)
    [1.0, 255, 46, 154],   // #FF2E9A - Neon Fuchsia (Lock-In Target)
  ];

  let r = stops[0][1];
  let g = stops[0][2];
  let b = stops[0][3];

  for (let i = 0; i < stops.length - 1; i++) {
    const [t1, r1, g1, b1] = stops[i];
    const [t2, r2, g2, b2] = stops[i + 1];

    if (p >= t1 && p <= t2) {
      const localT = (p - t1) / (t2 - t1);
      r = Math.round(r1 + (r2 - r1) * localT);
      g = Math.round(g1 + (g2 - g1) * localT);
      b = Math.round(b1 + (b2 - b1) * localT);
      break;
    }
  }

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  const glow = `0 0 24px rgba(${r}, ${g}, ${b}, 0.55), 4px 4px 0px #1C1C1C`;
  const fillRgba = `rgba(${r}, ${g}, ${b}, 0.22)`;

  // Pulse speed in seconds
  const pulseSpeed = Math.max(0.2, 2.0 - p * 1.8);

  // 1 to 5 signal strength bars
  const signalBars = Math.min(5, Math.max(1, Math.ceil(p * 5)));

  return {
    hex,
    glow,
    fillRgba,
    pulseSpeed,
    signalBars,
  };
}
