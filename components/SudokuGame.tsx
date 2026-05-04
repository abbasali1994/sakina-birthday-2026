"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ---------- sudoku logic ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 6×6 grid with 2-row × 3-col boxes
function isOk(g: number[][], r: number, c: number, n: number): boolean {
  for (let i = 0; i < 6; i++) {
    if (i !== c && g[r][i] === n) return false;
    if (i !== r && g[i][c] === n) return false;
  }
  const br = Math.floor(r / 2) * 2;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 2; dr++)
    for (let dc = 0; dc < 3; dc++)
      if ((br + dr !== r || bc + dc !== c) && g[br + dr][bc + dc] === n) return false;
  return true;
}

function fill(g: number[][]): boolean {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (g[r][c] !== 0) continue;
      for (const n of shuffle([1, 2, 3, 4, 5, 6])) {
        if (isOk(g, r, c, n)) {
          g[r][c] = n;
          if (fill(g)) return true;
          g[r][c] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function countSols(g: number[][], cap = 2): number {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (g[r][c] !== 0) continue;
      let n = 0;
      for (let v = 1; v <= 6; v++) {
        if (isOk(g, r, c, v)) {
          g[r][c] = v;
          n += countSols(g, cap - n);
          g[r][c] = 0;
          if (n >= cap) return n;
        }
      }
      return n;
    }
  }
  return 1;
}

function makePuzzle() {
  const sol = Array.from({ length: 6 }, () => Array(6).fill(0) as number[]);
  fill(sol);
  const puz = sol.map((r) => [...r]);
  let removed = 0;
  for (const [r, c] of shuffle(
    Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6), i % 6] as [number, number])
  )) {
    if (removed >= 18) break;
    const bk = puz[r][c];
    puz[r][c] = 0;
    if (countSols(puz.map((x) => [...x])) === 1) removed++;
    else puz[r][c] = bk;
  }
  return { puzzle: puz, solution: sol };
}

// ---------- storage ----------

interface GS {
  puzzle: number[][];
  solution: number[][];
  userGrid: number[][];
  completedCount: number;
  bestTime: number | null;
  elapsed: number;
  done: boolean;
}

const SK = "sakinas-sudoku-v1";
const loadGS = (): GS | null => {
  try {
    const r = localStorage.getItem(SK);
    return r ? (JSON.parse(r) as GS) : null;
  } catch {
    return null;
  }
};
const saveGS = (s: GS) => {
  try {
    localStorage.setItem(SK, JSON.stringify(s));
  } catch {}
};
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---------- component ----------

