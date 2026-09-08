import React from 'react';
import { CheckCircle2, Circle, FileText, ExternalLink, BookOpen, Code2, Pencil } from 'lucide-react';

const DifficultyBadge = ({ difficulty }) => {
  const diff = (difficulty || 'Medium').toLowerCase();
  
  const styles = {
    easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${styles[diff] || styles.easy}`}>
      {difficulty}
    </span>
  );
};

const ProblemRow = ({ problem, onToggleStatus, onUpdateStatus, onOpenNotes, onOpenEditLink, onOpenCode }) => {
  const isDone = problem.status === 'done';
  const hasNotes = Boolean(problem.notes);
  const hasSolution = Boolean(problem.solutionUrl);
  
  // Clean fallback for LeetCode URL if not explicitly populated
  const leetcodeLink = problem.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problem.title)}`;

  const statusConfig = {
    'todo': {
      label: 'To Do',
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
    'done': {
      label: 'Completed',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    },
    'revision': {
      label: 'Needs Review',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
    },
  };

  return (
    <tr className={`border-b border-gray-100 dark:border-gray-800/80 transition-all duration-150 hover:bg-emerald-50/30 dark:hover:bg-gray-800/40 group ${isDone ? 'bg-emerald-500/[0.02]' : ''}`}>
      {/* Checkbox */}
      <td className="p-3.5 whitespace-nowrap w-12 text-center">
        <button 
          onClick={() => onToggleStatus(problem.number, problem.status)}
          className="relative inline-flex items-center justify-center p-1 rounded-lg transition-transform active:scale-90 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400"
          title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 transition-transform duration-200 scale-110" />
          ) : (
            <Circle className="w-5 h-5 transition-colors group-hover:text-emerald-400/80" />
          )}
        </button>
      </td>

      {/* Number */}
      <td className="p-3.5 whitespace-nowrap text-xs font-mono font-semibold text-gray-400 dark:text-gray-500 w-14">
        #{String(problem.number).padStart(3, '0')}
      </td>

      {/* Title & Badges */}
      <td className="p-3.5 w-full">
        <div className="flex items-center flex-wrap gap-2">
          <a
            href={leetcodeLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline ${
              isDone ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {problem.title}
          </a>

          {/* Original 369 Golden Badge */}
          {problem.isOriginal && (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs"
              title="Part of the core original Striver 369 Sheet"
            >
              <span>⭐</span>
              <span>369 Core</span>
            </span>
          )}
        </div>
      </td>

      {/* Difficulty */}
      <td className="p-3.5 whitespace-nowrap">
        <DifficultyBadge difficulty={problem.difficulty} />
      </td>

      {/* Status Dropdown */}
      <td className="p-3.5 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <select
            value={problem.status}
            onChange={(e) => onUpdateStatus(problem.number, e.target.value)}
            className={`text-xs font-medium px-2.5 py-1 rounded-md border cursor-pointer transition-colors bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${statusConfig[problem.status]?.color}`}
          >
            <option value="todo" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">To Do</option>
            <option value="in-progress" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">In Progress</option>
            <option value="done" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Completed</option>
            <option value="revision" className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">Needs Review</option>
          </select>
          {isDone && problem.completedAt && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-1">
              {new Date(problem.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </td>

      {/* Practice Links (LeetCode & Editorial) */}
      <td className="p-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* Segmented LeetCode Button + Quick Edit */}
          <div className="inline-flex items-center rounded-lg bg-amber-500/10 border border-amber-500/30 shadow-xs hover:border-amber-500/50 transition-all">
            <a
              href={leetcodeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
              title={`Open "${problem.title}" on LeetCode`}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-500" />
              <span>LeetCode ↗</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenEditLink(problem)}
              className="px-1.5 py-1 border-l border-amber-500/20 text-amber-600/70 hover:text-amber-600 dark:text-amber-400/70 dark:hover:text-amber-300 hover:bg-amber-500/20 rounded-r-lg transition-colors cursor-pointer"
              title="Change or fix LeetCode link"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>

      {/* Notes & Solution Actions */}
      <td className="p-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => onOpenNotes(problem)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              hasNotes 
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-500/20 border border-emerald-500/30' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={hasNotes ? 'Edit Notes' : 'Add Notes'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{hasNotes ? 'Notes' : '+Note'}</span>
          </button>

          <button 
            onClick={() => onOpenCode(problem)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              problem.solutions?.length > 0
                ? 'text-brand-700 dark:text-brand-400 bg-brand-100/70 dark:bg-brand-500/20 border border-brand-500/30' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Manage Code Solutions"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{problem.solutions?.length || 0} Code</span>
          </button>
          
          {hasSolution && (
            <a 
              href={problem.solutionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors"
              title="Custom Solution Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProblemRow;
