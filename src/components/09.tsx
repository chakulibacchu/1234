import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Zap, Target, BookOpen, Clock, CheckCircle2,
  AlertCircle, X, ChevronDown, ChevronUp, AlarmClock,
  Sparkles, Flame, Trophy, Loader2, Star, Bell, BellOff
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
  timerBg: string;
  timerBorder: string;
  timerText: string;
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
    bgColor: "bg-violet-950/20",
    accentText: "text-violet-300",
    timerBg: "bg-violet-600/25",
    timerBorder: "border-violet-400/60",
    timerText: "text-violet-200",
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
    bgColor: "bg-orange-950/15",
    accentText: "text-orange-300",
    timerBg: "bg-orange-600/25",
    timerBorder: "border-orange-400/60",
    timerText: "text-orange-200",
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
    bgColor: "bg-sky-950/15",
    accentText: "text-sky-300",
    timerBg: "bg-sky-600/25",
    timerBorder: "border-sky-400/60",
    timerText: "text-sky-200",
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
    bgColor: "bg-emerald-950/15",
    accentText: "text-emerald-300",
    timerBg: "bg-emerald-600/25",
    timerBorder: "border-emerald-400/60",
    timerText: "text-emerald-200",
    xp: 40,
    desc: "Read today's insight and apply it in the real world.",
  },
];

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "triangle";
  opacity: number;
}

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = [
      "#a855f7", "#ec4899", "#f97316", "#06b6d4",
      "#10b981", "#f59e0b", "#6366f1", "#e879f9",
    ];

    particlesRef.current = Array.from({ length: 160 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: (["rect", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
      opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.vy += 0.08;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height - 100) p.opacity -= 0.015;
        if (p.opacity > 0) allDone = false;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      if (!allDone) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
    />
  );
}

// ─────────────────────────────────────────────
// CIRCULAR PROGRESS
// ─────────────────────────────────────────────
function CircularProgress({ pct, done, total, xp }: { pct: number; done: number; total: number; xp: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="8" />
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="url(#circGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{done}/{total}</span>
        <span className="text-[10px] text-purple-400/70 font-bold mt-0.5">{xp} XP</span>
      </div>
    </div>
  );
}

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
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="78" fill="rgba(15,5,40,0.3)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(99,60,200,0.15)" strokeWidth="0.5" />
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
// SET TIMER BANNER (dismissible)
// ─────────────────────────────────────────────
function SetTimerBanner({ onDismiss, scheduledCount }: { onDismiss: () => void; scheduledCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", damping: 20 }}
      className="relative rounded-3xl overflow-hidden border border-amber-400/40 bg-gradient-to-r from-amber-950/60 via-orange-950/50 to-yellow-950/40 shadow-xl shadow-amber-900/30"
    >
      {/* Animated shimmer line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

      <div className="px-4 py-3.5 flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/40 mt-0.5">
          <AlarmClock className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-amber-100">Set reminders for your tasks</p>
            {scheduledCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 font-bold">
                {scheduledCount}/{ACTIVITIES.length} set
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-400/70 mt-0.5 leading-relaxed">
            Expand any activity below and tap <span className="text-amber-300 font-bold">Set task time</span> to schedule a reminder so you never miss a daily goal.
          </p>
          {/* Quick visual cue row */}
          <div className="flex items-center gap-1.5 mt-2">
            {ACTIVITIES.map(a => (
              <div key={a.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${a.timerBg} ${a.timerBorder} ${a.timerText}`}
              >
                <AlarmClock className="w-2.5 h-2.5" />
                {a.label.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="w-7 h-7 rounded-xl bg-amber-900/50 border border-amber-600/30 flex items-center justify-center text-amber-400/70 hover:text-amber-200 hover:bg-amber-800/60 transition-all flex-shrink-0 mt-0.5"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// INLINE TIME PICKER (inside card)
// ─────────────────────────────────────────────
function InlineTimePicker({
  act, currentTime, onSave,
}: {
  act: ActivityConfig;
  currentTime?: string;
  onSave: (time: string) => void;
}) {
  const [val, setVal] = useState(currentTime ?? "09:00");
  const QUICK = ["08:00", "12:00", "18:00", "21:00"];

  return (
    <div className={`mt-3 p-3.5 rounded-2xl border-2 ${act.timerBorder} ${act.timerBg} space-y-3`}>
      <div className="flex items-center gap-2">
        <AlarmClock className={`w-3.5 h-3.5 ${act.timerText}`} />
        <p className={`text-[11px] uppercase tracking-widest font-black ${act.timerText}`}>Choose task time</p>
      </div>
      <input
        type="time"
        value={val}
        onChange={e => setVal(e.target.value)}
        className={`w-full border-2 ${act.timerBorder} rounded-xl px-3 py-2.5 text-xl font-black ${act.timerText} outline-none bg-black/20 focus:bg-black/30 transition-all [color-scheme:dark]`}
      />
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK.map(t => (
          <button key={t} onClick={() => setVal(t)}
            className={`py-2 rounded-xl border-2 text-[11px] font-black transition-all
              ${val === t
                ? `${act.timerBg} ${act.timerBorder} ${act.timerText} scale-105 shadow-lg`
                : `bg-black/20 border-white/10 text-white/50 hover:bg-black/30 hover:border-white/20`}`}>
            {t}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSave(val)}
        className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${act.gradient} text-white text-xs font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg`}
      >
        <AlarmClock className="w-3.5 h-3.5" />
        <span>Save reminder for {val}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// ACTIVITY CARD
// ─────────────────────────────────────────────
function ActivityCard({
  act, scheduledTime, isDone, planTask, onToggle, onSaveTime,
}: {
  act: ActivityConfig;
  scheduledTime?: string;
  isDone: boolean;
  planTask?: string | null;
  onToggle: () => void;
  onSaveTime: (time: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border overflow-hidden transition-all duration-300 shadow-lg
        ${isDone
          ? "border-emerald-500/30 bg-emerald-950/20 shadow-emerald-500/10"
          : `${act.borderColor} ${act.bgColor}`
        }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg
          bg-gradient-to-br ${isDone ? "from-emerald-600 to-teal-600 shadow-emerald-500/30" : `${act.gradient} ${act.glowColor}`}`}>
          {isDone ? <CheckCircle2 className="w-5 h-5" /> : act.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-black ${isDone ? "text-emerald-300" : "text-white"}`}>
              {act.label}
            </span>
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
              ? <span className="text-emerald-400/90 font-bold flex items-center gap-1">⏰ {scheduledTime}</span>
              : <span className={`${act.accentText} opacity-70`}>{act.sublabel}</span>
            }
          </p>
        </div>

        {/* Timer badge — always visible, prominent */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Prominent timer pill */}
          <button
            onClick={e => {
              e.stopPropagation();
              setExpanded(true);
              setShowTimePicker(v => !v);
            }}
            title={scheduledTime ? `Scheduled: ${scheduledTime}` : "Set reminder time"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 font-bold text-[11px] transition-all hover:scale-105
              ${scheduledTime
                ? "bg-emerald-900/50 border-emerald-400/70 text-emerald-300 shadow-lg shadow-emerald-500/20"
                : `${act.timerBg} ${act.timerBorder} ${act.timerText} shadow-md`
              }`}
          >
            <AlarmClock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{scheduledTime ?? "Set time"}</span>
            <span className="sm:hidden">{scheduledTime ?? "⏰"}</span>
          </button>

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

      {/* Expanded body */}
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
              <p className="text-xs text-purple-300/70 leading-relaxed">{act.desc}</p>

              {act.id === "plan" && planTask && (
                <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-3">
                  <p className="text-[10px] text-sky-400/70 uppercase tracking-widest mb-1.5 font-bold">Your Task Today</p>
                  <p className="text-xs text-sky-100 font-bold leading-relaxed">{planTask}</p>
                </div>
              )}

              {/* Prominent set time button */}
              <button
                onClick={() => setShowTimePicker(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-xs transition-all hover:scale-[1.02] w-full
                  ${scheduledTime
                    ? "bg-emerald-900/40 border-emerald-400/60 text-emerald-300"
                    : `${act.timerBg} ${act.timerBorder} ${act.timerText}`
                  }`}
              >
                <AlarmClock className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">
                  {scheduledTime ? `Scheduled: ${scheduledTime} — tap to change` : "Set reminder time for this task"}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showTimePicker ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showTimePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <InlineTimePicker
                      act={act}
                      currentTime={scheduledTime}
                      onSave={(t) => {
                        onSaveTime(t);
                        setShowTimePicker(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mark done button */}
              <button
                onClick={e => { e.stopPropagation(); onToggle(); }}
                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-[1.02] relative overflow-hidden group
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ALL DONE BANNER
// ─────────────────────────────────────────────
function AllDoneBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 18 }}
      className="relative rounded-3xl overflow-hidden border border-yellow-500/30 bg-gradient-to-br from-yellow-950/50 via-orange-950/40 to-pink-950/50 p-5 text-center shadow-2xl shadow-yellow-900/30"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 via-pink-600/10 to-purple-600/5 pointer-events-none" />
      <div className="relative z-10 space-y-2">
        <div className="text-4xl mb-1">🎉</div>
        <p className="text-lg font-black text-white">Day Complete!</p>
        <p className="text-xs text-yellow-300/70">You crushed all 4 activities. Streak extended!</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-black text-yellow-300">+140 XP earned today</span>
        </div>
      </div>
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
  const [toast, setToast] = useState<ToastState | null>(null);
  const [planTask, setPlanTask] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTimerBanner, setShowTimerBanner] = useState(true);
  const prevDoneCount = useRef(0);

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

  // Auto-stop confetti
  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(t);
  }, [showConfetti]);

  // Fetch today's plan task
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

  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  function toggleDone(id: ActivityConfig["id"]) {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const act = ACTIVITIES.find(a => a.id === id)!;
      if (!prev[id]) showToast(`+${act.xp} XP — ${act.label} complete!`, "success");
      const newCount = Object.values(next).filter(Boolean).length;
      if (newCount === ACTIVITIES.length && prevDoneCount.current < ACTIVITIES.length) {
        setTimeout(() => setShowConfetti(true), 300);
      }
      prevDoneCount.current = newCount;
      return next;
    });
  }

  function saveTime(actId: ActivityConfig["id"], time: string) {
    setTimes(prev => ({ ...prev, [actId]: time }));
    const act = ACTIVITIES.find(a => a.id === actId)!;
    showToast(`${act.label} scheduled for ${time}`, "info");
    if (apiKey) {
      fetch(`${BACKEND}/tasks/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, task_id: `${actId}_daily`, scheduled_time: time }),
      }).catch(() => {});
    }
  }

  const h = now.getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = h < 12 ? "🌅" : h < 17 ? "☀️" : "🌙";
  const doneCount = Object.values(done).filter(Boolean).length;
  const totalXP = ACTIVITIES.reduce((s, a) => s + (done[a.id] ? a.xp : 0), 0);
  const progressPct = Math.round((doneCount / ACTIVITIES.length) * 100);
  const allDone = doneCount === ACTIVITIES.length;
  const scheduledCount = Object.keys(times).length;

  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  // Auto-dismiss timer banner once all times are set
  useEffect(() => {
    if (scheduledCount === ACTIVITIES.length) {
      setTimeout(() => setShowTimerBanner(false), 2000);
    }
  }, [scheduledCount]);

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-5">
      <Confetti active={showConfetti} />

      <div className="max-w-sm mx-auto space-y-3">

        {/* ── SET TIMER BANNER (dismissible) ── */}
        <AnimatePresence>
          {showTimerBanner && !allDone && (
            <SetTimerBanner
              onDismiss={() => setShowTimerBanner(false)}
              scheduledCount={scheduledCount}
            />
          )}
        </AnimatePresence>

        {/* ── HERO CLOCK CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-transparent rounded-3xl border border-purple-500/20 p-6 overflow-hidden"
        >
          {/* subtle bg only for the clock area */}
          <div className="absolute inset-0 bg-purple-950/20 rounded-3xl backdrop-blur-sm pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-300/80 uppercase tracking-[3px] font-bold">Daily Hub</span>
            </div>
          </div>

          <div className="relative z-10 flex justify-center mb-4">
            <ClockFace time={now} />
          </div>

          <div className="relative z-10 text-center">
            <p className="text-2xl font-black text-white leading-tight">
              {greetEmoji} {greeting}{userName ? `, ${userName}` : ""}!
            </p>
            <p className="text-xs text-purple-400/60 mt-1.5 font-medium">{dateStr}</p>
          </div>

          <div className="relative z-10 mt-4 flex items-center justify-between px-2 py-2 bg-purple-950/30 rounded-2xl border border-purple-800/20">
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

        {/* ── PROGRESS CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-transparent rounded-3xl border border-purple-800/30 p-4"
        >
          <div className="flex items-center gap-4">
            <CircularProgress pct={progressPct} done={doneCount} total={ACTIVITIES.length} xp={totalXP} />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest">Today's Progress</span>
                <span className="text-xs text-purple-200 font-black">{progressPct}%</span>
              </div>
              <div className="h-2.5 bg-purple-900/40 rounded-full overflow-hidden border border-purple-800/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-purple-500/60 font-medium">
                {doneCount === 0 ? "Start your day strong!"
                 : allDone ? "🎉 All done — incredible!"
                 : `${ACTIVITIES.length - doneCount} activit${ACTIVITIES.length - doneCount === 1 ? "y" : "ies"} remaining`}
              </p>
              <div className="flex gap-2 pt-1">
                {ACTIVITIES.map(a => (
                  <motion.div
                    key={a.id}
                    animate={{ scale: done[a.id] ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${done[a.id] ? "bg-gradient-to-r from-violet-500 to-pink-500" : "bg-purple-900/60"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── PLAN LOADING ── */}
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

        {/* ── ACTIVITY CARDS ── */}
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
                onSaveTime={(t) => saveTime(act.id, t)}
              />
            </motion.div>
          ))}
        </div>

        {/* ── ALL DONE BANNER ── */}
        <AnimatePresence>
          {allDone && <AllDoneBanner />}
        </AnimatePresence>

        {/* ── STREAK FOOTER ── */}
        {!allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.01 }}
            className="relative bg-transparent border border-pink-500/20 rounded-3xl p-4 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-pink-950/20 rounded-3xl pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/40 relative z-10">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-black text-pink-200">Keep the streak alive!</p>
              <p className="text-[11px] text-pink-400/60 mt-0.5">
                Complete all 4 activities to earn a bonus streak day.
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 bg-orange-900/30 border border-orange-500/30 rounded-2xl flex items-center justify-center relative z-10">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
          </motion.div>
        )}

      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}