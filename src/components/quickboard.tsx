import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  CheckCircle2,
  MessageCircle,
  BookOpen,
  Zap,
  Trophy,
  ChevronRight,
  ListTodo,
  BarChart3,
  Users,
  Headset,
  UserCheck
} from "lucide-react";

export default function QuickBoard() {
  return (
    <div className="min-h-screen bg-transparent flex justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-10">
        <Header />
        <MainAction />
        <ActionButtons />

      </div>
    </div>
  );
}

/* ---------------- HEADER ---------------- */

const Header = () => (
  <div className="text-center space-y-2">
    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
      Your Progress
    </p>
    <h1 className="text-white text-2xl font-bold">
      Today’s Focus
    </h1>
  </div>
);

/* ---------------- MAIN ACTION ---------------- */

const MainAction = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-7"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-purple-500/20">
        <Zap size={14} className="text-purple-300" />
      </div>
      <span className="text-white/40 text-[10px] font-bold tracking-widest">
        ACTIVE LESSON
      </span>
    </div>

    <h2 className="text-white text-3xl font-bold leading-tight">
      RESUME <br />
      <span className="text-white/60">your lesson</span>
    </h2>

    <div className="flex items-center justify-between pt-6">
      <div className="flex-1">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Progress</span>
          <span className="text-white font-semibold">65%</span>
        </div>

        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
          />
        </div>
      </div>

      <a href="#resume-lesson">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="ml-4 p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600"
        >
          <Play className="text-white" size={22} />
        </motion.button>
      </a>
    </div>
  </motion.div>
);

/* ---------------- PRIMARY ACTION BUTTONS ---------------- */

const ActionButtons = () => (
  <div className="flex flex-col space-y-3">
    <ActionButton
      href="#resume-lesson"
      icon={<Play />}
      text="Resume Lesson"
      gradient="from-violet-500 to-indigo-600"
    />

    <ActionButton
      href="#daily-tasks"
      icon={<ListTodo />}
      text="View Today’s Tasks"
      gradient="from-purple-500 to-fuchsia-600"
    />

    <ActionButton
      href="#live-support"
      icon={<Headset />}
      text="Get Live Action Support"
      gradient="from-indigo-500 to-purple-700"
    />

    <ActionButton
      href="#accountability"
      icon={<UserCheck />}
      text="Accountability Partner"
      gradient="from-fuchsia-500 to-purple-600"
    />

    <ActionButton
      href="#progress"
      icon={<BarChart3 />}
      text="View Progress"
      gradient="from-violet-600 to-indigo-500"
    />

    <ActionButton
      href="#community"
      icon={<Users />}
      text="Go to Community"
      gradient="from-purple-600 to-fuchsia-600"
    />
  </div>
);

const ActionButton = ({ icon, text, gradient, href }) => (
  <a href={href} className="block">
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-br ${gradient}`}
    >
      <div className="flex items-center gap-3 text-white font-semibold">
        {icon}
        {text}
      </div>
      <ChevronRight className="text-white/70" />
    </motion.div>
  </a>
);

/* ---------------- QUICK ACTIONS ---------------- */



/* ---------------- STREAK ---------------- */

const Streak = () => (
  <a href="#streak">
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
        <Trophy className="text-white" />
      </div>

      <div className="flex-1">
        <p className="text-white font-semibold">7 Day Streak</p>
        <p className="text-white/30 text-xs">Next reward in 24h</p>
      </div>

      <ChevronRight className="text-white/30" />
    </motion.div>
  </a>
);
