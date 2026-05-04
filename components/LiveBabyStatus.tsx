"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES = [
  "judging everyone in the room 👀",
  "experiencing strong opinions about nothing 📢",
  "refusing to sleep (ongoing, no end in sight) 🚫💤",
  "auditing mama's life choices 🧐",
  "doing the confused face. adorably. 🤔",
  "growing at an alarming rate 📈",
  "discovering hands for the first time. again. 🤲",
  "filing unspecified complaints 📋",
  "being unbelievably cute (maximum output) 🌸",
  "conducting research on: Papa's nose 🔬",
  "perfecting the dramatic sigh 😤",
  "trying to eat her own fist. results mixed. 👊",
  "staring into the middle distance. knowingly. 🌌",
];

export default function LiveBabyStatus() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % STATUSES.length);
        setVisible(true);
      }, 350);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="cloud-card inline-flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base max-w-full">
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose" />
      </span>
      <span className="text-cocoa/60 font-bold tracking-wide text-xs uppercase flex-shrink-0">LIVE</span>
      <span className="text-cocoa/50 flex-shrink-0 text-xs">·</span>
      <span className="text-cocoa/60 text-sm flex-shrink-0">Insiya is</span>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.28 }}
            className="handwriting text-rose text-lg sm:text-xl font-semibold"
          >
            {STATUSES[idx]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
