import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Zap, Target, BookOpen, Clock, CheckCircle2,
  AlertCircle, X, ChevronDown, ChevronUp, AlarmClock,
  Sparkles, Flame, Trophy, Loader2, Star
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface ActivityConfig {
  id: "community" | "challenge" | "plan" | "lesson";
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  xp: number;
  desc: string;
  accentText: string;
}

interface ScheduledTimes {
  community?: string;
  challenge?: string;
  plan?: string;
  lesson?: string;
}

interface DoneState {
  community: boolean;
  challenge: boolean;
  plan: boolean;
  lesson: boolean;
}

interface ToastState {
  message: string;
  type: "success" | "info" | "error";
}

interface DailyHubProps {
  userId: string;
  userName?: string;
  apiKey?: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const BACKEND = "https://pythonbackend-j1yp.onrender.com";

const ACTIVITIES: ActivityConfig[] = [
  {
    id: "community",
    label: "Community Check-in",
    sublabel: "Connect with others",
    icon: <Users className="w-5 h-5" />,
    gradient: "from-violet-600 to-indigo-600",
    glowColor: "shadow-violet-500/40",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-950/30",
    accentText: "text-violet-300",
    xp: 20,
    desc: "Share your progress and cheer someone on today. Accountability lives in community.",
  },
  {
    id: "challenge",
    label: "Daily Challenge",
    sublabel: "Today's quick win",
    icon: <Zap className="w-5 h-5" />,
    gradient: "from-orange-500 to-amber-500",
    glowColor: "shadow-orange-500/40",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-950/20",
    accentText: "text-orange-300",
    xp: 30,
    desc: "A bite-sized social challenge to push your comfort zone just a little further.",
  },
  {
    id: "plan",
    label: "Personalized Plan",
    sublabel: "Your AI-crafted task",
    icon: <Target className="w-5 h-5" />,
    gradient: "from-sky-500 to-indigo-500",
    glowColor: "shadow-sky-500/40",
    borderColor: "border-sky-500/30",
    bgColor: "bg-sky-950/20",
    accentText: "text-sky-300",
    xp: 50,
    desc: "Do the next task from your personalized 5-day roadmap.",
  },
  {
    id: "lesson",
    label: "Today's Lesson",
    sublabel: "Level up your skills",
    icon: <BookOpen className="w-5 h-5" />,
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "shadow-emerald-500/40",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-950/20",
    accentText: "text-emerald-300",
    xp: 40,
    desc: "Read today's insight and apply it in the real world.",
  },
];

// ─────────────────────────────────────────────
// CLOCK FACE
// ─────────────────────────────────────────────
function ClockFace({ time }: { time: Date }) {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const hourDeg = (h % 12) * 30 + m * 0.5;
  const minDeg  = m * 6 + s * 0.1;
  const secDeg  = s * 6;

  const hand = (deg: number, length: number, width: number, color: string) => {
    const rad = (deg - 90) * (Math.PI / 180);
    const x2 = 80 + length * Math.cos(rad);
    const y2 = 80 + length * Math.sin(rad);
    return (
      <line x1="80" y1="80" x2={x2} y2={y2}
        stroke={color} strokeWidth={width} strokeLinecap="round" />
    );
  };

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-2xl">
      {/* Outer glow ring */}
      <circle cx="80" cy="80" r="78" fill="rgba(15,5,40,0.95)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(99,60,200,0.15)" strokeWidth="0.5" />
      {/* Subtle radial ticks */}
      {[...Array(12)].map((_, i) => {
        const rad = (i * 30 - 90) * (Math.PI / 180);
        const r1 = 63;
        const r2 = i % 3 === 0 ? 55 : 60;
        return (
          <line key={i}
            x1={80 + r1 * Math.cos(rad)} y1={80 + r1 * Math.sin(rad)}
            x2={80 + r2 * Math.cos(rad)} y2={80 + r2 * Math.sin(rad)}
            stroke={i % 3 === 0 ? "rgba(167,139,250,0.9)" : "rgba(139,92,246,0.35)"}
            strokeWidth={i % 3 === 0 ? 2.5 : 1}
          />
        );
      })}
      {/* Hour numbers at cardinal positions */}
      {[12, 3, 6, 9].map((num, i) => {
        const rad = (i * 90 - 90) * (Math.PI / 180);
        return (
          <text key={num}
            x={80 + 47 * Math.cos(rad)} y={80 + 47 * Math.sin(rad)}
            textAnchor="middle" dominantBaseline="central"
            fill="rgba(196,181,253,0.5)" fontSize="9" fontWeight="700"
            fontFamily="system-ui"
          >{num}</text>
        );
      })}
      {hand(hourDeg, 34, 4.5, "#c4b5fd")}
      {hand(minDeg,  50, 3,   "#e9d5ff")}
      {hand(secDeg,  56, 1.5, "#f472b6")}
      {/* Center dot */}
      <circle cx="80" cy="80" r="5" fill="#7c3aed" />
      <circle cx="80" cy="80" r="2.5" fill="#f9a8d4" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: ToastState["type"]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm font-bold text-white max-w-xs w-full
        ${type === "success" ? "bg-emerald-900/80 border-emerald-400/50 shadow-emerald-500/30"
          : type === "error" ? "bg-rose-900/80 border-rose-400/50 shadow-rose-500/30"
          : "bg-purple-900/80 border-purple-400/50 shadow-purple-500/30"}`}
    >
      {type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />}
      {type === "error"   && <AlertCircle  className="w-4 h-4 text-rose-300 flex-shrink-0" />}
      {type === "info"    && <Sparkles     className="w-4 h-4 text-purple-300 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// TIME SET MODAL
// ─────────────────────────────────────────────
function TimeSetModal({
  activity, currentTime, onSave, onClose,
}: {
  activity: ActivityConfig;
  currentTime?: string;
  onSave: (time: string) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(currentTime ?? "09:00");
  const QUICK_TIMES = ["08:00", "12:00", "18:00", "21:00"];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-500/40 rounded-3xl p-5 w-full max-w-sm shadow-2xl shadow-purple-900/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center shadow-lg ${activity.glowColor}`}>
              <AlarmClock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-purple-400/60 uppercase tracking-widest">Set reminder for</p>
              <p className="text-sm font-black text-white">{activity.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-800/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Time input */}
        <div className="mb-4">
          <input
            type="time"
            value={val}
            onChange={e => setVal(e.target.value)}
            className="w-full bg-purple-950/60 border border-purple-500/40 rounded-2xl px-4 py-3 text-2xl font-black text-purple-100 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 transition-all [color-scheme:dark]"
          />
        </div>

