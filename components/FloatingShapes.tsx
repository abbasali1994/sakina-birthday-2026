"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["🎈", "💖", "🍼", "✨", "🌸", "🧸", "👶", "🎀", "🦄", "☁️", "🌷", "💕"];

type Shape = {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

export default function FloatingShapes({ count = 22 }: { count?: number }) {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    // Honor reduced motion + smaller screens
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setShapes([]);
      return;
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const effectiveCount = isMobile ? Math.min(count, 12) : count;

    const generated = Array.from({ length: effectiveCount }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 10,
      size: (isMobile ? 14 : 18) + Math.random() * (isMobile ? 18 : 28),
    }));
    setShapes(generated);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {shapes.map((s) => (
        <span
          key={s.id}
          className="absolute bottom-[-60px] animate-floatUp select-none"
          style={{
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            fontSize: `${s.size}px`,
            filter: "drop-shadow(0 4px 6px rgba(255,143,177,0.3))",
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}
