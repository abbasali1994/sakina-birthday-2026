"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import FloatingShapes from "@/components/FloatingShapes";
import Countdown from "@/components/Countdown";
import BabyLetter from "@/components/BabyLetter";
import HeartGame from "@/components/HeartGame";
import BirthdayReveal from "@/components/BirthdayReveal";
import SudokuGame from "@/components/SudokuGame";
import ZipGame from "@/components/ZipGame";
import CursorSparkle from "@/components/CursorSparkle";
import LiveBabyStatus from "@/components/LiveBabyStatus";

const CONFETTI_BUTTON_LABELS = [
  { short: "🎉 Press for confetti", long: "🎉 Press for confetti (it's medically required)" },
  { short: "🎉 One more? Obviously.", long: "🎉 One more? Obviously. Doctor's orders." },
  { short: "🎉 You cannot be stopped.", long: "🎉 You cannot be stopped. This is confirmed." },
  { short: "🎉 Maximum birthday power.", long: "🎉 Maximum birthday power. Unprecedented." },
  { short: "🎉 The neighbors can hear this.", long: "🎉 The neighbors can hear this. They approve." },
  { short: "🎉 FULL SAKINA MODE ✨", long: "🎉 FULL SAKINA MODE ACTIVATED ✨ (No going back.)" },
];

function bigConfetti() {
  const colors = ["#FF8FB1", "#FFD3E0", "#E5D4FF", "#FFF1A8", "#C7F0DB"];
  confetti({
    particleCount: 220,
    spread: 100,
    origin: { y: 0.5 },
    colors,
  });
  setTimeout(() => {
    confetti({ particleCount: 120, angle: 60, spread: 75, origin: { x: 0 }, colors });
    confetti({ particleCount: 120, angle: 120, spread: 75, origin: { x: 1 }, colors });
  }, 250);
}

