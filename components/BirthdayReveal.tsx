"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const SURPRISES = [
  {
    emoji: "🎂",
    title: "A whole cake",
    body: "Hand-picked by Insiya. (She picked the one closest to her face.)",
  },
  {
    emoji: "💌",
    title: "31 things I love about you",
    body: "One for every day Insiya has been on planet Earth.",
  },
  {
    emoji: "🛁",
    title: "An uninterrupted bath",
    body: "Yes. Uninterrupted. I will hold the baby. I will hold the dog. I will hold the universe.",
  },
  {
    emoji: "☕",
    title: "Coffee in bed",
    body: "Hot. The whole cup. Drunk while it is still hot. A miracle.",
  },
  {
    emoji: "🍕",
    title: "Pizza, your way",
    body: "Pineapple if you want. I won't even sigh. (I'll sigh internally.)",
  },
];

function fireConfetti() {
  const end = Date.now() + 2 * 1000;
  const colors = ["#FF8FB1", "#FFD3E0", "#E5D4FF", "#FFF1A8", "#C7F0DB", "#ffffff"];
  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 70,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function BirthdayReveal() {
  const [opened, setOpened] = useState<number[]>([]);

  const open = (i: number) => {
    if (opened.includes(i)) return;
    setOpened((o) => [...o, i]);
    fireConfetti();
  };

  const allOpened = opened.length === SURPRISES.length;

  useEffect(() => {
    if (!allOpened) return;
    const t = setTimeout(() => fireConfetti(), 400);
    return () => clearTimeout(t);
  }, [allOpened]);

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="handwriting text-3xl sm:text-4xl md:text-5xl text-rose text-center mb-2 px-2">
        Open your tiny presents 🎁
      </h3>
      <p className="text-center text-cocoa/70 mb-6 sm:mb-8 text-sm sm:text-base px-4">
        (None of them require batteries. All of them require you.)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {SURPRISES.map((s, i) => {
          const isOpen = opened.includes(i);
          return (
            <motion.button
              key={i}
              onClick={() => open(i)}
              whileHover={{ y: -6, rotate: i % 2 === 0 ? -2 : 2 }}
              whileTap={{ scale: 0.96 }}
              className="cloud-card relative p-5 sm:p-6 text-left h-44 sm:h-48 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!isOpen ? (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.4, rotate: 30 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, -6, 6, -6, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }}
                      className="text-5xl sm:text-6xl mb-2"
                    >
                      🎁
                    </motion.div>
                    <p className="handwriting text-xl sm:text-2xl text-rose">tap to open</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    className="flex flex-col h-full"
                  >
                    <div className="text-4xl sm:text-5xl mb-1 sm:mb-2">{s.emoji}</div>
                    <div className="handwriting text-xl sm:text-2xl text-rose font-bold leading-tight">
                      {s.title}
                    </div>
                    <div className="text-cocoa/80 text-xs sm:text-sm mt-1 leading-snug">
                      {s.body}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {allOpened && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="cloud-card mt-8 sm:mt-10 p-6 sm:p-8 text-center"
          >
            <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">🥹</div>
            <p className="handwriting text-2xl sm:text-3xl md:text-4xl shimmer-text font-bold leading-tight">
              You opened them all. Just like you opened my whole heart.
            </p>
            <p className="text-cocoa/70 mt-3 text-sm sm:text-base">
              Happy Birthday, Sakina. From your two biggest fans (one of them is small and currently chewing her own foot).
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
