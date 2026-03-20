import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, X, Sparkles, Users, Zap, BookOpen, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransformationCardProps {
  /** Current day number (1-indexed) */
  currentDay?: number;
  /** Total days in the program */
  totalDays?: number;
  /** Current streak in days */
  streak?: number;
  /** Total lessons in program */
  totalLessons?: number;
  /** Total self-planned actions */
  totalActions?: number;
  /** Total community connections target */
  totalConnections?: number;
  /** Completed lessons so far */
  completedLessons?: number;
  /** Completed self-planned actions */
  completedActions?: number;
  /** Connections made so far */
  completedConnections?: number;
  /** Today's lesson context for the "why today matters" strip */
  todayContext?: string;
  /** Callback when before/after goals are saved */
  onGoalsUpdate?: (before: string, after: string) => void;
  /** Initial "before" state text */
  initialBefore?: string;
  /** Initial "after" / transformation goal text */
  initialAfter?: string;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  beforeText: string;
  afterText: string;
  onSave: (before: string, after: string) => void;
  onClose: () => void;
}

const EditModal = ({ beforeText, afterText, onSave, onClose }: EditModalProps) => {
  const [before, setBefore] = useState(beforeText);
  const [after, setAfter] = useState(afterText);
  const beforeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    beforeRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (before.trim() && after.trim()) {
      onSave(before.trim(), after.trim());
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full max-w-md rounded-2xl p-5 relative backdrop-blur-sm"
        style={{
          background: "linear-gradient(135deg, #2d1b69 0%, #1e1040 100%)",
          border: "1px solid rgba(139,92,246,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.25)" }}>
              <Pencil className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <h3 className="text-base font-bold text-white">Edit your goals</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X className="w-4 h-4 text-purple-300" />
          </button>
        </div>

        {/* Before */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "rgba(196,180,255,0.5)" }}>
            Where you are now
          </label>
          <textarea
            ref={beforeRef}
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            rows={2}
            placeholder="e.g. Avoiding eye contact, dreading group chats..."
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {/* After */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.7)" }}>
            Who you're becoming
          </label>
          <textarea
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            rows={2}
            placeholder="e.g. Starting conversations, thriving in social settings..."
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-purple-300 transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!before.trim() || !after.trim()}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            <Check className="w-4 h-4" />
            Save goals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Path Stat Item ───────────────────────────────────────────────────────────

interface PathItemProps {
  icon: React.ReactNode;
  value: number;
  total: number;
  label: string;
  accent?: "purple" | "pink" | "green";
}

