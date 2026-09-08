import React, { useState, useEffect, useRef } from 'react';
import { X, Code2, Search, ExternalLink, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const cleanLeetCodeUrl = (rawInput) => {
  if (!rawInput) return '';
  let input = rawInput.trim();
  
  // Remove markdown brackets/parens if pasted as markdown link
  input = input.replace(/^\[.*?\]\((.*?)\)$/, '$1').trim();

  // If it's a full LeetCode URL, extract the problem slug
  const match = input.match(/leetcode\.com\/problems\/([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return `https://leetcode.com/problems/${match[1]}/`;
  }

  // If user pasted just the slug or path
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    const slugOnly = input.replace(/^\/problems\//, '').replace(/\/$/, '').trim();
    if (slugOnly) {
      return `https://leetcode.com/problems/${slugOnly}/`;
    }
  }

  return input;
};

export const slugifyTitle = (title) => {
  if (!title) return '';
  const clean = title.trim().toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `https://leetcode.com/problems/${clean}/`;
};

const EditLinkModal = ({ problem, onClose, onSave }) => {
  const [url, setUrl] = useState(problem.leetcodeUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleFormSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, onClose]);

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalUrl = cleanLeetCodeUrl(url);

    if (!finalUrl) {
      toast.error('Please enter a valid LeetCode link or slug');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(problem.number, { leetcodeUrl: finalUrl });
      toast.success(`Updated LeetCode link for #${problem.number}!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update LeetCode link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchLeetCode = () => {
    const searchUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problem.title)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAutoGenerate = () => {
    const generated = slugifyTitle(problem.title);
    setUrl(generated);
    toast.success('Generated suggested link from title');
  };

  const handleTestLink = () => {
    const cleaned = cleanLeetCodeUrl(url);
    if (!cleaned) {
      toast.error('No URL entered yet');
      return;
    }
    window.open(cleaned, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  #{String(problem.number).padStart(3, '0')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {problem.topic}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                {problem.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <span>LeetCode Problem URL</span>
              </label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Auto-cleans slug on save
              </span>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/problem-slug/ or problem-slug"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none font-mono transition-all"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Helper Tools Bar */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleSearchLeetCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
              title="Search this exact problem title on LeetCode in a new tab"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search on LeetCode ↗</span>
            </button>

            <button
              type="button"
              onClick={handleAutoGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
              title="Generate URL slug automatically from title"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate from Title</span>
            </button>

            {url && (
              <button
                type="button"
                onClick={handleTestLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-500/20 transition-all ml-auto cursor-pointer"
                title="Open and test current link in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link ↗</span>
              </button>
            )}
          </div>

          {/* Quick info tip */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <span>💡 Tip:</span>
            </div>
            <p>
              Paste any LeetCode URL (e.g. including <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px]">/description/</code>) or just the slug. Click <strong>"Search on LeetCode ↗"</strong> to quickly find the exact match if you are unsure.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save LeetCode Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;
