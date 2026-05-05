"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ---------- puzzle definitions ----------
// All puzzles are 7×7 (49 cells) with 10 numbered waypoints.
// Each waypoint must be visited in order 1→10, and every cell must be filled.
//
// Solutions are Hamiltonian paths verified by construction:
// waypoints are placed at path indices [0,5,10,15,20,25,30,35,40,48].

interface Puzzle {
  size: number;
  waypoints: [number, number][]; // positions of 1,2,…,10 in order
  label: string;
}

const PUZZLES: Puzzle[] = [
  // Horizontal boustrophedon starting top-left
  // rows alternate →←→←→←→
  {
    size: 7,
    waypoints: [[0,0],[0,5],[1,3],[2,1],[2,6],[3,2],[4,2],[5,6],[5,1],[6,6]],
    label: "the classic",
  },
  // Vertical boustrophedon starting top-left
  // columns alternate ↓↑↓↑↓↑↓
  {
    size: 7,
    waypoints: [[0,0],[5,0],[3,1],[1,2],[6,2],[2,3],[2,4],[6,5],[1,5],[6,6]],
    label: "the columns",
  },
  // Clockwise spiral inward from top-left
  {
    size: 7,
    waypoints: [[0,0],[0,5],[4,6],[6,3],[4,0],[1,2],[3,5],[5,2],[2,2],[3,3]],
    label: "the spiral",
  },
  // Counter-clockwise spiral inward from top-right
  {
    size: 7,
    waypoints: [[0,6],[0,1],[4,0],[6,3],[4,6],[1,4],[3,1],[5,4],[2,4],[3,3]],
    label: "the whirl",
  },
  // Horizontal boustrophedon starting bottom-left, going up
  // rows alternate →←→←→←→ from row 6 up
  {
    size: 7,
    waypoints: [[6,0],[6,5],[5,3],[4,1],[4,6],[3,2],[2,2],[1,6],[1,1],[0,6]],
    label: "the climb",
  },
  // Vertical boustrophedon starting bottom-left, columns alternate ↑↓↑↓↑↓↑
  {
    size: 7,
    waypoints: [[6,0],[1,0],[3,1],[5,2],[0,2],[4,3],[4,4],[0,5],[5,5],[0,6]],
    label: "the weave",
  },
  // Horizontal boustrophedon starting top-right, going ←→←→←→←
  {
    size: 7,
    waypoints: [[0,6],[0,1],[1,3],[2,5],[2,0],[3,4],[4,4],[5,0],[5,5],[6,0]],
    label: "the mirror",
  },
  // Vertical boustrophedon starting bottom-right, columns alternate ↑↓↑↓↑↓↑
  {
    size: 7,
    waypoints: [[6,6],[1,6],[3,5],[5,4],[0,4],[4,3],[4,2],[0,1],[5,1],[0,0]],
    label: "the descent",
  },
  // Clockwise spiral inward from bottom-right
  {
    size: 7,
    waypoints: [[6,6],[6,1],[2,0],[0,3],[2,6],[5,4],[3,1],[1,4],[4,4],[3,3]],
    label: "the vortex",
  },
  // Clockwise spiral inward from bottom-left
  {
    size: 7,
    waypoints: [[6,0],[6,5],[2,6],[0,3],[2,0],[5,2],[3,5],[1,2],[4,2],[3,3]],
    label: "the loop",
  },
];

// ---------- storage ----------

const ZK = "sakinas-zip-v2"; // v2: 7×7 grid with 10 waypoints

interface ZS {
  puzzleIndex: number;
  path: [number, number][];
  completedCount: number;
  bestTime: number | null;
  elapsed: number;
  done: boolean;
}

const loadZS = (): ZS | null => {
  try {
    const r = localStorage.getItem(ZK);
    return r ? (JSON.parse(r) as ZS) : null;
  } catch {
    return null;
  }
};
const saveZS = (s: ZS) => {
  try {
    localStorage.setItem(ZK, JSON.stringify(s));
  } catch {}
};
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ---------- component ----------

