import { useState, useEffect, useMemo } from "react";
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import {
  Trophy, Flame, Sparkles, RefreshCw, Check, ChevronLeft, ChevronRight,
  Zap, Target, Award, Clock, TrendingUp, Lock, CheckCircle2,
  AlertCircle, Lightbulb, RotateCcw, Play, Pause, Heart, MessageCircle,
  Calendar, X
} from "lucide-react";
import Confetti from "react-confetti";
import { apiKeys } from 'src/backend/keys/apiKeys';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { getApiKeys } from 'src/backend/apikeys';




// ============ FIREBASE CONFIG ============
const firebaseConfig = {
  apiKey: "AIzaSyBNCXIOAX2HUdeLvUxkTJh7DVbv8JU485s",
  authDomain: "goalgrid-c5e9c.firebaseapp.com",
  projectId: "goalgrid-c5e9c",
  storageBucket: "goalgrid-c5e9c.firebasestorage.app",
  messagingSenderId: "544004357501",
  appId: "1:544004357501:web:4b81a3686422b28534e014",
  measurementId: "G-BJQMLK9JJ1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const user = auth.currentUser;

if (user) {
  console.log("User UID:", user.uid);
}

// ============ INTERFACES ============

type Difficulty = 'easy' | 'medium' | 'hard' | 'default';

interface Task {
  task: string;
  done: boolean;
  difficulty: Difficulty;
  timeSpent: number;
  notes: string;
}

interface Lesson {
  id: string;
  date: string;
  title: string;
  dayNumber: number;
  unlocked: boolean;
  motivationalQuote: string;
  summary: string;
  xpPerTask: number;
  tasks: Task[];
}

interface FirestoreLesson {
  title?: string;
  quote?: string;
  motivation?: string;
  summary?: string;
  tasks: Record<string, any> | Task[] | undefined;
}

interface LessonsByDate {
  [date: string]: FirestoreLesson;
}

// ============ HELPER FUNCTIONS ============

const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 'from-green-500 to-emerald-500';
    case 'medium': return 'from-yellow-500 to-orange-500';
    case 'hard': return 'from-red-500 to-pink-500';
    default: return 'from-purple-500 to-pink-500';
  }
};

const getDifficultyXPMultiplier = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 1.5;
    case 'hard': return 2;
    default: return 1;
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const determineDifficulty = (taskText: string): Difficulty => {
  const lowerTask = taskText.toLowerCase();
  if (lowerTask.includes('review') || lowerTask.includes('reflect') || lowerTask.includes('schedule') || lowerTask.includes('take a few minutes')) {
    return 'easy';
  } else if (lowerTask.includes('practice') || lowerTask.includes('connect') || lowerTask.includes('reach out') || lowerTask.includes('write')) {
    return 'medium';
  } else {
    return 'hard';
  }
};

const OnboardingScreen = ({ onDismiss }) => {
  return (
    <div className="relative h-full bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center p-3 overflow-hidden rounded-2xl">
      <div className="max-w-sm w-full relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
          </div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent leading-tight"
          >
            Welcome! 👋
          </motion.h1>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-purple-200 mb-1 font-medium leading-relaxed"
          >
            This is where you start your day
          </motion.p>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-purple-300/80 leading-relaxed"
          >
            Let's make today amazing together
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative bg-gradient-to-br from-blue-900/60 via-cyan-900/50 to-blue-900/60 backdrop-blur-xl border-2 border-blue-400/50 rounded-2xl p-5 mb-5 shadow-xl shadow-blue-500/30 overflow-hidden group hover:border-blue-300/70 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gradient-to-br from-blue-500/40 to-cyan-500/40 p-2.5 rounded-xl border border-blue-400/30 shadow-lg">
                <Sparkles className="w-4 h-4 text-blue-200" />
              </div>
              <h3 className="text-base font-black text-white leading-tight">
                Get Live Action Support
              </h3>
            </div>
            <p className="text-blue-50 text-sm leading-relaxed font-medium">
              Click the <span className="inline-flex items-center gap-1 font-black text-blue-200 bg-blue-500/30 px-2 py-0.5 rounded-full border border-blue-400/40 text-xs">🤖 AI Coach</span> button on any task to get personalized, real-time guidance that adapts to your needs.
            </p>
          </div>

          <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-2xl"></div>
          <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-cyan-400/20 to-transparent rounded-tr-2xl"></div>
        </motion.div>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDismiss}
          className="relative w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 rounded-2xl font-black text-white text-lg shadow-xl shadow-purple-500/60 transition-all border-2 border-purple-400/50 hover:border-purple-300/70 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            Let's Go! 🚀
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-purple-300/60 text-xs mt-4 font-medium"
        >
          Your journey to growth starts now
        </motion.p>
      </div>
    </div>
  );
};

