import React from 'react';
import { Search, Filter, Sparkles, X } from 'lucide-react';

const FilterBar = ({ filters, onUpdateFilters, resultCount }) => {
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'done' },
    { label: 'Needs Review', value: 'revision' }
  ];

  const isOriginalActive = filters.isOriginal === 'true' || filters.isOriginal === true;

  return (
    <div className="flex flex-col gap-4 p-4 mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search problems by title, keywords..."
            value={filters.search || ''}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            className="block w-full pl-10 pr-9 py-2 text-sm border border-gray-200 dark:border-gray-700/80 rounded-xl bg-gray-50/60 dark:bg-gray-950/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Difficulty Pills */}
          <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            {difficulties.map(diff => {
              const isActive = (filters.difficulty || 'All') === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onUpdateFilters({ difficulty: diff === 'All' ? '' : diff })}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs scale-102'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>

          {/* Status Dropdown */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select
              value={filters.status || ''}
              onChange={(e) => onUpdateFilters({ status: e.target.value })}
              className="pl-8 pr-8 py-1.5 bg-gray-50/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white text-xs font-medium rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 block appearance-none cursor-pointer outline-none"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Original 369 Filter Button */}
          <button
            onClick={() => onUpdateFilters({ isOriginal: isOriginalActive ? '' : 'true' })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isOriginalActive
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20 ring-2 ring-amber-500/30'
                : 'bg-amber-50/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-100/70 dark:hover:bg-amber-500/20'
            }`}
            title="Filter by original 369 Striver questions"
          >
            <span>⭐</span>
            <span>Original 369</span>
            {isOriginalActive && (
              <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Active</span>
            )}
          </button>
        </div>
      </div>
      
      {resultCount !== undefined && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800/60">
          <span>Showing <strong className="text-gray-800 dark:text-gray-200">{resultCount}</strong> problems</span>
          {(filters.search || filters.difficulty || filters.status || isOriginalActive) && (
            <button
              onClick={() => onUpdateFilters({ search: '', difficulty: '', status: '', isOriginal: '' })}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