export default function ZipGame() {
  const [zs, setZs] = useState<ZS | null>(null);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);

  // Refs for drag tracking — avoids stale closures in non-passive touch listener
  const isDraggingRef = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  // Always-fresh handle so the imperative touchmove listener isn't stale
  const handleCellClickRef = useRef<(r: number, c: number) => void>(() => {});

  useEffect(() => {
    const saved = loadZS();
    if (saved) {
      setZs(saved);
      if (saved.done) {
        setWon(true);
        setStarted(true);
      }
    } else {
      initNew(0, 0, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = !zs || zs.done;
  useEffect(() => {
    if (!started || isDone) return;
    const id = setInterval(() => {
      setZs((p) => {
        if (!p || p.done) return p;
        const n = { ...p, elapsed: p.elapsed + 1 };
        saveZS(n);
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, isDone]);

  function initNew(puzzleIndex: number, count: number, best: number | null) {
    const s: ZS = {
      puzzleIndex,
      path: [],
      completedCount: count,
      bestTime: best,
      elapsed: 0,
      done: false,
    };
    setZs(s);
    saveZS(s);
    setWon(false);
    setStarted(false);
  }

  function lastWpInPath(path: [number, number][], waypoints: [number, number][]): number {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      const [wr, wc] = waypoints[i];
      if (path.some(([pr, pc]) => pr === wr && pc === wc)) return i;
    }
    return -1;
  }

  function handleCellClick(r: number, c: number) {
    if (!zs || !started || zs.done) return;
    const { waypoints, size } = PUZZLES[zs.puzzleIndex];
    const path = zs.path;

    // Already in path → truncate to that cell
    const pathIdx = path.findIndex(([pr, pc]) => pr === r && pc === c);
    if (pathIdx !== -1) {
      const newPath = path.slice(0, pathIdx + 1);
      const next = { ...zs, path: newPath };
      setZs(next);
      saveZS(next);
      return;
    }

    // Empty path → must start at waypoint 1
    if (path.length === 0) {
      if (r === waypoints[0][0] && c === waypoints[0][1]) {
        const newPath: [number, number][] = [[r, c]];
        const next = { ...zs, path: newPath };
        setZs(next);
        saveZS(next);
      }
      return;
    }

    // Must be orthogonally adjacent to last cell
    const [lr, lc] = path[path.length - 1];
    if (Math.abs(r - lr) + Math.abs(c - lc) !== 1) return;

    // If cell is a waypoint, it must be the next expected one
    const wpIdx = waypoints.findIndex(([wr, wc]) => wr === r && wc === c);
    if (wpIdx !== -1 && wpIdx !== lastWpInPath(path, waypoints) + 1) return;

    const newPath: [number, number][] = [...path, [r, c]];
    const done =
      newPath.length === size * size &&
      waypoints.every(([wr, wc]) => newPath.some(([pr, pc]) => pr === wr && pc === wc));

    let cc = zs.completedCount;
    let bt = zs.bestTime;
    if (done) {
      cc++;
      bt = bt === null ? zs.elapsed : Math.min(bt, zs.elapsed);
      setWon(true);
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ["#FF8FB1","#E5D4FF","#FFF1A8","#C7F0DB"] });
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#FF8FB1","#E5D4FF"] });
        confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#FFF1A8","#C7F0DB"] });
      }, 300);
    }

    const next: ZS = { ...zs, path: newPath, completedCount: cc, bestTime: bt, done };
    setZs(next);
    saveZS(next);
  }

  // Keep the ref pointing at the latest closure so the imperative listener is never stale
  handleCellClickRef.current = handleCellClick;

  // ALL touch handling lives here so both touchstart and touchmove are non-passive.
  // React registers synthetic touch handlers passively at the root, meaning
  // e.preventDefault() in onTouchStart / onTouchMove JSX props is silently ignored —
  // the browser commits to scrolling during touchstart and nothing can stop it later.
  // By adding imperative non-passive listeners directly on the element we can call
  // preventDefault() before the browser locks in the scroll gesture.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const getCell = (touch: Touch): [number, number] | null => {
      const hit = document.elementFromPoint(touch.clientX, touch.clientY);
      const cellEl = (hit as Element | null)?.closest("[data-cell]") as HTMLElement | null;
      if (!cellEl) return null;
      const parts = (cellEl.dataset.cell ?? "").split(",").map(Number);
      return parts.length === 2 && parts.every((n) => !isNaN(n))
        ? [parts[0], parts[1]]
        : null;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // must happen in a non-passive touchstart to block scroll
      isDraggingRef.current = true;
      const cell = getCell(e.touches[0]);
      if (cell) handleCellClickRef.current(cell[0], cell[1]);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const cell = getCell(e.touches[0]);
      if (cell) handleCellClickRef.current(cell[0], cell[1]);
    };

    const onTouchEnd = () => { isDraggingRef.current = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, []); // runs once — all mutable values accessed through refs

  if (!zs) {
    return (
      <div className="cloud-card max-w-lg mx-auto h-48 flex items-center justify-center">
        <span className="handwriting text-2xl text-rose/60 animate-pulse">loading…</span>
      </div>
    );
  }

  const puzzle = PUZZLES[zs.puzzleIndex];
  const { waypoints, size } = puzzle;
  const pathSet = new Set(zs.path.map(([r, c]) => `${r},${c}`));
  const lastCell = zs.path.length > 0 ? zs.path[zs.path.length - 1] : null;
  const filled = zs.path.length;
  const total = size * size;
  const nextExpectedWp = lastWpInPath(zs.path, waypoints) + 1;

  return (
    <div className="cloud-card p-4 sm:p-6 max-w-lg mx-auto">
      {/* header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="handwriting text-3xl sm:text-4xl text-rose leading-none">Zip 🔗</h3>
          <p className="text-cocoa/50 text-xs mt-0.5">connect ① → ⑩ in order · fill every cell</p>
        </div>
        <button
          onClick={() => initNew((zs.puzzleIndex + 1) % PUZZLES.length, zs.completedCount, zs.bestTime)}
          className="bouncy-button bg-rose text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md shadow-rose/30 flex-shrink-0"
        >
          New 🎲
        </button>
      </div>

      {/* stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip icon="⏱">{fmt(zs.elapsed)}</Chip>
        <Chip icon="🏆">{zs.completedCount} solved</Chip>
        {zs.bestTime !== null && <Chip icon="⚡">best {fmt(zs.bestTime)}</Chip>}
      </div>

      {/* grid */}
      <div className="relative flex justify-center mb-3">
        <div
          ref={gridRef}
          className={`transition-all duration-300 ${!started ? "blur-sm pointer-events-none select-none" : ""}`}
          onMouseLeave={() => { isDraggingRef.current = false; }}
          onMouseUp={() => { isDraggingRef.current = false; }}
        >
          <div className="border-2 border-cocoa/40 rounded-xl overflow-hidden bg-white/30">
            {Array.from({ length: size }, (_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: size }, (_, c) => {
                  const key = `${r},${c}`;
                  const inPath = pathSet.has(key);
                  const isEnd = !!(lastCell && lastCell[0] === r && lastCell[1] === c);
                  const wpIdx = waypoints.findIndex(([wr, wc]) => wr === r && wc === c);
                  const isNextWp = wpIdx !== -1 && wpIdx === nextExpectedWp && !inPath;
                  const hasUp    = r > 0       && pathSet.has(`${r-1},${c}`);
                  const hasDown  = r < size-1  && pathSet.has(`${r+1},${c}`);
                  const hasLeft  = c > 0       && pathSet.has(`${r},${c-1}`);
                  const hasRight = c < size-1  && pathSet.has(`${r},${c+1}`);

                  return (
                    <button
                      key={c}
                      data-cell={`${r},${c}`}
                      onMouseDown={() => { isDraggingRef.current = true; handleCellClick(r, c); }}
                      onMouseEnter={() => { if (isDraggingRef.current) handleCellClick(r, c); }}
                      onClick={() => handleCellClick(r, c)}
                      className={[
                        "w-10 h-10 sm:w-12 sm:h-12 relative border border-cocoa/10 transition-colors select-none cursor-pointer",
                        inPath ? "bg-rose/10" : isNextWp ? "bg-rose/5 ring-1 ring-rose/30 ring-inset" : "bg-white/50 hover:bg-rose/5",
                      ].join(" ")}
                    >
                      {inPath && (
                        <>
                          {hasLeft  && <span className="absolute top-1/2 left-0  w-[52%] h-1.5 -translate-y-1/2 bg-rose/45 z-0 pointer-events-none" />}
                          {hasRight && <span className="absolute top-1/2 right-0 w-[52%] h-1.5 -translate-y-1/2 bg-rose/45 z-0 pointer-events-none" />}
                          {hasUp    && <span className="absolute top-0  left-1/2 h-[52%] w-1.5 -translate-x-1/2 bg-rose/45 z-0 pointer-events-none" />}
                          {hasDown  && <span className="absolute bottom-0 left-1/2 h-[52%] w-1.5 -translate-x-1/2 bg-rose/45 z-0 pointer-events-none" />}
                          <span className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            {wpIdx !== -1 ? (
                              <span className="w-6 h-6 rounded-full bg-rose flex items-center justify-center text-white font-bold text-xs handwriting shadow shadow-rose/30 leading-none">
                                {wpIdx + 1}
                              </span>
                            ) : isEnd ? (
                              <span className="w-3 h-3 rounded-full bg-rose animate-pulse shadow-sm shadow-rose/40" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-rose/55" />
                            )}
                          </span>
                        </>
                      )}

                      {!inPath && wpIdx !== -1 && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className={[
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs handwriting leading-none",
                            isNextWp ? "border-rose text-rose animate-pulse" : "border-rose/50 text-rose/70",
                          ].join(" ")}>
                            {wpIdx + 1}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* start overlay */}
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={() => setStarted(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="bg-rose text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl shadow-rose/40 handwriting"
            >
              Start ▶
            </motion.button>
          </div>
        )}
      </div>

      {/* progress + reset */}
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-cocoa/50 text-xs">
          {filled}/{total} cells
          {started && !zs.done && nextExpectedWp < waypoints.length && (
            <span className="ml-1">· next: <span className="text-rose font-bold handwriting">{nextExpectedWp + 1}</span></span>
          )}
          <span className="ml-1 italic">· {puzzle.label}</span>
        </p>
        {started && zs.path.length > 0 && !zs.done && (
          <button
            onClick={() => { const n = { ...zs, path: [] }; setZs(n); saveZS(n); }}
            className="text-xs text-cocoa/40 underline"
          >
            reset path
          </button>
        )}
      </div>

      <p className="text-center text-cocoa/40 text-xs">
        tap ① to begin · drag or tap to extend · tap path cell to undo
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
            <p className="handwriting text-2xl sm:text-3xl text-rose">Zipped!! 🎉✨</p>
            <p className="text-cocoa/70 text-sm mt-1">
              Time: {fmt(zs.elapsed)} · Total: {zs.completedCount} puzzle{zs.completedCount !== 1 ? "s" : ""}
            </p>
            {zs.bestTime !== null && zs.elapsed === zs.bestTime && zs.completedCount > 1 && (
              <p className="handwriting text-rose text-lg mt-1">⚡ New best time!</p>
            )}
            <motion.button
              onClick={() => initNew((zs.puzzleIndex + 1) % PUZZLES.length, zs.completedCount, zs.bestTime)}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 bg-rose text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-rose/30"
            >
              Next puzzle? 🔗
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
