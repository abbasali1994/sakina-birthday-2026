"use client";

import { useEffect, useState } from "react";

const SPARKLE_EMOJIS = ["💖", "✨", "🌸", "💕", "⭐", "🌷", "🎀", "🩷"];
let sid = 0;

type Sparkle = { id: number; x: number; y: number; emoji: string; size: number };

export default function CursorSparkle() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let lx = 0, ly = 0;
    const onMove = (e: MouseEvent) => {
      if (Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly) < 20) return;
      lx = e.clientX;
      ly = e.clientY;
      const id = sid++;
      const sp: Sparkle = {
        id,
        x: e.clientX,
        y: e.clientY,
        emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
        size: 11 + Math.random() * 13,
      };
      setSparkles((s) => [...s.slice(-24), sp]);
      setTimeout(() => setSparkles((s) => s.filter((x) => x.id !== id)), 750);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute animate-sparkleFade select-none"
          style={{ left: s.x, top: s.y, fontSize: s.size, transform: "translate(-50%,-50%)" }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}
