import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BarChart3 } from 'lucide-react';
import { TOPICS } from '../components/Layout';
import { useProblems } from '../hooks/useProblems';
import FilterBar from '../components/FilterBar';
import ProblemTable from '../components/ProblemTable';
import ProgressBar from '../components/ProgressBar';

const TopicPage = () => {
  const { slug } = useParams();
  
  const topic = useMemo(() => TOPICS.find(t => t.slug === slug), [slug]);
  
  const { 
    problems, 
    loading, 
    filters, 
    updateFilters, 
    toggleStatus, 
    updateProblem, 
    refetch,
    stats 
  } = useProblems({ topic: topic?.name });

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Topic not found</h2>
        <Link to="/" className="mt-4 text-emerald-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  // Topic specific stats are either coming from the problems hook or we calculate them locally if hook doesn't provide it based on filtered query
  // For the header, we want total stats for the topic, not just the filtered ones.
  // The backend should return `stats` in the fetchProblems response representing the filtered result or topic result.
  // Assuming stats contains the topic stats if we sent topic filter.
  
  const topicStats = stats || {
    completed: problems.filter(p => p.status === 'done').length,
    total: problems.length || 1, // avoid div by 0
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{topic.name}</span>
        </nav>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-bold">
                Topic {topic.index}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.name}</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Master these problems to ace your interviews
            </p>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-300">Progress</span>
              <span className="text-emerald-600 dark:text-emerald-500">
                {topicStats.completed} / {topicStats.total}
              </span>
            </div>
            <ProgressBar value={topicStats.completed} max={topicStats.total} size="lg" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar 
        filters={filters} 
        onUpdateFilters={updateFilters} 
        resultCount={problems.length}
      />

      {/* Table */}
      <ProblemTable 
        problems={problems}
        loading={loading}
        onToggleStatus={toggleStatus}
        onUpdateProblem={updateProblem}
        refetch={refetch}
        defaultTopic={topic.name}
      />
    </div>
  );
};

export default TopicPage;
