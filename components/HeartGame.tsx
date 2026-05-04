"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const COMPLIMENTS = [
  "You laugh with your whole face. 10/10. ⭐",
  "Insiya already knows your voice in a crowded room. 🎀",
  "You make 'tired' look like a spa retreat. 💆‍♀️",
  "Your hugs are scientifically certified as therapeutic. 🤗",
  "The way you say 'hi baby' melts the planet a little. 🫠",
  "You are the calm in our small, slightly chaotic universe. 🌍",
  "I would marry you again. Every single Tuesday. 💍",
  "Your handwriting is illegal levels of cute. ✍️",
  "Insiya's first crush is you. Sorry, me. 😤",
  "You make grocery runs feel like dates. 🛒💕",
  "Even your tired sigh is a love song. 🎶",
  "Best mama in this dimension AND the next. 🌌",
];

const CONGRATS = [
  "Heart certified ✨",
  "Awwww 🥺",
  "Sakina-coded 💗",
  "Mama magic 🌷",
  "You did it 💪",
];

type Heart = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  emoji: string;
  hue: number;
};

const HEART_EMOJIS = ["💖", "💕", "💗", "💝", "🩷", "💞", "💘"];

let nextId = 0;

export default function HeartGame() {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [score, setScore] = useState(0);
  const [poppedMessages, setPoppedMessages] = useState<
    { id: number; text: string; x: number; y: number }[]
  >([]);
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawn = useCallback(() => {
    const id = nextId++;
    setHearts((h) => [
      ...h,
      {
        id,
        x: 5 + Math.random() * 90,
        delay: 0,
        duration: 4 + Math.random() * 3,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        hue: Math.floor(Math.random() * 60) - 30,
      },
    ]);
    // auto-remove after duration if not popped
    setTimeout(() => {
      setHearts((h) => h.filter((x) => x.id !== id));
    }, 7500);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(spawn, 700);
    return () => clearInterval(id);
  }, [running, spawn]);

  const popHeart = (heart: Heart, evt: React.MouseEvent<HTMLButtonElement>) => {
    setHearts((h) => h.filter((x) => x.id !== heart.id));
    setScore((s) => s + 1);

    // Find a compliment, alternating with short congrats
    const text =
      score > 0 && score % 3 === 0
        ? CONGRATS[Math.floor(Math.random() * CONGRATS.length)]
        : COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];

    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? evt.clientX - rect.left : 0;
    const y = rect ? evt.clientY - rect.top : 0;
    const msgId = nextId++;
    setPoppedMessages((m) => [...m, { id: msgId, text, x, y }]);
    setTimeout(() => {
      setPoppedMessages((m) => m.filter((x) => x.id !== msgId));
    }, 2500);

    // Tiny confetti burst
    confetti({
      particleCount: 28,
      spread: 60,
      startVelocity: 32,
      origin: {
        x: rect ? (evt.clientX - rect.left) / rect.width : 0.5,
        y: rect ? (evt.clientY - rect.top + rect.top) / window.innerHeight : 0.5,
      },
      colors: ["#FF8FB1", "#FFD3E0", "#E5D4FF", "#FFF1A8", "#C7F0DB"],
      scalar: 0.8,
    });

    if ((score + 1) % 10 === 0) {
      confetti({
        particleCount: 160,
        spread: 110,
        origin: { y: 0.6 },
        colors: ["#FF8FB1", "#FFD3E0", "#E5D4FF", "#FFF1A8", "#C7F0DB"],
      });
    }
  };

  return (
    <div className="cloud-card p-4 sm:p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <div>
          <h3 className="handwriting text-3xl sm:text-4xl text-rose">Pop the love hearts 💕</h3>
          <p className="text-cocoa/70 text-sm sm:text-base">
            Each one carries a tiny truth about you. (Warning: extremely sappy.)
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
          <div className="cloud-card px-3 py-2 sm:px-4 !rounded-2xl !shadow-none !border-rose/40">
            <span className="handwriting text-base sm:text-xl text-cocoa/70">Score: </span>
            <motion.span
              key={score}
              initial={{ scale: 1.6, color: "#FF8FB1" }}
              animate={{ scale: 1, color: "#5C3A2E" }}
              className="handwriting text-2xl sm:text-3xl font-bold inline-block"
            >
              {score}
            </motion.span>
          </div>
          <button
            onClick={() => setRunning((r) => !r)}
            className="bouncy-button bg-rose text-white px-4 py-2 sm:px-5 sm:py-3 rounded-full font-bold shadow-lg shadow-rose/40 text-sm sm:text-base whitespace-nowrap"
          >
            {running ? "Pause 🌙" : score > 0 ? "Resume ✨" : "Start 🎈"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-[320px] sm:h-[380px] md:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-dashed border-rose/40 bg-gradient-to-b from-pink-50 via-purple-50 to-yellow-50 touch-manipulation"
      >
        {!running && score === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-wiggle">🎈</div>
            <p className="handwriting text-2xl sm:text-3xl text-rose">Tap &quot;Start&quot;</p>
            <p className="text-cocoa/70 mt-1 text-sm sm:text-base">
              Hearts will float up. Tap them. Receive love. Repeat.
            </p>
          </div>
        )}

        <AnimatePresence>
          {hearts.map((h) => (
            <motion.button
              key={h.id}
              onClick={(e) => popHeart(h, e)}
              initial={{ y: 420, opacity: 0, scale: 0.6 }}
              animate={{ y: -80, opacity: 1, scale: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{
                duration: h.duration,
                ease: "linear",
                opacity: { duration: 0.3 },
              }}
              whileHover={{ scale: 1.25, rotate: 8 }}
              whileTap={{ scale: 0.6 }}
              className="absolute text-4xl sm:text-5xl cursor-pointer select-none p-2 -m-2"
              style={{
                left: `${h.x}%`,
                filter: `hue-rotate(${h.hue}deg) drop-shadow(0 6px 8px rgba(255,143,177,0.4))`,
              }}
              aria-label="Pop heart"
            >
              {h.emoji}
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {poppedMessages.map((m) => {
            const containerW = containerRef.current?.clientWidth ?? 0;
            const msgW = Math.min(220, containerW - 24);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -60, scale: 1 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute pointer-events-none px-2 py-2 sm:px-3 rounded-2xl bg-white/95 shadow-md border border-rose/30 text-center text-xs sm:text-sm md:text-base text-cocoa font-medium"
                style={{
                  left: Math.max(8, Math.min(m.x - msgW / 2, containerW - msgW - 8)),
                  top: m.y,
                  width: msgW,
                }}
              >
                {m.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {score >= 10 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="handwriting text-xl sm:text-2xl text-rose text-center mt-3 sm:mt-4"
        >
          ok at this point you&apos;re just showing off. keep going. 😘
        </motion.p>
      )}
    </div>
  );
}
