import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BarChart3, ChevronRight, CheckCircle2, Flame, Award } from 'lucide-react';
import { useProblems } from '../hooks/useProblems';
import { fetchOriginalStats } from '../api/client';
import ProblemTable from '../components/ProblemTable';
import FilterBar from '../components/FilterBar';
import ProgressBar from '../components/ProgressBar';
import { TOPICS } from '../components/Layout';

const Original369Page = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sheetStats, setSheetStats] = useState(null);

  const {
    problems,
    loading,
    filters,
    updateFilters,
    toggleStatus,
    updateProblem,
    refetch
  } = useProblems({
    isOriginal: 'true',
    topic: selectedTopic || undefined
  });

  const loadStats = async () => {
    try {
      const data = await fetchOriginalStats();
      setSheetStats(data);
    } catch (e) {
      console.error('Failed to load 369 stats', e);
    }
  };

  useEffect(() => {
    loadStats();
  }, [problems]);

  const completedCount = problems.filter(p => p.status === 'done').length;
  const totalInView = problems.length;
  const overallCompleted = sheetStats?.done ?? completedCount;
  const overallTotal = sheetStats?.total ?? 369;
  const percentage = overallTotal > 0 ? ((overallCompleted / overallTotal) * 100).toFixed(1) : 0;

  const handleTopicSelect = (topicName) => {
    setSelectedTopic(topicName);
    updateFilters({ topic: topicName || undefined });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
          <span>⭐</span> Original 369 Sheet
        </span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-emerald-500/5 p-6 md:p-8 backdrop-blur-md shadow-lg shadow-amber-500/5">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Striver's Flagship Core Curriculum</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Original 369 DSA Sheet
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              The original 369 curated interview questions that built the foundation of Striver's A2Z roadmap.
              Mastering these gives you direct coverage of top product-based company patterns.
            </p>
          </div>

          {/* Progress Card */}
          <div className="w-full lg:w-72 p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-amber-500/30 shadow-md flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sheet Progress
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base">
                {overallCompleted} / {overallTotal}
              </span>
            </div>
            <ProgressBar value={overallCompleted} max={overallTotal} color="bg-amber-500" size="lg" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>{percentage}% Completed</span>
              <span>{overallTotal - overallCompleted} Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown for 369 Sheet */}
      {sheetStats && (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-emerald-500/20 shadow-xs flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              Easy
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {sheetStats.easy?.done || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {sheetStats.easy?.total || 0}
              </span>
            </div>
            <ProgressBar value={sheetStats.easy?.done} max={sheetStats.easy?.total} color="bg-emerald-500" size="sm" />
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-amber-500/20 shadow-xs flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
              Medium
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {sheetStats.medium?.done || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {sheetStats.medium?.total || 0}
              </span>
            </div>
            <ProgressBar value={sheetStats.medium?.done} max={sheetStats.medium?.total} color="bg-amber-500" size="sm" />
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-rose-500/20 shadow-xs flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
              Hard
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {sheetStats.hard?.done || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {sheetStats.hard?.total || 0}
              </span>
            </div>
            <ProgressBar value={sheetStats.hard?.done} max={sheetStats.hard?.total} color="bg-rose-500" size="sm" />
          </div>
        </div>
      )}

      {/* Topic Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleTopicSelect('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedTopic
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
              : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-amber-500/40'
          }`}
        >
          All 16 Topics (369)
        </button>
        {TOPICS.map(t => (
          <button
            key={t.slug}
            onClick={() => handleTopicSelect(t.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTopic === t.name
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-amber-500/40'
            }`}
          >
            {t.index}. {t.name}
          </button>
        ))}
      </div>

      {/* Filter Controls */}
      <FilterBar
        filters={filters}
        onUpdateFilters={updateFilters}
        resultCount={problems.length}
      />

      {/* Problems Table */}
      <ProblemTable
        problems={problems}
        loading={loading}
        onToggleStatus={toggleStatus}
        onUpdateProblem={updateProblem}
        refetch={() => {
          refetch();
          loadStats();
        }}
        defaultTopic={selectedTopic || 'Arrays'}
      />
    </div>
  );
};

export default Original369Page;
