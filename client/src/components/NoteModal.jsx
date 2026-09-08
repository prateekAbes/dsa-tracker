import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Code2, Sparkles, BookOpen, Search, Check } from 'lucide-react';
import { cleanLeetCodeUrl } from './EditLinkModal';

const NoteModal = ({ problem, onClose, onSave }) => {
  const [title, setTitle] = useState(problem.title || '');
  const [difficulty, setDifficulty] = useState(problem.difficulty || 'Medium');
  const [notes, setNotes] = useState(problem.notes || '');
  const [solutionUrl, setSolutionUrl] = useState(problem.solutionUrl || '');
  const [leetcodeUrl, setLeetcodeUrl] = useState(problem.leetcodeUrl || '');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, title, difficulty, notes, solutionUrl, leetcodeUrl]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSave(problem.number, {
      title: title.trim() || problem.title,
      difficulty,
      notes,
      solutionUrl: solutionUrl.trim(),
      leetcodeUrl: cleanLeetCodeUrl(leetcodeUrl)
    });
  };

  const handleSearchLeetCode = () => {
    const searchUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title || problem.title)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                #{String(problem.number).padStart(3, '0')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {problem.topic}
              </span>
              {problem.isOriginal && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  ⭐ 369 Core
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Problem & Notes
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Title and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-1">
                Problem Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* LeetCode Practice URL */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                LeetCode URL
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSearchLeetCode}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3 h-3" /> Search LeetCode
                </button>
                {leetcodeUrl && (
                  <a 
                    href={cleanLeetCodeUrl(leetcodeUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Test Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/... or problem-slug"
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all font-mono text-xs"
            />
          </div>

          {/* Custom Solution URL */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Personal Solution URL (GitHub / Gist / Blog)
              </label>
              {solutionUrl && (
                <a 
                  href={solutionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              value={solutionUrl}
              onChange={(e) => setSolutionUrl(e.target.value)}
              placeholder="https://github.com/... or https://gist.github.com/..."
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-xs"
            />
          </div>

          {/* Personal Notes */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Personal Notes & Approach
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="💡 Key intuition, edge cases, time/space complexity, tricky points..."
              rows={5}
              className="w-full p-3.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none leading-relaxed"
            />
          </div>
          
          {/* Footer actions */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
