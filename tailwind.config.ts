import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121A52", // Blueprint denim navy
        "blueprint-dark": "#0B113B",
        "blueprint-blue": "#1B2E8C",
        "blueprint-chalk": "#E2E8F8",
        surface: "#FFFFFF",
        hitmap: {
          fuchsia: "#FF2E9A",
          indigo: "#5D00FF",
          lime: "#CFFF04",
          graphite: "#1C1C1C",
          denim: "#1B2E8C",
          pink: "#FF70BA",
          yellow: "#FFE600",
        },
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "Helvetica", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        bubble: ["Impact", "Arial Black", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        sticker: "4px 4px 0px #1C1C1C",
        "sticker-lg": "6px 6px 0px #1C1C1C",
        "sticker-sm": "2.5px 2.5px 0px #1C1C1C",
        "sticker-glow": "0 0 25px rgba(255, 46, 154, 0.45), 4px 4px 0px #1C1C1C",
        "sticker-lime": "0 0 25px rgba(207, 255, 4, 0.45), 4px 4px 0px #1C1C1C",
      },
      keyframes: {
        "sticker-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(1.5deg)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(4px, -6px) rotate(-1.5deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        }
      },
      animation: {
        "sticker-bounce": "sticker-bounce 2.2s ease-in-out infinite",
        "radar-sweep": "radar-sweep 5s linear infinite",
        "float-slow": "float-slow 3s ease-in-out infinite",
        "wiggle": "wiggle 0.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