        {/* Quick picks */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {QUICK_TIMES.map(t => (
            <button key={t} onClick={() => setVal(t)}
              className={`py-2 rounded-xl border text-xs font-black transition-all
                ${val === t
                  ? "bg-violet-600/50 border-violet-400/60 text-violet-100 shadow-lg shadow-violet-500/20"
                  : "bg-purple-900/40 border-purple-700/40 text-purple-400 hover:bg-purple-800/50 hover:border-purple-600/50"}`}>
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSave(val)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-black shadow-lg shadow-purple-500/40 hover:scale-[1.02] transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <AlarmClock className="w-4 h-4" /> Save Reminder
          </span>
        </button>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ACTIVITY CARD  (styled after 01.tsx cards)
// ─────────────────────────────────────────────
function ActivityCard({
  act, scheduledTime, isDone, planTask, onToggle, onSchedule,
}: {
  act: ActivityConfig;
  scheduledTime?: string;
  isDone: boolean;
  planTask?: string | null;
  onToggle: () => void;
  onSchedule: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border overflow-hidden transition-all duration-300 shadow-lg
        ${isDone
          ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 shadow-emerald-500/10"
          : `${act.borderColor} ${act.bgColor} shadow-${act.glowColor}`
        }`}
    >
      {/* ── Header row ── */}
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Icon pill */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg
          bg-gradient-to-br ${isDone ? "from-emerald-600 to-teal-600 shadow-emerald-500/30" : `${act.gradient} ${act.glowColor}`}`}>
          {isDone ? <CheckCircle2 className="w-5 h-5" /> : act.icon}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-black ${isDone ? "text-emerald-300" : "text-white"}`}>
              {act.label}
            </span>
            {/* XP badge */}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/70 border border-purple-600/30 text-purple-300 font-bold">
              +{act.xp} XP
            </span>
            {isDone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-bold">
                Done ✓
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5 truncate">
            {scheduledTime
              ? <span className="text-emerald-400/80 font-bold">⏰ {scheduledTime}</span>
              : <span className={`${act.accentText} opacity-70`}>{act.sublabel}</span>
            }
          </p>
        </div>

        {/* Checkbox + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggle(); }}
            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-110
              ${isDone
                ? "border-emerald-400 bg-emerald-500/20"
                : "border-purple-500/50 bg-transparent hover:border-violet-400 hover:bg-violet-500/10"}`}
          >
            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <div className="text-purple-500/50">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* ── Expanded body ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-purple-800/30 space-y-3">
              {/* Description */}
              <p className="text-xs text-purple-300/70 leading-relaxed">
                {act.desc}
              </p>

              {/* Plan task highlight */}
              {act.id === "plan" && planTask && (
                <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-3">
                  <p className="text-[10px] text-sky-400/70 uppercase tracking-widest mb-1.5 font-bold">Your Task Today</p>
                  <p className="text-xs text-sky-100 font-bold leading-relaxed">{planTask}</p>
                </div>
              )}

              {/* Schedule + complete row */}
              <div className="flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); onSchedule(); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-600/30 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 text-xs font-bold transition-all hover:scale-[1.02]"
                >
                  <AlarmClock className="w-3.5 h-3.5" />
                  {scheduledTime ? `Change · ${scheduledTime}` : "Set reminder"}
                </button>

                <button
                  onClick={e => { e.stopPropagation(); onToggle(); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-[1.02] relative overflow-hidden group
                    ${isDone
                      ? "bg-emerald-900/40 border border-emerald-500/30 text-emerald-300"
                      : `bg-gradient-to-r ${act.gradient} text-white shadow-lg ${act.glowColor} border border-transparent`
                    }`}
                >
                  {!isDone && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isDone ? <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Undone</> : <><Star className="w-3.5 h-3.5" /> Mark Done</>}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DailyHub({ userId, userName, apiKey }: DailyHubProps) {
  const [now, setNow] = useState(new Date());
  const [done, setDone] = useState<DoneState>({ community: false, challenge: false, plan: false, lesson: false });
  const [times, setTimes] = useState<ScheduledTimes>({});
  const [scheduling, setScheduling] = useState<ActivityConfig | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [planTask, setPlanTask] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Fetch today's plan task from backend
  useEffect(() => {
    if (!userId) return;
    setLoadingPlan(true);
    fetch(`${BACKEND}/tasks/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.tasks && data.tasks.length > 0) {
          const nextTask = data.tasks.find((t: any) => !t.done) ?? data.tasks[0];
          setPlanTask(nextTask.description ?? nextTask.title ?? null);
        }
      })
      .catch(() => setPlanTask(null))
      .finally(() => setLoadingPlan(false));
  }, [userId]);

  // ── Helpers ──
  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  function toggleDone(id: ActivityConfig["id"]) {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const act = ACTIVITIES.find(a => a.id === id)!;
      if (!prev[id]) showToast(`+${act.xp} XP — ${act.label} complete!`, "success");
      return next;
    });
  }

  function saveTime(actId: ActivityConfig["id"], time: string) {
    setTimes(prev => ({ ...prev, [actId]: time }));
    setScheduling(null);
    const act = ACTIVITIES.find(a => a.id === actId)!;
    showToast(`${act.label} set for ${time}`, "info");
    if (apiKey) {
      fetch(`${BACKEND}/tasks/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, task_id: `${actId}_daily`, scheduled_time: time }),
      }).catch(() => {});
    }
  }

  // ── Derived state ──
  const h = now.getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = h < 12 ? "🌅" : h < 17 ? "☀️" : "🌙";
  const doneCount = Object.values(done).filter(Boolean).length;
  const totalXP = ACTIVITIES.reduce((s, a) => s + (done[a.id] ? a.xp : 0), 0);
  const progressPct = Math.round((doneCount / ACTIVITIES.length) * 100);

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="min-h-screen bg-[#0a0618] text-white px-4 py-5">
      <div className="max-w-sm mx-auto space-y-3">

        {/* ─────────────────────────────────────
            HERO CLOCK CARD
        ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-purple-950/90 via-indigo-950/80 to-slate-900/90 rounded-3xl border border-purple-500/30 p-6 overflow-hidden shadow-2xl shadow-purple-900/50"
        >
          {/* Ambient background glow blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-purple-900/20 rounded-full blur-2xl pointer-events-none" />

          {/* "Daily Hub" pill */}
          <div className="relative z-10 flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-300/80 uppercase tracking-[3px] font-bold">Daily Hub</span>
            </div>
          </div>

          {/* Clock */}
          <div className="relative z-10 flex justify-center mb-4">
            <ClockFace time={now} />
          </div>

          {/* Greeting */}
          <div className="relative z-10 text-center">
            <p className="text-2xl font-black text-white leading-tight">
              {greetEmoji} {greeting}{userName ? `, ${userName}` : ""}!
            </p>
            <p className="text-xs text-purple-400/60 mt-1.5 font-medium">{dateStr}</p>
          </div>

          {/* Digital clock strip */}
          <div className="relative z-10 mt-4 flex items-center justify-between px-2 py-2 bg-purple-950/50 rounded-2xl border border-purple-800/30">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400/60" />
              <span className="text-[10px] text-purple-400/60 font-bold uppercase tracking-wide">Local time</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-purple-100 tabular-nums">
                {String(h % 12 || 12).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}:{String(now.getSeconds()).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-purple-400/70 font-bold">{h >= 12 ? "PM" : "AM"}</span>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────
            PROGRESS CARD
        ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-950/70 to-indigo-950/60 rounded-3xl border border-purple-800/40 p-4 shadow-lg shadow-purple-900/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest">Today's Progress</span>
                <span className="text-xs text-purple-200 font-black">{doneCount}/{ACTIVITIES.length} done</span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 bg-purple-900/60 rounded-full overflow-hidden border border-purple-800/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-purple-500/60 mt-1.5 font-medium">
                {doneCount === 0 ? "Start your day strong!"
                 : doneCount === ACTIVITIES.length ? "🎉 All done — incredible!"
                 : `${ACTIVITIES.length - doneCount} activit${ACTIVITIES.length - doneCount === 1 ? "y" : "ies"} remaining`}
              </p>
            </div>

            {/* XP badge */}
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/30 to-pink-600/20 border border-violet-500/30 flex flex-col items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-2xl font-black text-white leading-none">{totalXP}</span>
                <span className="text-[9px] text-purple-400/70 font-bold tracking-widest mt-0.5">XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────
            PLAN LOADING BANNER
        ───────────────────────────────────── */}
        <AnimatePresence>
          {loadingPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-900/20 border border-sky-500/20"
            >
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin flex-shrink-0" />
              <p className="text-xs text-sky-300/70 font-bold">Loading your personalized task…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────────────────────────────
            ACTIVITY CARDS
        ───────────────────────────────────── */}
        <div className="space-y-2.5">
          <p className="text-[10px] text-purple-400/40 uppercase tracking-[2px] px-1 font-bold">Today's Activities</p>
          {ACTIVITIES.map((act, i) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <ActivityCard
                act={act}
                scheduledTime={times[act.id as keyof ScheduledTimes]}
                isDone={done[act.id as keyof DoneState]}
                planTask={act.id === "plan" ? planTask : null}
                onToggle={() => toggleDone(act.id)}
                onSchedule={() => setScheduling(act)}
              />
            </motion.div>
          ))}
        </div>

        {/* ─────────────────────────────────────
            STREAK FOOTER CARD
        ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative bg-gradient-to-r from-pink-950/50 via-purple-950/60 to-indigo-950/50 border border-pink-500/25 rounded-3xl p-4 flex items-center gap-3 overflow-hidden shadow-lg shadow-pink-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 via-transparent to-violet-600/5 pointer-events-none" />
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/40">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-black text-pink-200">Keep the streak alive!</p>
            <p className="text-[11px] text-pink-400/60 mt-0.5">
              Complete all 4 activities to earn a bonus streak day.
            </p>
          </div>
          <div className="flex-shrink-0 w-10 h-10 bg-orange-900/40 border border-orange-500/30 rounded-2xl flex items-center justify-center relative z-10">
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
        </motion.div>

      </div>

      {/* ── Time Set Modal ── */}
      <AnimatePresence>
        {scheduling && (
          <TimeSetModal
            activity={scheduling}
            currentTime={times[scheduling.id as keyof ScheduledTimes]}
            onSave={(t) => saveTime(scheduling.id, t)}
            onClose={() => setScheduling(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}