const PathItem = ({ icon, value, total, label, accent = "purple" }: PathItemProps) => {
  const isComplete = value >= total;
  const accentColors = {
    purple: { text: "#a78bfa", bg: "rgba(139,92,246,0.2)", border: "rgba(139,92,246,0.4)" },
    pink:   { text: "#f472b6", bg: "rgba(236,72,153,0.18)",  border: "rgba(236,72,153,0.35)"  },
    green:  { text: "#34d399", bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.35)"  },
  };
  const c = isComplete ? accentColors.green : accentColors[accent];

  return (
    <div
      className="flex-1 rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 transition-all"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="text-lg">{icon}</div>
      <div className="text-base font-bold leading-none" style={{ color: isComplete ? "#34d399" : "#fff" }}>
        {value}
        <span className="text-xs font-normal ml-0.5" style={{ color: "rgba(196,180,255,0.4)" }}>/{total}</span>
      </div>
      <div className="text-[10px] leading-tight" style={{ color: "rgba(196,180,255,0.5)" }}>{label}</div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransformationCard({
  currentDay = 11,
  totalDays = 30,
  streak = 7,
  totalLessons = 30,
  totalActions = 15,
  totalConnections = 5,
  completedLessons = 11,
  completedActions = 4,
  completedConnections = 2,
  todayContext = "You're building the ability to hold a spontaneous group conversation without freezing up. Today's task is a direct step toward that.",
  onGoalsUpdate,
  initialBefore = "Avoiding eye contact, dreading group chats",
  initialAfter = "Starting conversations, thriving in social settings",
}: TransformationCardProps) {
  const [beforeText, setBeforeText] = useState(initialBefore);
  const [afterText, setAfterText] = useState(initialAfter);
  const [editOpen, setEditOpen] = useState(false);
  const [animatePct, setAnimatePct] = useState(false);

  const pct = Math.round((currentDay / totalDays) * 100);

  useEffect(() => {
    const t = setTimeout(() => setAnimatePct(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSave = (b: string, a: string) => {
    setBeforeText(b);
    setAfterText(a);
    onGoalsUpdate?.(b, a);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-purple-900/50"
        style={{
          background: "linear-gradient(135deg, #2d1b69 0%, #1e1040 60%, #160d35 100%)",
          border: "1px solid rgba(139,92,246,0.4)",
        }}
      >
        {/* ── Top bar: streak + edit ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "rgba(251,146,60,0.2)", border: "1px solid rgba(251,146,60,0.4)" }}
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold" style={{ color: "#fb923c" }}>{streak}-day streak</span>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95"
            style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.45)" }}
          >
            <Pencil className="w-3 h-3 text-purple-300" />
            <span className="text-xs font-medium text-purple-300">Edit goals</span>
          </button>
        </div>

        <div className="px-4 pt-3 pb-4 space-y-4">

          {/* ── Section label ── */}
          <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.6)" }}>
            Your transformation
          </div>

          {/* ── Before / After cards ── */}
          <div className="flex gap-2 items-stretch">
            {/* Before */}
            <div
              className="flex-1 rounded-2xl p-3"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(196,180,255,0.4)" }}>Now</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={beforeText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  {beforeText}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)" }}>
                <ChevronRight className="w-3 h-3 text-purple-400" />
              </div>
            </div>

            {/* After */}
            <div
              className="flex-1 rounded-2xl p-3 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(219,39,119,0.2))",
                border: "1px solid rgba(167,139,250,0.55)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#a78bfa" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.8)" }}>Day {totalDays} you</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={afterText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs font-medium leading-relaxed text-white"
                >
                  {afterText}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div>
            <div
              className="h-1.5 w-full rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)" }}
                initial={{ width: "0%" }}
                animate={{ width: animatePct ? `${pct}%` : "0%" }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 1.2 }}
                />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px]" style={{ color: "rgba(196,180,255,0.45)" }}>Day {currentDay} of {totalDays}</span>
              <span className="text-[10px] font-semibold" style={{ color: "#a78bfa" }}>{pct}% there</span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

          {/* ── Path items ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.6)" }}>
              What gets you there
            </div>
            <div className="flex gap-2">
              <PathItem
                icon={<BookOpen className="w-4 h-4 text-purple-400 mx-auto" />}
                value={completedLessons}
                total={totalLessons}
                label="Guided lessons"
                accent="purple"
              />
              <PathItem
                icon={<Zap className="w-4 h-4 text-pink-400 mx-auto" />}
                value={completedActions}
                total={totalActions}
                label="Real-world actions"
                accent="pink"
              />
              <PathItem
                icon={<Users className="w-4 h-4 text-green-400 mx-auto" />}
                value={completedConnections}
                total={totalConnections}
                label="People connected"
                accent="green"
              />
            </div>
          </div>

          {/* ── Why today strip ── */}
          <div
            className="rounded-2xl p-3 flex items-start gap-2.5"
            style={{ background: "rgba(139,92,246,0.22)", border: "1px solid rgba(139,92,246,0.45)" }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(139,92,246,0.25)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(196,180,255,0.75)" }}>
              <span className="font-semibold" style={{ color: "#c4b5fd" }}>Why today matters — </span>
              {todayContext}
            </p>
          </div>

        </div>
      </motion.div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editOpen && (
          <EditModal
            beforeText={beforeText}
            afterText={afterText}
            onSave={handleSave}
            onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}