export default function TodayActionCard() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [openRegenDialog, setOpenRegenDialog] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [activeTimer, setActiveTimer] = useState(null);
  const [loadingLiveSupport, setLoadingLiveSupport] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [expandedTaskNote, setExpandedTaskNote] = useState(null);
  const [taskNotes, setTaskNotes] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dayTasks, setDayTasks] = useState<Lesson[]>([]);
  const [nextActionTime, setNextActionTime] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [velocityStatus, setVelocityStatus] = useState('on-track');
  const [tasksNeededByTime, setTasksNeededByTime] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreDocId, setFirestoreDocId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

useEffect(() => {
  if (!userId) return;

  const fetchTasksFromFirestore = async () => {
    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, `users/${userId}/datedcourses`, 'life_skills');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("No life_skills course found. Please create a course first.");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      setFirestoreDocId('life_skills');

      if (!data.task_overview || !data.task_overview.days) {
        setError("No task_overview found in life_skills course.");
        setLoading(false);
        return;
      }

      const transformedTasks = transformTaskOverview(data.task_overview.days);
      setDayTasks(transformedTasks);

      const today = new Date().toISOString().split("T")[0];
      const todayIndex = transformedTasks.findIndex(day => day.date === today);

      if (todayIndex >= 0) {
        setCurrentDayIndex(todayIndex);
      } else {
        const lastUnlockedIndex = transformedTasks.reduce((lastIdx, day, idx) =>
          day.unlocked ? idx : lastIdx, 0
        );
        setCurrentDayIndex(lastUnlockedIndex);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(`Error loading tasks: ${err.message}`);
      setLoading(false);
    }
  };

  fetchTasksFromFirestore();
}, [userId]);

  const currentDay = dayTasks[currentDayIndex] || {
    tasks: [],
    date: new Date().toISOString(),
    xpPerTask: 0,
    dayNumber: 1,
    title: "Loading...",
    unlocked: false,
    motivationalQuote: "",
    summary: ""
  };

  const completedTasks = currentDay.tasks ? currentDay.tasks.filter((t) => t.done).length : 0;
  const totalTasks = currentDay.tasks ? currentDay.tasks.length : 0;

  const totalXpEarned = currentDay.tasks ? currentDay.tasks.reduce((sum, task) => {
    if (task.done) {
      return sum + (currentDay.xpPerTask * getDifficultyXPMultiplier(task.difficulty));
    }
    return sum;
  }, 0) : 0;

  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;
  const canAccessDay = currentDay.unlocked;

  const date = currentDay.date ? new Date(currentDay.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }) : "Today";

  useEffect(() => {
  const hasSeenThisSession = sessionStorage.getItem('hasSeenOnboarding');
  if (!hasSeenThisSession && dayTasks.length > 0) {
    setTimeout(() => setShowOnboarding(true), 2000);
  }
}, [dayTasks]);

const handleDismissOnboarding = () => {
  sessionStorage.setItem('hasSeenOnboarding', 'true');
  setShowOnboarding(false);
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setError("Please log in to view your tasks");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  if (!currentDay || dayTasks.length === 0) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const totalMinutesElapsed = currentHour * 60 + currentMinutes;

  const workStartMinutes = 8 * 60;
  const workEndMinutes = 22 * 60;
  const totalWorkMinutes = workEndMinutes - workStartMinutes;

  if (totalMinutesElapsed < workStartMinutes || totalMinutesElapsed > workEndMinutes) {
    setVelocityStatus('on-track');
    setTasksNeededByTime(null);
    return;
  }

  const minutesIntoWorkday = totalMinutesElapsed - workStartMinutes;
  const percentOfDayComplete = Math.min(minutesIntoWorkday / totalWorkMinutes, 1);

  const totalTasks = currentDay.tasks.length;
  const completedTasks = currentDay.tasks.filter(t => t.done).length;
  const expectedTasksComplete = Math.floor(totalTasks * percentOfDayComplete);

  const tasksDifference = completedTasks - expectedTasksComplete;

  if (tasksDifference >= 2) {
    setVelocityStatus('ahead');
  } else if (tasksDifference <= -2) {
    setVelocityStatus('behind');
  } else {
    setVelocityStatus('on-track');
  }

  if (completedTasks < totalTasks) {
    const targetHour = Math.floor((workStartMinutes + ((completedTasks + 1) / totalTasks) * totalWorkMinutes) / 60);
    const targetMinute = Math.floor((workStartMinutes + ((completedTasks + 1) / totalTasks) * totalWorkMinutes) % 60);

    setTasksNeededByTime({
      tasksNeeded: expectedTasksComplete - completedTasks + 1,
      hour: targetHour,
      minute: targetMinute
    });
  } else {
    setTasksNeededByTime(null);
  }
}, [currentDay, dayTasks, currentTaskIndex]);

