"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Sakina's birthday: May 5, 2026, midnight local time
const TARGET = new Date(2026, 4, 5, 0, 0, 0).getTime();

function diff(now: number) {
  const ms = Math.max(TARGET - now, 0);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return { ms, days, hours, minutes, seconds };
}

export default function Countdown({ onZero }: { onZero?: () => void }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = useMemo(() => (now ? diff(now) : null), [now]);

  useEffect(() => {
    if (time && time.ms === 0 && onZero) onZero();
  }, [time, onZero]);

  if (!time) return <div className="h-40" />;

  if (time.ms === 0) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-center px-2"
      >
        <div className="handwriting text-5xl sm:text-6xl md:text-8xl shimmer-text font-bold">
          IT&apos;S YOUR DAY!! 🎉
        </div>
        <p className="mt-4 text-base sm:text-xl text-cocoa/80">
          Officially the most important May 5th in human history.
        </p>
      </motion.div>
    );
  }

  const units = [
    { label: "sleeps", value: time.days },
    { label: "hours", value: time.hours },
    { label: "minutes", value: time.minutes },
    { label: "seconds", value: time.seconds },
  ];

  return (
    <div className="text-center">
      <p className="handwriting text-2xl sm:text-3xl md:text-4xl text-rose px-2">
        Your birthday is sneaking up in...
      </p>
      <div className="mt-5 sm:mt-6 grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 md:gap-5 max-w-md sm:max-w-none mx-auto">
        {units.map((u) => (
          <div
            key={u.label}
            className="cloud-card px-2 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 sm:min-w-[88px] md:min-w-[120px]"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={u.value}
                initial={{ y: -20, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0, rotate: 8 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="text-3xl sm:text-4xl md:text-6xl font-bold text-rose tabular-nums"
              >
                {String(u.value).padStart(2, "0")}
              </motion.div>
            </AnimatePresence>
            <div className="handwriting text-base sm:text-lg md:text-xl text-cocoa/70 mt-1">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-cocoa/60 italic px-4">
        (Insiya is also counting. With her toes. She has ten.)
      </p>
    </div>
  );
}