export default function Page() {
  const [bigDay, setBigDay] = useState(false);
  const [confettiClicks, setConfettiClicks] = useState(0);
  const [titlePopping, setTitlePopping] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -80]);
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    const t = setTimeout(() => bigConfetti(), 600);
    return () => clearTimeout(t);
  }, []);

  function handleConfettiClick() {
    bigConfetti();
    setConfettiClicks((c) => Math.min(c + 1, CONFETTI_BUTTON_LABELS.length - 1));
  }

  function handleTitleClick() {
    setTitlePopping(true);
    setTimeout(() => setTitlePopping(false), 600);
  }

  const btnLabel = CONFETTI_BUTTON_LABELS[confettiClicks];

  return (
    <main className="relative">
      <CursorSparkle />
      <FloatingShapes count={26} />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 md:py-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ y: titleY, scale: titleScale }}
          className="relative w-full max-w-3xl"
        >
          <motion.div
            animate={{ rotate: [0, -3, 3, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="inline-block"
          >
            <p className="handwriting text-3xl sm:text-4xl md:text-5xl text-rose mb-2 md:mb-4">
              a teeny tiny message made with love for
            </p>
          </motion.div>

          <h1
            className={`handwriting text-[5.5rem] xs:text-[6.5rem] sm:text-8xl md:text-[10rem] leading-none font-bold shimmer-text break-words cursor-pointer select-none ${titlePopping ? "animate-titlePop" : ""}`}
            onClick={handleTitleClick}
            title="psst. click me."
          >
            Sakina
          </h1>

          <motion.p
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-xl sm:text-2xl md:text-4xl text-cocoa/80 mt-4 md:mt-6 handwriting px-2"
          >
            …on her <span className="text-rose font-bold">very first</span> birthday as a mama 🌷
          </motion.p>

          <div className="flex justify-center gap-2 sm:gap-4 mt-6 md:mt-8 text-4xl sm:text-5xl md:text-6xl">
            {["🎂", "🎈", "🎀", "💖", "🍼"].map((e, i) => (
              <motion.span
                key={i}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 280 }}
                whileHover={{ y: -10, rotate: -10, scale: 1.2 }}
                whileTap={{ scale: 1.3, rotate: 15 }}
                className="cursor-grab inline-block"
              >
                {e}
              </motion.span>
            ))}
          </div>

          <motion.button
            onClick={handleConfettiClick}
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.94 }}
            className="mt-8 md:mt-10 bg-rose text-white px-5 py-3 md:px-8 md:py-4 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-xl shadow-rose/40 bouncy-button max-w-[90vw]"
          >
            <span className="block sm:hidden">{btnLabel.short}</span>
            <span className="hidden sm:block">{btnLabel.long}</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mt-6 md:mt-8 flex justify-center px-2"
          >
            <LiveBabyStatus />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 md:mt-10 text-cocoa/60 text-xs sm:text-sm"
          >
            ↓ scroll for ridiculous amounts of love ↓
          </motion.div>
        </motion.div>
      </section>

      {/* COUNTDOWN */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Countdown onZero={() => setBigDay(true)} />
        </div>
      </section>

      {/* THE FACTS */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="cloud-card max-w-3xl mx-auto p-5 sm:p-8 md:p-12">
          <h2 className="handwriting text-4xl sm:text-5xl text-rose text-center mb-4 sm:mb-6">
            Important Birthday Facts™
          </h2>
          <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg md:text-xl text-cocoa">
            <Fact icon="👑">
              You are turning <b>another perfect age</b>. (We don&apos;t do numbers anymore. We are vibes-based now.)
            </Fact>
            <Fact icon="🍼">
              You have officially survived <b>33 days</b> of being Insiya&apos;s mama. (As of Today. Hi.)
            </Fact>
            <Fact icon="😴">
              Approximate sleep accumulated: <b>three solid hours</b>. Spread heroically across one calendar month.
            </Fact>
            <Fact icon="💪">
              Diapers changed: <b>a lot</b>. Onesies survived: <b>fewer</b>. Hearts melted: <b>all of them</b>.
            </Fact>
            <Fact icon="🌟">
              Times you&apos;ve made our daughter smile in her sleep: <b>uncountable</b>.
            </Fact>
            <Fact icon="🎧">
              New skill unlocked: <b>identifying diaper situations by sound alone</b>. A gift you didn&apos;t ask for. A gift you now possess.
            </Fact>
            <Fact icon="🔬">
              Insiya is conducting <b>ongoing peer-reviewed research</b> into whether you&apos;ll come back if she cries. (Spoiler: you always do. Study confirmed. Results: overwhelming 💖.)
            </Fact>
            <Fact icon="⏰">
              12 AM has been <b>officially rebranded</b>. It is now called &quot;snuggle rush hour.&quot; No further questions.
            </Fact>
            <Fact icon="🏆">
              Official title, effective today: <b>Best Mama In This Dimension AND The Next™</b>. Notarized. Laminated. Framed in the kitchen of the universe.
            </Fact>
          </ul>
          <p className="mt-6 text-center text-cocoa/40 text-xs italic">
            * all facts independently verified by a baby who cannot yet talk but has very strong feelings
          </p>
        </div>
      </section>

      {/* LETTER FROM INSIYA */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-6 sm:mb-10 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-white/80 px-4 py-2 rounded-full handwriting text-lg sm:text-2xl text-rose border border-rose/30 max-w-full"
          >
            ✉️ a letter for you, dictated by a 1-month-old
          </motion.div>
        </div>
        <BabyLetter />
      </section>

      {/* HEART GAME */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <HeartGame />
      </section>

      {/* SUDOKU */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-6 sm:mb-10 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-white/80 px-4 py-2 rounded-full handwriting text-lg sm:text-2xl text-rose border border-rose/30 max-w-full"
          >
            🧩 a tiny sudoku, for your giant brain, play as much as you like
          </motion.div>
        </div>
        <SudokuGame />
      </section>

      {/* ZIP */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-6 sm:mb-10 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-white/80 px-4 py-2 rounded-full handwriting text-lg sm:text-2xl text-rose border border-rose/30 max-w-full"
          >
            🔗 zip it up · connect the dots · fill the grid
          </motion.div>
        </div>
        <ZipGame />
      </section>

      {/* PRESENT REVEAL */}
      {/* <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        <BirthdayReveal />
      </section> */}

      {/* FOOTER */}
      <footer className="relative z-10 px-4 sm:px-6 py-10 sm:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cloud-card max-w-2xl mx-auto p-6 sm:p-8"
        >
          <p className="handwriting text-2xl sm:text-3xl md:text-4xl text-rose">
            built with extremely tired love by Abbas + Insiya 💕
          </p>
          <p className="text-cocoa/70 mt-3 text-sm sm:text-base">
            (Insiya contributed by sleeping. Critical infrastructure work.)
          </p>
          <div className="mt-5 sm:mt-6 flex justify-center gap-1 sm:gap-2 text-2xl sm:text-3xl">
            <span className="animate-wiggle inline-block">🌷</span>
            <span className="animate-wiggle inline-block" style={{ animationDelay: "0.3s" }}>
              🎀
            </span>
            <span className="animate-wiggle inline-block" style={{ animationDelay: "0.6s" }}>
              💖
            </span>
            <span className="animate-wiggle inline-block" style={{ animationDelay: "0.9s" }}>
              🍼
            </span>
            <span className="animate-wiggle inline-block" style={{ animationDelay: "1.2s" }}>
              🌷
            </span>
          </div>
        </motion.div>
      </footer>

      {bigDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 cloud-card px-3 py-2 sm:px-5 sm:py-3 handwriting text-base sm:text-2xl text-rose max-w-[90vw]"
        >
          🎉 it&apos;s officially May 5! GO HUG HER!
        </motion.div>
      )}
    </main>
  );
}

function Fact({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="flex gap-3 sm:gap-4 items-start"
    >
      <span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
      <span className="leading-snug">{children}</span>
    </motion.li>
  );
}
