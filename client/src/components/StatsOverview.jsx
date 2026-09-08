import React from 'react';
import { Flame, CheckCircle2, Trophy, Zap } from 'lucide-react';
import ProgressBar from './ProgressBar';

const CircularProgress = ({ value, max, size = 110, strokeWidth = 9 }) => {
  const safeMax = max > 0 ? max : 1000;
  const safeValue = value || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(safeValue / safeMax, 1);
  const offset = circumference - percent * circumference;
  const displayPercent = Math.round(percent * 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200/60 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? circumference : offset}
          className="text-emerald-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {displayPercent}%
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          {safeValue}/{safeMax}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ title, completed, total, colorClass, bgClass, badgeClass }) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {percent}%
        </span>
      </div>
      
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`text-2xl font-black ${colorClass}`}>{completed || 0}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">/ {total || 0}</span>
      </div>

      <ProgressBar value={completed} max={total} color={bgClass} size="sm" />
    </div>
  );
};

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const totalCompleted = stats.done ?? stats.totalCompleted ?? 0;
  const total = stats.total || 1000;
  const streak = stats.streak ?? stats.currentStreak ?? 0;

  const easy = {
    completed: stats.easy?.completed ?? stats.easy?.done ?? stats.byDifficulty?.Easy?.done ?? 0,
    total: stats.easy?.total ?? stats.byDifficulty?.Easy?.total ?? 0,
  };
  const medium = {
    completed: stats.medium?.completed ?? stats.medium?.done ?? stats.byDifficulty?.Medium?.done ?? 0,
    total: stats.medium?.total ?? stats.byDifficulty?.Medium?.total ?? 0,
  };
  const hard = {
    completed: stats.hard?.completed ?? stats.hard?.done ?? stats.byDifficulty?.Hard?.done ?? 0,
    total: stats.hard?.total ?? stats.byDifficulty?.Hard?.total ?? 0,
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Hero Progress Card */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-md flex items-center justify-between col-span-1 md:col-span-2 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full w-fit">
            <Zap className="w-3.5 h-3.5" />
            <span>Roadmap Velocity</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {totalCompleted} / {total} Completed
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
            {totalCompleted === 0 
              ? "Your DSA mastery starts today! Pick a topic and solve your first problem." 
              : `Awesome momentum! You've conquered ${totalCompleted} algorithmic challenges.`}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-500/30 shadow-xs">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{streak} Day Active Streak</span>
            </div>
          </div>
        </div>

        <CircularProgress value={totalCompleted} max={total} size={110} strokeWidth={9} />
      </div>

      {/* Difficulty Breakdown Cards */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-3">
        <StatCard 
          title="Easy" 
          completed={easy.completed} 
          total={easy.total} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
          bgClass="bg-emerald-500" 
          badgeClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard 
          title="Medium" 
          completed={medium.completed} 
          total={medium.total} 
          colorClass="text-amber-600 dark:text-amber-400" 
          bgClass="bg-amber-500" 
          badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard 
          title="Hard" 
          completed={hard.completed} 
          total={hard.total} 
          colorClass="text-rose-600 dark:text-rose-400" 
          bgClass="bg-rose-500" 
          badgeClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
      </div>
    </div>
  );
};

export default StatsOverview;