export default function SudokuGame() {
  const [gs, setGs] = useState<GS | null>(null);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);

  // refs so keyboard handler always sees fresh values
  const gsR = useRef<GS | null>(null);
  const selR = useRef<[number, number] | null>(null);
  gsR.current = gs;
  selR.current = sel;

  // init from localStorage or generate fresh
  useEffect(() => {
    const saved = loadGS();
    if (saved) {
      setGs(saved);
      if (saved.done) setWon(true);
    } else {
      startNew(0, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // timer: runs only while game is active
  const isDone = gs?.done !== false;
  useEffect(() => {
    if (isDone) return;
    const id = setInterval(() => {
      setGs((p) => {
        if (!p || p.done) return p;
        const n = { ...p, elapsed: p.elapsed + 1 };
        saveGS(n);
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isDone]);

  // keyboard input — empty deps, reads state via refs
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "6") doEnter(parseInt(e.key));
      if (e.key === "Backspace" || e.key === "Delete") doErase();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew(count: number, best: number | null) {
    const { puzzle, solution } = makePuzzle();
    const s: GS = {
      puzzle,
      solution,
      userGrid: puzzle.map((r) => [...r]),
      completedCount: count,
      bestTime: best,
      elapsed: 0,
      done: false,
    };
    gsR.current = s;
    setGs(s);
    saveGS(s);
    setSel(null);
    setWon(false);
  }

  function doEnter(n: number) {
    const s = gsR.current;
    const sel = selR.current;
    if (!s || !sel || s.done) return;
    const [r, c] = sel;
    if (s.puzzle[r][c] !== 0) return; // given cell

    const ug = s.userGrid.map((x) => [...x]);
    ug[r][c] = n;

    const done = ug.every((row, ri) => row.every((v, ci) => v === s.solution[ri][ci]));
    let { completedCount: cc, bestTime: bt } = s;
    if (done) {
      cc++;
      bt = bt === null ? s.elapsed : Math.min(bt, s.elapsed);
      setWon(true);
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FF8FB1", "#E5D4FF", "#FFF1A8", "#C7F0DB"],
      });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#FF8FB1", "#E5D4FF"] });
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#FFF1A8", "#C7F0DB"] });
      }, 300);
    }

    const next: GS = { ...s, userGrid: ug, completedCount: cc, bestTime: bt, done };
    gsR.current = next;
    setGs(next);
    saveGS(next);
  }

  function doErase() {
    const s = gsR.current;
    const sel = selR.current;
    if (!s || !sel || s.done) return;
    const [r, c] = sel;
    if (s.puzzle[r][c] !== 0) return;
    const ug = s.userGrid.map((x) => [...x]);
    ug[r][c] = 0;
    const next = { ...s, userGrid: ug };
    gsR.current = next;
    setGs(next);
    saveGS(next);
  }

  if (!gs) {
    return (
      <div className="cloud-card max-w-md mx-auto h-48 flex items-center justify-center">
        <span className="handwriting text-2xl text-rose/60 animate-pulse">generating puzzle…</span>
      </div>
    );
  }

  const [sr, sc] = sel ?? [-1, -1];
  const sv = sel ? gs.userGrid[sr][sc] : 0;

  return (
    <div className="cloud-card p-4 sm:p-6 md:p-8 max-w-md mx-auto">
      {/* header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="handwriting text-3xl sm:text-4xl text-rose leading-none">Sudoku 🧩</h3>
          <p className="text-cocoa/50 text-xs mt-0.5">fill 1–6 in every row, column &amp; box</p>
        </div>
        <button
          onClick={() => startNew(gs.completedCount, gs.bestTime)}
          className="bouncy-button bg-rose text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md shadow-rose/30 flex-shrink-0"
        >
          New 🎲
        </button>
      </div>

      {/* stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip icon="⏱">{fmt(gs.elapsed)}</Chip>
        <Chip icon="🏆">{gs.completedCount} solved</Chip>
        {gs.bestTime !== null && <Chip icon="⚡">best {fmt(gs.bestTime)}</Chip>}
      </div>

      {/* grid */}
      <div className="flex justify-center mb-4">
        <div className="border-2 border-cocoa/60 rounded-lg overflow-hidden">
          {Array.from({ length: 6 }, (_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: 6 }, (_, c) => {
                const given = gs.puzzle[r][c] !== 0;
                const val = gs.userGrid[r][c];
                const err = !given && val !== 0 && !isOk(gs.userGrid, r, c, val);
                const isSel = r === sr && c === sc;
                const sameBox =
                  sel !== null &&
                  Math.floor(r / 2) === Math.floor(sr / 2) &&
                  Math.floor(c / 3) === Math.floor(sc / 3);
                const sameRC = sel !== null && (r === sr || c === sc);
                const sameNum = sv !== 0 && val === sv;

                let bg = "bg-white/60";
                if (isSel) bg = "bg-rose/40";
                else if (err) bg = "bg-red-100";
                else if (sameNum) bg = "bg-rose/25";
                else if (sameRC || sameBox) bg = "bg-rose/10";

                const rb =
                  c < 5
                    ? c === 2
                      ? "border-r-2 border-r-cocoa/50"
                      : "border-r border-r-cocoa/20"
                    : "";
                const bb =
                  r < 5
                    ? r === 1 || r === 3
                      ? "border-b-2 border-b-cocoa/50"
                      : "border-b border-b-cocoa/20"
                    : "";

                return (
                  <button
                    key={c}
                    onClick={() => {
                      if (!gs.done) setSel([r, c]);
                    }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold transition-colors handwriting select-none ${bg} ${rb} ${bb} ${given ? "text-cocoa cursor-default" : err ? "text-red-400 cursor-pointer" : "text-rose cursor-pointer"}`}
                  >
                    {val !== 0 ? val : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* number pad */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <motion.button
            key={n}
            onClick={() => doEnter(n)}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.88 }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 border-2 border-rose/40 text-rose font-bold text-base sm:text-lg handwriting shadow-sm"
          >
            {n}
          </motion.button>
        ))}
        <motion.button
          onClick={doErase}
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.88 }}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 border-2 border-cocoa/20 text-cocoa/60 text-lg shadow-sm flex items-center justify-center"
          aria-label="Erase"
        >
          ⌫
        </motion.button>
      </div>

      <p className="text-center text-cocoa/40 text-xs">
        tap a cell · tap a number · or type 1–6 on keyboard
      </p>

      {/* win banner */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mt-4 p-4 cloud-card text-center"
          >
            <p className="handwriting text-2xl sm:text-3xl text-rose">You solved it!! 🎉✨</p>
            <p className="text-cocoa/70 text-sm mt-1">
              Time: {fmt(gs.elapsed)} · Total:{" "}
              {gs.completedCount} puzzle{gs.completedCount !== 1 ? "s" : ""}
            </p>
            {gs.bestTime !== null && gs.elapsed === gs.bestTime && gs.completedCount > 1 && (
              <p className="handwriting text-rose text-lg mt-1">⚡ New best time!</p>
            )}
            <motion.button
              onClick={() => startNew(gs.completedCount, gs.bestTime)}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 bg-rose text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-rose/30"
            >
              Another one? 🧩
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="cloud-card px-2.5 py-1 !rounded-2xl !shadow-none !border-rose/30 flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <span className="handwriting text-base text-cocoa">{children}</span>
    </div>
  );
}
