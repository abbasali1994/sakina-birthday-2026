"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const LINES = [
  "Dear Mama,",
  "",
  "Hi. It's me. Your tiny boss. 👶",
  "I have been on this planet for 33 days now and I have a LOT of opinions.",
  "",
  "Opinion #1: You smell like home. 10/10. Five stars. Would snuggle again.",
  "Opinion #2: Your voice? A bop. The best. I could listen to you read the phone book and it would be the highlight of my day.",
  "Opinion #3: I have decided that 3 AM is comedy hour. You're welcome.",
  "",
  "Today is your birthday and I wanted to write you a letter, but my fine motor",
  "skills are still in beta, so Papa is typing for me. (He's also crying. Again.)",
  "",
  "Things I want you to know:",
  "  • You are the softest, bravest, funniest human I know.",
  "  • I picked you. Out of everyone. On purpose.",
  "  • You are doing AMAZING. Even on the days the laundry wins.",
  "",
  "Happy Birthday, Mama. You're my favorite person. Tied with Papa. Mostly. 💕",
  "",
  "All my love (and approximately 4 oz of spit-up),",
  "Insiya 🎀",
];

export default function BabyLetter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [revealedLines, setRevealedLines] = useState(0);
  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (!inView) return;
    if (revealedLines >= LINES.length) return;

    const target = LINES[revealedLines];
    if (target === "") {
      // empty line – just push and continue
      setDoneLines((d) => [...d, ""]);
      setRevealedLines((n) => n + 1);
      return;
    }

    let i = 0;
    setCurrentText("");
    const id = setInterval(() => {
      i += 1;
      setCurrentText(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(id);
        setTimeout(() => {
          setDoneLines((d) => [...d, target]);
          setCurrentText("");
          setRevealedLines((n) => n + 1);
        }, 250);
      }
    }, 22);

    return () => clearInterval(id);
  }, [inView, revealedLines]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={inView ? { opacity: 1, y: 0, rotate: -1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative cloud-card p-5 sm:p-8 md:p-12 max-w-2xl mx-auto"
      style={{
        background: "repeating-linear-gradient(transparent, transparent 26px, rgba(255,143,177,0.18) 27px)",
        backgroundColor: "#fffaf3",
      }}
    >
      {/* Tape */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-7 sm:h-8 bg-yellow-200/70 rotate-2 rounded-sm shadow-sm" />
      <div className="absolute -top-3 -left-3 w-12 sm:w-16 h-5 sm:h-6 bg-pink-200/70 -rotate-12 rounded-sm shadow-sm" />

      <div className="handwriting text-xl sm:text-2xl md:text-3xl leading-[26px] sm:leading-[30px] text-cocoa whitespace-pre-wrap break-words min-h-[480px] sm:min-h-[600px]">
        {doneLines.map((line, i) => (
          <div key={i}>{line || " "}</div>
        ))}
        {revealedLines < LINES.length && (
          <div>
            {currentText}
            <span className="inline-block w-[2px] h-5 sm:h-6 bg-rose ml-0.5 animate-pulse align-middle" />
          </div>
        )}
      </div>

      <div className="mt-5 sm:mt-6 flex justify-end">
        <div className="handwriting text-rose text-2xl sm:text-3xl rotate-[-6deg]">
          xoxo, baby I. 👶💕
        </div>
      </div>
    </motion.div>
  );
}
