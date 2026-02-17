import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Heart, Calendar, Edit2, Check, X } from "lucide-react";

interface DayData {
  day: string;
  date: string;
  level: number | null; // 0-10 scale, null if not set
}

const AnxietyTracker = () => {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempLevel, setTempLevel] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize the 5 days
  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const today = new Date();
    const initData: DayData[] = days.map((day, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (4 - idx)); // Last 5 days
      return {
        day,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        level: null
      };
    });
    setWeekData(initData);
  }, []);

  const updateLevel = (dayIndex: number) => {
    const level = parseInt(tempLevel);
    if (level >= 0 && level <= 10) {
      const newData = [...weekData];
      newData[dayIndex].level = level;
      setWeekData(newData);
      setEditingDay(null);
      setTempLevel("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setTempLevel("");
  };

  const getBarHeight = (level: number | null) => {
    if (level === null) return 0;
    return (level / 10) * 100;
  };

  const getBarColor = (level: number | null) => {
    if (level === null) return 'from-gray-500 to-gray-600';
    if (level <= 3) return 'from-green-500 to-emerald-500';
    if (level <= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const calculateAverage = () => {
    const validLevels = weekData.filter(d => d.level !== null).map(d => d.level as number);
    if (validLevels.length === 0) return null;
    return (validLevels.reduce((a, b) => a + b, 0) / validLevels.length).toFixed(1);
  };

  const getTrend = () => {
    const validData = weekData.filter(d => d.level !== null);
    if (validData.length < 2) return null;
    
    const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
    const secondHalf = validData.slice(Math.ceil(validData.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + (b.level as number), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + (b.level as number), 0) / secondHalf.length;
    
    return secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'increasing' : 'stable';
  };

  const average = calculateAverage();
  const trend = getTrend();

  return (
    <div >
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">
            Anxiety Tracker
          </h1>
          <p className="text-base text-purple-300">
            Track your anxiety levels over 5 days
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-purple-900/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-xs">Average Level</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {average !== null ? average : '--'}
              <span className="text-sm text-purple-300 ml-1">/10</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-purple-900/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              {trend === 'improving' ? (
                <TrendingDown className="w-4 h-4 text-green-400" />
              ) : trend === 'increasing' ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : (
                <TrendingUp className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-purple-300 text-xs">Trend</span>
            </div>
            <p className="text-lg font-bold text-white capitalize">
              {trend || 'No data'}
            </p>
          </motion.div>
        </div>

        {/* Chart Container */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-purple-900/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-5 shadow-2xl shadow-purple-500/20"
        >
          {/* Graph Area */}
          <div className="flex gap-3">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-64 text-purple-300 text-xs font-semibold pt-2 pb-12">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            {/* Graph Container */}
            <div className="flex-1 relative h-64">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full h-px bg-purple-700/40" />
                ))}
              </div>

              {/* Bars Container */}
              <div className="absolute inset-0 flex items-end justify-around gap-2 pb-12 pt-2">
                {weekData.map((data, idx) => (
                  <div key={idx} className="flex-1 max-w-[70px] h-full flex flex-col items-center justify-end relative">
                    {editingDay === idx ? (
                      <div className="absolute bottom-0 w-full flex flex-col items-center gap-2 z-20">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={tempLevel}
                          onChange={(e) => setTempLevel(e.target.value)}
                          placeholder="0-10"
                          className="w-16 px-2 py-1.5 bg-purple-950/90 border-2 border-purple-400 rounded-lg text-white text-center text-sm focus:outline-none focus:border-pink-400 font-bold"
                          autoFocus
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateLevel(idx)}
                            className="p-1.5 bg-green-600 rounded-lg hover:bg-green-500 transition-colors shadow-lg"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-red-600 rounded-lg hover:bg-red-500 transition-colors shadow-lg"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ 
                          height: data.level !== null ? `${getBarHeight(data.level)}%` : '8px'
                        }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`w-full rounded-t-lg bg-gradient-to-t ${getBarColor(data.level)} shadow-lg cursor-pointer hover:scale-105 transition-all relative group`}
                        onClick={() => {
                          setEditingDay(idx);
                          setTempLevel(data.level?.toString() || "");
                        }}
                        style={{ minHeight: '8px' }}
                      >
                        {data.level !== null && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-950/95 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-purple-400/40 shadow-xl whitespace-nowrap">
                            <span className="text-white text-xs font-bold">{data.level}/10</span>
                          </div>
                        )}
                        {data.level === null && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Edit2 className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Day Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                {weekData.map((data, idx) => (
                  <div key={idx} className="flex-1 max-w-[70px] text-center">
                    <p className="text-white font-bold text-sm">{data.day}</p>
                    <p className="text-purple-400 text-xs">{data.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enter Button */}
          <button
            onClick={() => {
              const nextEmptyDay = weekData.findIndex(d => d.level === null);
              if (nextEmptyDay !== -1) {
                setEditingDay(nextEmptyDay);
                setTempLevel("");
              } else {
                setEditingDay(weekData.length - 1);
                setTempLevel(weekData[weekData.length - 1].level?.toString() || "");
              }
            }}
            className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-white text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Enter Your Anxiety Levels
          </button>

          {/* Instructions */}
          <div className="mt-3 p-3 bg-purple-950/40 rounded-lg border border-purple-500/20">
            <p className="text-purple-200 text-xs text-center">
              Click any bar or the button to set anxiety level (0-10)
            </p>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-4 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl border border-blue-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 font-semibold text-sm">Understanding the Scale</span>
          </div>
          <div className="space-y-1 text-xs text-blue-100">
            <p><span className="font-bold text-green-400">0-3:</span> Low anxiety - feeling calm</p>
            <p><span className="font-bold text-yellow-400">4-6:</span> Moderate anxiety - manageable</p>
            <p><span className="font-bold text-red-400">7-10:</span> High anxiety - significant distress</p>
          </div>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 rounded-xl shadow-2xl border-2 border-green-400/50"
          >
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Level updated successfully!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnxietyTracker;