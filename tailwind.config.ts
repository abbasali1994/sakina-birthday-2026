import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        cream: "#FFF7F1",
        blush: "#FFD3E0",
        rose: "#FF8FB1",
        lavender: "#E5D4FF",
        butter: "#FFF1A8",
        mint: "#C7F0DB",
        cocoa: "#5C3A2E",
      },
      fontFamily: {
        display: ["'Caveat'", "'Comic Sans MS'", "cursive"],
        body: ["'Quicksand'", "system-ui", "sans-serif"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(0)" },
          "60%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(-110vh) rotate(360deg)", opacity: "0" },
        },
        sparkleFade: {
          "0%": { transform: "translate(-50%,-50%) scale(0.3)", opacity: "0" },
          "25%": { transform: "translate(-50%,-70%) scale(1.1)", opacity: "1" },
          "100%": { transform: "translate(-50%,-120%) scale(0.5)", opacity: "0" },
        },
        titlePop: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "20%": { transform: "scale(1.08) rotate(-4deg)" },
          "40%": { transform: "scale(1.12) rotate(3deg)" },
          "60%": { transform: "scale(1.06) rotate(-2deg)" },
          "80%": { transform: "scale(1.03) rotate(1deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 1.5s ease-in-out infinite",
        pop: "pop 0.4s ease-out",
        floatUp: "floatUp 12s linear infinite",
        sparkleFade: "sparkleFade 0.75s ease-out forwards",
        titlePop: "titlePop 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