useEffect(() => {
  const calculateNextActionTime = () => {
    if (!currentDay || currentDay.tasks.length === 0) return null;
    const incompleteTasks = currentDay.tasks.filter(t => !t.done);
    if (incompleteTasks.length === 0) return null;
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + 45);
    return nextTime;
  };

  setNextActionTime(calculateNextActionTime());
}, [currentDay, currentTaskIndex, dayTasks]);

useEffect(() => {
  if (!nextActionTime) return;

  const interval = setInterval(() => {
    const now = new Date();
    const diff = Math.floor((nextActionTime - now) / 1000);
    setCountdownSeconds(Math.max(0, diff));

    if (diff <= 0) {
      const nextTime = new Date();
      nextTime.setMinutes(nextTime.getMinutes() + 45);
      setNextActionTime(nextTime);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [nextActionTime]);

useEffect(() => {
  const interval = setInterval(() => {
    setCountdownSeconds(prev => prev);
  }, 60000);

  return () => clearInterval(interval);
}, []);

const transformTaskOverview = (days: any[]): Lesson[] => {
  return days.map((day: any, index: number): Lesson => {
    const prevDayComplete = index === 0 || (
      days[index - 1].tasks.every(t => t.done === true)
    );

    const tasksArray = day.tasks.map((task: any, taskIdx: number): Task => ({
      task: task.description,
      done: task.done || false,
      difficulty: determineDifficultyFromDay(day.day),
      timeSpent: task.timeSpent || 0,
      notes: task.notes || ''
    }));

    return {
      id: `day${day.day}`,
      date: day.date,
      title: day.title,
      dayNumber: day.day,
      unlocked: prevDayComplete,
      motivationalQuote: `Day ${day.day} - ${day.title}`,
      summary: day.summary,
      xpPerTask: 20,
      tasks: tasksArray
    };
  });
};

const determineDifficultyFromDay = (dayNumber: number): Difficulty => {
  if (dayNumber === 1) return 'easy';
  if (dayNumber === 2 || dayNumber === 3) return 'medium';
  return 'hard';
};

const transformFirestoreData = (lessonsByDate: LessonsByDate): Lesson[] => {
  const sortedDates = Object.keys(lessonsByDate).sort();

  return sortedDates.map((date: string, index: number): Lesson => {
    const lesson = lessonsByDate[date];

    const getTasksArray = (tasks: any[]): Task[] => {
      if (!tasks) return [];
      if (Array.isArray(tasks)) return tasks;
      return Object.values(tasks);
    };

    const prevDayTasks = index > 0 ? getTasksArray(lessonsByDate[sortedDates[index - 1]].tasks) : [];
    const isUnlocked = index === 0 || prevDayTasks.every(t => t && t.done);

    const rawTasks = getTasksArray(lesson.tasks);
    const tasksArray = rawTasks.map(task => {
      if (!task || !task.task) return null;
      return {
        task: task.task,
        done: task.done || false,
        difficulty: task.difficulty || determineDifficulty(task.task),
        timeSpent: task.timeSpent || 0,
        notes: task.notes || ''
      };
    }).filter(Boolean);

    return {
      id: `day${index + 1}`,
      date: date,
      title: lesson.title || "Daily Challenge",
      dayNumber: index + 1,
      unlocked: isUnlocked,
      motivationalQuote: lesson.quote || lesson.motivation || "",
      summary: lesson.summary || "",
      xpPerTask: 20,
      tasks: tasksArray
    };
  });
};

const updateFirestore = async (updatedDayTasks: Lesson[]) => {
  if (!userId || !firestoreDocId) return;

  try {
    const docRef = doc(db, `users/${userId}/datedcourses`, firestoreDocId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    const data = docSnap.data();

    if (data.task_overview && data.task_overview.days) {
      const updatedOverview = {
        ...data.task_overview,
        days: data.task_overview.days.map((day, dayIdx) => {
          const matchingDay = updatedDayTasks.find(d => d.date === day.date);
          if (!matchingDay) return day;

          return {
            ...day,
            tasks: day.tasks.map((task, taskIdx) => ({
              ...task,
              done: matchingDay.tasks[taskIdx]?.done || false,
              timeSpent: matchingDay.tasks[taskIdx]?.timeSpent || 0,
              notes: matchingDay.tasks[taskIdx]?.notes || ''
            }))
          };
        })
      };

      await updateDoc(docRef, { task_overview: updatedOverview });
    } else if (data.lessons_by_date) {
      const updatedLessons = {};
      updatedDayTasks.forEach(day => {
        updatedLessons[day.date] = {
          title: day.title,
          quote: day.motivationalQuote,
          summary: day.summary,
          tasks: day.tasks.map(t => ({
            task: t.task,
            done: t.done,
            difficulty: t.difficulty,
            timeSpent: t.timeSpent,
            notes: t.notes
          }))
        };
      });

      await updateDoc(docRef, { lessons_by_date: updatedLessons });
    }
  } catch (err) {
    console.error("Error updating Firestore:", err);
    throw err;
  }
};

  useEffect(() => {
    let interval;
    if (activeTimer !== null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const stats = useMemo(() => {
    let totalXP = 0;
    let totalDaysCompleted = 0;
    let totalTimeSpent = 0;
    let currentStreak = 0;
    let taskCount = 0;

    const sortedDays = [...dayTasks].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date().setHours(0, 0, 0, 0);

    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = sortedDays[i];
      const dayDate = new Date(day.date).setHours(0, 0, 0, 0);

      if (dayDate > today) continue;

      const completedTasks = day.tasks.filter((t) => t.done).length;
      const totalTasks = day.tasks.length;
      const isDayComplete = completedTasks === totalTasks && totalTasks > 0;

      const expectedDate = today - (currentStreak * 86400000);

      if (dayDate === expectedDate && isDayComplete) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
    }

    for (const day of sortedDays) {
      const completedTasks = day.tasks.filter((t) => t.done).length;
      const totalTasks = day.tasks.length;

      if (completedTasks === totalTasks && totalTasks > 0) {
        totalDaysCompleted++;
      }

      day.tasks.forEach((task) => {
        if (task.done) {
          const xp = day.xpPerTask * getDifficultyXPMultiplier(task.difficulty);
          totalXP += xp;
          taskCount++;
          if (task.timeSpent) totalTimeSpent += task.timeSpent;
        }
      });
    }

    return {
      totalXP,
      totalDaysCompleted,
      currentStreak,
      averageTaskTime: taskCount > 0 ? Math.round(totalTimeSpent / taskCount) : 0,
      totalTimeSpent,
    };
  }, [dayTasks]);

const handleTaskClick = (taskObj: Task, taskIndex: number) => {
  setSelectedTask({ task: taskObj, index: taskIndex });
  setShowTaskModal(true);
};

const handleGetLiveSupport = async (taskObj: Task, taskIndex: number) => {
  setLoadingLiveSupport(true);

  const apiKeys = await getApiKeys();

  if (!apiKeys || apiKeys.length === 0) {
    alert('No API keys available. Please contact support.');
    setLoadingLiveSupport(false);
    return;
  }

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];

    try {
      const response = await fetch('https://pythonbackend-74es.onrender.com/live-action-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          task_name: taskObj.task,
          user_id: userId,
          category: "General life",
          difficulty: taskObj.difficulty || "Medium",
          user_context: {
            anxiety_level: "moderate",
            experience: "beginner",
            specific_challenges: []
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`API key ${i + 1} failed:`, data.error || 'Unknown error');
        continue;
      }

      if (data.success && data.task) {
        window.location.href = `/connections?task=${encodeURIComponent(JSON.stringify(data.task))}`;
        setLoadingLiveSupport(false);
        return;
      } else {
        continue;
      }

    } catch (error) {
      console.warn(`API key ${i + 1} request failed:`, error);
    }
  }

  alert('All API keys failed. Please try again later.');
  setLoadingLiveSupport(false);
};

  const handleDayChange = (index: number) => {
    if (index < 0 || index >= dayTasks.length) return;
    const targetDay = dayTasks[index];
    if (!targetDay.unlocked) return;

    setCurrentTaskIndex(0);

    if (activeTimer !== null) {
      setDayTasks((prev) =>
        prev.map((day, idx) => {
          if (idx !== currentDayIndex) return day;
          const newTasks = [...day.tasks];
          newTasks[activeTimer] = {
            ...newTasks[activeTimer],
            timeSpent: (newTasks[activeTimer].timeSpent || 0) + timerSeconds,
          };
          return { ...day, tasks: newTasks };
        })
      );
      setActiveTimer(null);
      setTimerSeconds(0);
    }

    setCurrentDayIndex(index);
  };

  const handleTaskToggle = async (dayDate: string, taskIndex: number) => {
  if (!userId || !firestoreDocId) return;

  const currentDay = dayTasks.find((d) => d.date === dayDate);
  if (!currentDay || !currentDay.tasks || taskIndex == null) return;

  const task = currentDay.tasks[taskIndex];
  const wasCompleted = task.done;
  const currentCompletedCount = currentDay.tasks.filter((t) => t.done).length;
  const newDoneStatus = !wasCompleted;

  let timeToSave = task.timeSpent || 0;
  if (activeTimer === taskIndex && newDoneStatus) {
    timeToSave += timerSeconds;
  }

  const updatedDayTasks = dayTasks.map((day) => {
    if (day.date !== dayDate) return day;
    const newTasks = [...day.tasks];
    newTasks[taskIndex] = {
      ...newTasks[taskIndex],
      done: newDoneStatus,
      timeSpent: newDoneStatus && activeTimer === taskIndex ? timeToSave : newTasks[taskIndex].timeSpent
    };
    return { ...day, tasks: newTasks };
  });

  setDayTasks(updatedDayTasks);

  if (activeTimer === taskIndex) {
    setActiveTimer(null);
    setTimerSeconds(0);
  }

  try {
    await updateFirestore(updatedDayTasks);

    if (newDoneStatus && currentCompletedCount + 1 === currentDay.tasks.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);

      const currentIdx = updatedDayTasks.findIndex(d => d.date === dayDate);
      const nextDayIndex = currentIdx + 1;
      if (nextDayIndex < updatedDayTasks.length) {
        const unlockedDayTasks = updatedDayTasks.map((day, idx) =>
          idx === nextDayIndex ? { ...day, unlocked: true } : day
        );
        setDayTasks(unlockedDayTasks);
      }
    }
  } catch (err) {
    console.error("Error updating task:", err);
    setDayTasks(dayTasks);
  }
};

  const handleStartTimer = async (taskIndex: number) => {
  if (activeTimer === taskIndex) {
    const timeToSave = timerSeconds;

    const updatedDayTasks = dayTasks.map((day, idx) => {
      if (idx !== currentDayIndex) return day;
      const newTasks = [...day.tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        timeSpent: (newTasks[taskIndex].timeSpent || 0) + timeToSave,
      };
      return { ...day, tasks: newTasks };
    });

    setDayTasks(updatedDayTasks);

    try {
      await updateFirestore(updatedDayTasks);
    } catch (err) {
      console.error("Error saving timer:", err);
    }

    setActiveTimer(null);
    setTimerSeconds(0);
  } else {
    if (activeTimer !== null) {
      const prevTimeToSave = timerSeconds;

      const updatedDayTasks = dayTasks.map((day, idx) => {
        if (idx !== currentDayIndex) return day;
        const newTasks = [...day.tasks];
        newTasks[activeTimer] = {
          ...newTasks[activeTimer],
          timeSpent: (newTasks[activeTimer].timeSpent || 0) + prevTimeToSave,
        };
        return { ...day, tasks: newTasks };
      });

      setDayTasks(updatedDayTasks);
      await updateFirestore(updatedDayTasks);
    }

    setActiveTimer(taskIndex);
    setTimerSeconds(dayTasks[currentDayIndex].tasks[taskIndex].timeSpent || 0);
  }
};

  const handleResetDay = async () => {
  if (!userId || !firestoreDocId) return;

  const currentDay = dayTasks[currentDayIndex];
  if (!confirm(`Reset all tasks for "${currentDay.title}"?`)) return;

  const updatedDayTasks = dayTasks.map((day, idx) => {
    if (idx !== currentDayIndex) return day;
    return {
      ...day,
      tasks: day.tasks.map((t) => ({ ...t, done: false, timeSpent: 0, notes: '' })),
    };
  });

  setDayTasks(updatedDayTasks);
  setActiveTimer(null);
  setTimerSeconds(0);
  setTaskNotes({});

  try {
    await updateFirestore(updatedDayTasks);
  } catch (err) {
    console.error("Error resetting day:", err);
  }
};

  const handleRegenerateTasks = () => {
    alert("AI Regeneration coming soon!");
    setOpenRegenDialog(false);
    setRegenInstructions("");
  };

  const handleAddNote = async (taskIndex: number) => {
  if (!userId || !firestoreDocId) return;

  const note = taskNotes[taskIndex] || '';

  const updatedDayTasks = dayTasks.map((day, idx) => {
    if (idx !== currentDayIndex) return day;
    const newTasks = [...day.tasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], notes: note };
    return { ...day, tasks: newTasks };
  });

  setDayTasks(updatedDayTasks);

  try {
    await updateFirestore(updatedDayTasks);
  } catch (err) {
    console.error("Error updating note:", err);
  }

  setExpandedTaskNote(null);
  setTaskNotes(prev => {
    const newNotes = { ...prev };
    delete newNotes[taskIndex];
    return newNotes;
  });
};

  // Loading state
  if (loading) {
    return (
      <div className="bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white text-sm font-semibold">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-transparent flex items-center justify-center p-3">
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 max-w-sm text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-white mb-2">Error</h2>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (dayTasks.length === 0) {
    return (
      <div className="bg-transparent flex items-center justify-center p-3">
        <div className="bg-purple-900/30 border border-purple-500/50 rounded-2xl p-4 max-w-sm text-center">
          <Lightbulb className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-white mb-2">No Tasks Found</h2>
          <p className="text-purple-200 text-sm">Create your first course to get started!</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onDismiss={handleDismissOnboarding} />;
  }

  return (
    <div className="relative h-full bg-transparent p-2.5 sm:p-3">

      {/* COUNTDOWN TIMER BANNER */}
      {nextActionTime && countdownSeconds > 0 && currentDay.tasks.filter(t => !t.done).length > 0 && (
        <div className="w-full mb-3">
          <div
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 shadow-lg
              ${countdownSeconds < 300 ? 'border-pink-500/50' : 'border-purple-500/40'}`}
          >
            <div className={`absolute inset-0 opacity-30 transition-colors duration-700
              ${countdownSeconds < 300
                ? 'bg-gradient-to-br from-pink-700 via-red-700 to-pink-900'
                : 'bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900'}`}
            />
            <div className="relative z-10 flex items-center justify-between px-3 py-2 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{currentDay.title}</h3>
                <p className="text-purple-200 text-xs">{completedTasks}/{totalTasks} Tasks</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                  <span className={`font-mono text-sm font-black tracking-widest tabular-nums
                    ${countdownSeconds < 300 ? 'text-pink-400' : 'text-white'}`}>
                    {Math.floor((countdownSeconds % 3600) / 60).toString().padStart(2, '0')}
                    :{(countdownSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <button onClick={() => setNextActionTime(null)} className="p-1 text-gray-400 hover:text-white rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-1.5 mb-2 px-3.5 py-2 bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-md rounded-2xl border border-purple-400/50 shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-sm font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Your Learning Squad
            </span>
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm leading-tight flex items-center justify-center gap-2"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent font-bold">
              Your Today's Tasks
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-purple-300 mb-2.5"
          >
            Check off your daily tasks and keep making progress!
          </motion.p>
        </motion.div>

        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden shadow-lg">

          {/* Header Section */}
          <div className="bg-gradient-to-br from-purple-800/60 to-pink-900/60 backdrop-blur-sm p-4 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-white">{currentDay.title}</h3>
                  <span className="px-2 py-0.5 bg-purple-900/50 rounded-full text-purple-200 text-xs font-medium">
                    Day {currentDay.dayNumber}
                  </span>
                </div>
              </div>
              <p className="text-purple-200 text-xs font-medium">{completedTasks}/{totalTasks} Tasks</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2.5 bg-purple-950/50">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-r-2xl transition-all duration-500 shadow-md shadow-purple-500/40"
              style={{ width: `${progressPercent}%` }}
            />
            {progressPercent > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white drop-shadow">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            )}
          </div>

          <div className="p-3">

            {/* Day Navigation */}
            <div className="flex items-center justify-between mb-4 gap-1.5">
              <button
                onClick={() => handleDayChange(currentDayIndex - 1)}
                disabled={currentDayIndex === 0}
                className="flex items-center justify-center gap-0.5 min-w-[30px] h-7 px-2 bg-purple-900/50 border border-purple-500/30 rounded-2xl text-white text-xs font-semibold hover:bg-purple-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3 h-3" />
                <span className="hidden lg:inline text-xs">Prev</span>
              </button>

              <div className="flex gap-1.5 overflow-x-auto flex-1 max-w-none px-0.5 scrollbar-hide">
                {dayTasks.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDayChange(idx)}
                    disabled={!day.unlocked}
                    className={`relative flex-shrink-0 transition-all ${idx === currentDayIndex ? "w-8 h-8" : "w-6 h-6"}`}
                  >
                    {idx === currentDayIndex ? (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-500/40 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{day.dayNumber}</span>
                      </div>
                    ) : (
                      <div className={`w-full h-full rounded-2xl transition-all ${
                        day.unlocked
                          ? "bg-purple-500/50 hover:bg-purple-400/70 hover:scale-110 cursor-pointer"
                          : "bg-purple-900/30 cursor-not-allowed"
                      }`}>
                        {!day.unlocked && (
                          <Lock className="w-3 h-3 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleDayChange(currentDayIndex + 1)}
                disabled={currentDayIndex === dayTasks.length - 1 || !dayTasks[currentDayIndex + 1]?.unlocked}
                className="flex items-center justify-center gap-0.5 min-w-[30px] h-7 px-2 bg-purple-900/50 border border-purple-500/30 rounded-2xl text-white text-xs font-semibold hover:bg-purple-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="hidden lg:inline text-xs">Next</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Locked Day Message */}
            {!canAccessDay && (
              <div className="mb-3 p-3 bg-purple-950/50 border border-purple-500/30 rounded-2xl text-center">
                <Lock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <h4 className="text-sm font-bold text-white">Day Locked</h4>
                <p className="text-purple-300 text-xs">Complete all tasks from previous days to unlock!</p>
              </div>
            )}

            {/* Tasks - One at a Time */}
            {canAccessDay && currentDay.tasks.length > 0 && (
              <div className="mb-3">
                {/* Task Counter */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-900/40 backdrop-blur-sm rounded-full border border-purple-500/30">
                    <Target className="w-3 h-3 text-purple-300" />
                    <span className="text-white font-semibold text-xs">
                      Task {currentTaskIndex + 1}/{currentDay.tasks.length}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
                      disabled={currentTaskIndex === 0}
                      className="flex items-center gap-0.5 px-2 py-1 bg-purple-900/50 border border-purple-500/30 rounded-2xl text-white text-xs font-semibold hover:bg-purple-800/50 hover:scale-105 transition-all disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>
                    <button
                      onClick={() => setCurrentTaskIndex(Math.min(currentDay.tasks.length - 1, currentTaskIndex + 1))}
                      disabled={currentTaskIndex === currentDay.tasks.length - 1}
                      className="flex items-center gap-0.5 px-2 py-1 bg-purple-900/50 border border-purple-500/30 rounded-2xl text-white text-xs font-semibold hover:bg-purple-800/50 hover:scale-105 transition-all disabled:opacity-30"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* SPOTLIGHT TASK */}
                {(() => {
                  const taskObj = currentDay.tasks[currentTaskIndex];
                  const index = currentTaskIndex;
                  const isTimerActive = activeTimer === index;
                  const taskTime = taskObj.timeSpent || 0;
                  const displayTime = isTimerActive ? timerSeconds : taskTime;

                  return (
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 blur-xl rounded-2xl" />

                      <div
                        onMouseEnter={() => setHoveredTask(index)}
                        onMouseLeave={() => setHoveredTask(null)}
                        className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
                          taskObj.done
                            ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-400/60 shadow-lg shadow-green-500/20"
                            : "bg-gradient-to-br from-purple-900/60 via-indigo-900/50 to-purple-900/60 border-purple-400/50 hover:border-pink-400/60 shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start gap-2.5 mb-2.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTaskToggle(currentDay.date, index); }}
                            className={`min-w-[20px] w-5 h-5 flex items-center justify-center transition-all flex-shrink-0 border-2 rounded ${
                              taskObj.done ? "bg-green-500 border-green-400" : "bg-transparent border-purple-400 hover:border-purple-300"
                            }`}
                          >
                            {taskObj.done && <Check className="w-3 h-3 text-white" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="max-h-20 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20">
                              <p className={`font-semibold text-white text-base leading-relaxed break-words transition-all ${taskObj.done ? "line-through opacity-60" : ""}`}>
                                {taskObj.task}
                              </p>
                            </div>

                            {!taskObj.done && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-400/40 rounded-full animate-pulse">
                                  <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                                  <span className="text-yellow-200 text-[10px] font-bold">Current Focus</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Task Meta Info */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {taskObj.difficulty && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${getDifficultyColor(taskObj.difficulty)} shadow`}>
                              {taskObj.difficulty.toUpperCase()}
                            </span>
                          )}

                          <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-full shadow">
                            <Zap className="w-3 h-3 text-yellow-300" />
                            <span className="text-white font-black text-[10px]">
                              {Math.round(currentDay.xpPerTask * getDifficultyXPMultiplier(taskObj.difficulty))} XP
                            </span>
                          </div>

                          {displayTime > 0 && (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-800/50 border border-purple-500/30 rounded-full shadow">
                              <Clock className="w-3 h-3 text-purple-300" />
                              <span className="text-white font-bold text-[10px]">{formatTime(displayTime)}</span>
                            </div>
                          )}
                        </div>

                        {/* Task Notes */}
                        {taskObj.notes && (
                          <div className="mt-2 p-2.5 bg-purple-950/50 border border-purple-600/30 rounded-xl max-h-28 overflow-y-auto">
                            <div className="flex items-start gap-1.5 mb-1">
                              <MessageCircle className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                              <span className="text-purple-300 font-bold text-[10px]">Your Notes:</span>
                            </div>
                            <p className="text-purple-100 text-[10px] leading-relaxed pl-4">{taskObj.notes}</p>
                          </div>
                        )}

                        {/* Add Note */}
                        {expandedTaskNote === index && (
                          <div className="mt-2 p-3 bg-purple-950/50 border border-purple-500/30 rounded-xl" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={taskNotes[index] || taskObj.notes || ''}
                              onChange={(e) => setTaskNotes({ ...taskNotes, [index]: e.target.value })}
                              placeholder="Add reflection, learnings, or notes..."
                              className="w-full px-3 py-2 bg-purple-900/50 border border-purple-500/30 rounded-xl text-white text-xs placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/20 resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddNote(index)}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-xs font-bold transition-all text-white shadow hover:scale-105"
                              >
                                Save Note
                              </button>
                              <button
                                onClick={() => {
                                  setExpandedTaskNote(null);
                                  setTaskNotes(prev => { const n = { ...prev }; delete n[index]; return n; });
                                }}
                                className="flex-1 px-3 py-2 bg-purple-900/60 hover:bg-purple-800/60 rounded-xl text-xs font-bold transition-all text-white border border-purple-500/30 hover:scale-105"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Start Task Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGetLiveSupport(taskObj, index); }}
                          disabled={loadingLiveSupport}
                          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 rounded-2xl text-white text-sm font-black shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mt-2.5"
                          style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                          <span className="relative z-10 flex items-center gap-2">
                            {loadingLiveSupport ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Loading AI Coach...
                              </>
                            ) : (
                              <>Start task now!</>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Day Complete */}
            {canAccessDay && isAllCompleted && (
              <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-white text-sm shadow shadow-yellow-500/30 animate-pulse">
                <Award className="w-4 h-4" />
                🎉 Day Complete!
              </div>
            )}
          </div>
        </div>

        {/* Stats Modal */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3" onClick={() => setShowStatsModal(false)}>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl p-4 max-w-sm w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Your Progress</h3>
                </div>
                <button onClick={() => setShowStatsModal(false)} className="p-1.5 hover:bg-purple-800/50 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 bg-purple-950/30 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-purple-300 text-[10px]">Total XP</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.totalXP}</p>
                </div>
                <div className="p-2.5 bg-purple-950/30 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-purple-300 text-[10px]">Days Done</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.totalDaysCompleted}</p>
                </div>
                <div className="p-2.5 bg-purple-950/30 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-purple-300 text-[10px]">Streak</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.currentStreak}</p>
                </div>
                <div className="p-2.5 bg-purple-950/30 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-purple-300 text-[10px]">Avg Time</span>
                  </div>
                  <p className="text-xl font-bold text-white">{formatTime(stats.averageTaskTime)}</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl border border-purple-500/20 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">Daily Progress</h4>
                </div>
                <div className="space-y-1.5">
                  {dayTasks.map((day, idx) => {
                    const completed = day.tasks.filter(t => t.done).length;
                    const total = day.tasks.length;
                    const percent = (completed / total) * 100;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-purple-300 text-[10px] font-medium w-12">Day {day.dayNumber}</span>
                        <div className="flex-1 h-4 bg-purple-950/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${percent}%` }}
                          >
                            {percent > 20 && (
                              <span className="text-[9px] font-bold text-white">{completed}/{total}</span>
                            )}
                          </div>
                        </div>
                        {day.unlocked ? (
                          percent === 100
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            : <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-200 text-xs font-semibold">Pro Tip!</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed">
                    Use <span className="font-bold text-blue-300">🤖 AI Coach</span> to get personalized guidance and earn <span className="font-bold text-yellow-300">2x XP</span>!
                  </p>
                </div>

                <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-purple-300 text-xs font-semibold">Keep Going!</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed">
                    You're building incredible life skills. Every small action compounds into lasting confidence.
                    {stats.currentStreak > 0 && ` Your ${stats.currentStreak}-day streak shows real commitment!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Regeneration Dialog */}
        {openRegenDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3" onClick={() => setOpenRegenDialog(false)}>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/30 rounded-2xl p-4 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">Regenerate Tasks</h3>
              </div>
              <p className="text-purple-200 text-xs mb-3 leading-relaxed">
                Give instructions to customize your tasks (e.g., "Make them easier", "Focus on public speaking")
              </p>
              <textarea
                value={regenInstructions}
                onChange={(e) => setRegenInstructions(e.target.value)}
                placeholder="e.g., Make these tasks more specific and actionable"
                rows={3}
                className="w-full px-3 py-2 bg-purple-950/50 border border-purple-500/30 rounded-xl text-white text-xs placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setOpenRegenDialog(false)}
                  className="flex-1 px-3 py-2 bg-purple-900/50 border border-purple-500/30 rounded-xl text-white text-xs font-semibold hover:bg-purple-800/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateTasks}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-xs shadow hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}