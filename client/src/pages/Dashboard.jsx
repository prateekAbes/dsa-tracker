import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Award, Plus, Flame, CheckCircle2 } from 'lucide-react';
import StatsOverview from '../components/StatsOverview';
import TopicCard from '../components/TopicCard';
import AddProblemModal from '../components/AddProblemModal';
import ProgressBar from '../components/ProgressBar';
import { fetchStats, fetchTopicStats, fetchOriginalStats, createProblem } from '../api/client';
import { TOPICS } from '../components/Layout';

const SkeletonCard = () => (
  <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 h-36 animate-pulse flex flex-col justify-between">
    <div className="flex justify-between">
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
    <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full" />
    <div className="flex gap-2">
      <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
  </div>
);

const Dashboard = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [topicStats, setTopicStats] = useState({});
  const [originalStats, setOriginalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gStats, tStats, oStats] = await Promise.all([
        fetchStats(),
        fetchTopicStats(),
        fetchOriginalStats().catch(() => null)
      ]);
      setGlobalStats(gStats);
      setOriginalStats(oStats);
      
      const statsMap = {};
      if (Array.isArray(tStats)) {
        tStats.forEach(stat => {
          statsMap[stat.topic || stat._id] = stat;
        });
      }
      setTopicStats(statsMap);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProblem = async (problemData) => {
    await createProblem(problemData);
    loadData();
  };

  const topicsWithStats = TOPICS.map(t => ({
    ...t,
    stats: topicStats[t.name] || {
      completed: 0,
      total: 0,
      easy: { completed: 0, total: 0 },
      medium: { completed: 0, total: 0 },
      hard: { completed: 0, total: 0 }
    }
  }));

  const origDone = originalStats?.done || 0;
  const origTotal = originalStats?.total || 369;
  const origPercent = origTotal > 0 ? ((origDone / origTotal) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Global Stats Overview */}
      <StatsOverview stats={globalStats} />

      {/* Featured Banner: Striver's Original 369 Sheet */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-emerald-500/5 p-6 md:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Special Focused Section</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>⭐ Striver Original 369 Sheet</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Need a targeted revision? Practice the core 369 foundational problems that form the heart of the roadmap.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Core Progress
              </span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                {origDone} / {origTotal} <span className="text-xs font-normal text-gray-400">({origPercent}%)</span>
              </span>
              <div className="w-32">
                <ProgressBar value={origDone} max={origTotal} color="bg-amber-500" size="sm" />
              </div>
            </div>

            <Link
              to="/original-369"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>Explore 369 Sheet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Topics Grid Section */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Curated Roadmap Topics
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              16 essential DSA topics covering 1000 problems from basic arrays to advanced strings
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Problem</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(16)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            topicsWithStats.map(topic => (
              <TopicCard key={topic.slug} topic={topic} />
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddProblemModal
          defaultTopic="Arrays"
          onClose={() => setShowAddModal(false)}
          onProblemAdded={handleAddProblem}
        />
      )}
    </div>
  );
};

export default Dashboard;
