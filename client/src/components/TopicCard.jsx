import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';

const TopicCard = ({ topic }) => {
  const completed = topic.stats?.completed ?? topic.stats?.done ?? 0;
  const total = topic.stats?.total || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const easy = {
    completed: topic.stats?.easy?.completed ?? topic.stats?.easy?.done ?? 0,
    total: topic.stats?.easy?.total || 0
  };
  const medium = {
    completed: topic.stats?.medium?.completed ?? topic.stats?.medium?.done ?? 0,
    total: topic.stats?.medium?.total || 0
  };
  const hard = {
    completed: topic.stats?.hard?.completed ?? topic.stats?.hard?.done ?? 0,
    total: topic.stats?.hard?.total || 0
  };

  return (
    <Link 
      to={`/topic/${topic.slug}`}
      className="group relative p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
            Topic {String(topic.index).padStart(2, '0')}
          </span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {percentage}%
          </span>
        </div>

        <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1">
          {topic.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>Progress</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {completed} / {total}
          </span>
        </div>

        <ProgressBar value={completed} max={total} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-center">
        <div className="bg-gray-50/50 dark:bg-gray-800/30 py-1.5 px-1 rounded-lg">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block">Easy</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{easy.completed}/{easy.total}</span>
        </div>
        <div className="bg-gray-50/50 dark:bg-gray-800/30 py-1.5 px-1 rounded-lg">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block">Med</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{medium.completed}/{medium.total}</span>
        </div>
        <div className="bg-gray-50/50 dark:bg-gray-800/30 py-1.5 px-1 rounded-lg">
          <span className="text-[10px] uppercase font-semibold text-gray-400 block">Hard</span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{hard.completed}/{hard.total}</span>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
