import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Code2, Sparkles, Check, Search, ExternalLink, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';
import { TOPICS } from './Layout';
import { cleanLeetCodeUrl, slugifyTitle } from './EditLinkModal';
import toast from 'react-hot-toast';

export const titleFromLeetCodeSlug = (rawInput) => {
  if (!rawInput) return '';
  let slug = rawInput.trim();
  const match = slug.match(/leetcode\.com\/problems\/([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    slug = match[1];
  } else {
    slug = slug.replace(/^https?:\/\//, '').replace(/\/problems\//, '').replace(/\/.*$/, '').trim();
  }
  
  // Format slug words
  const words = slug.split(/[-_]+/).filter(Boolean);
  const roman = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']);
  const acronyms = new Set(['lru', 'lfu', 'bst', 'dsa', 'dp', 'kmp', 'bfs', 'dfs', 'trie', 'sql', 'gcd', 'lcm']);
  
  return words.map(w => {
    const lower = w.toLowerCase();
    if (roman.has(lower)) return lower.toUpperCase();
    if (acronyms.has(lower)) return lower.toUpperCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
};

export const detectTopicFromTitle = (title) => {
  if (!title) return null;
  const t = title.toLowerCase();
  
  if (/\b(binary\s*search|search\s*in\s*rotated|median\s*of\s*two|peak\s*element)\b/i.test(t)) return 'Binary Search';
  if (/\b(bst|binary\s*search\s*tree|validate\s*binary\s*search|kth\s*smallest.*bst|lca.*bst)\b/i.test(t)) return 'Binary Search Trees';
  if (/\b(tree|trees|inorder|preorder|postorder|level\s*order|diameter.*tree|symmetric\s*tree|path\s*sum)\b/i.test(t)) return 'Binary Trees';
  if (/\b(linked\s*list|list\s*node|reverse\s*list|merge\s*two\s*sorted\s*lists|reorder\s*list|palindrome\s*linked|cycle)\b/i.test(t)) return 'Linked List';
  if (/\b(graph|graphs|course\s*schedule|clone\s*graph|word\s*ladder|dijkstra|island|islands|bipartite|topological)\b/i.test(t)) return 'Graphs';
  if (/\b(dp|dynamic\s*programming|knapsack|subsequence|coin\s*change|climbing\s*stairs|house\s*robber|edit\s*distance|longest\s*increasing)\b/i.test(t)) return 'Dynamic Programming';
  if (/\b(heap|heaps|priority\s*queue|kth\s*largest|top\s*k|median\s*finder|merge\s*k\s*sorted)\b/i.test(t)) return 'Heaps';
  if (/\b(stack|queue|stacks|queues|valid\s*parentheses|min\s*stack|next\s*greater|daily\s*temperatures)\b/i.test(t)) return 'Stack and Queues';
  if (/\b(sliding\s*window|longest\s*substring\s*without|minimum\s*window|max\s*consecutive)\b/i.test(t)) return 'Sliding Window';
  if (/\b(bit|bits|bitwise|xor|single\s*number|counting\s*bits|reverse\s*bits|hamming)\b/i.test(t)) return 'Bit Manipulation';
  if (/\b(recursion|recursive|backtrack|backtracking|combination\s*sum|permutations|subsets|n-queens|word\s*search)\b/i.test(t)) return 'Recursion';
  if (/\b(trie|tries|prefix\s*tree)\b/i.test(t)) return 'Tries';
  if (/\b(regex|regular\s*expression|wildcard|suffix\s*automaton)\b/i.test(t)) return 'Strings (Hard)';
  if (/\b(palindrome|anagram|parenthesis|substring|valid\s*anagram|longest\s*common\s*prefix|string|strings)\b/i.test(t)) return 'Strings';
  if (/\b(array|arrays|two\s*sum|3sum|4sum|sort\s*colors|next\s*permutation|rotate\s*image|merge\s*intervals|subarrays?)\b/i.test(t)) return 'Arrays';
  
  return null;
};

const AddProblemModal = ({ defaultTopic, onClose, onProblemAdded, existingProblems = [] }) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState(defaultTopic || 'Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEditedUrl, setUserEditedUrl] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState(null);

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (defaultTopic) setTopic(defaultTopic);
  }, [defaultTopic]);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit(e, false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, title, topic, difficulty, leetcodeUrl, notes, isOriginal]);

  // When title changes: auto-sync LeetCode URL if user hasn't manually overridden it
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);

    if (!userEditedUrl) {
      setLeetcodeUrl(slugifyTitle(newTitle));
    }

    const detected = detectTopicFromTitle(newTitle);
    if (detected && detected !== topic) {
      setSuggestedTopic(detected);
    } else {
      setSuggestedTopic(null);
    }
  };

  // When user types or pastes into LeetCode URL box
  const handleUrlChange = (newUrl) => {
    setLeetcodeUrl(newUrl);
    setUserEditedUrl(true);

    // If title is blank, extract title from the pasted LeetCode URL/slug
    if (!title.trim() && newUrl.trim()) {
      const extractedTitle = titleFromLeetCodeSlug(newUrl);
      if (extractedTitle) {
        setTitle(extractedTitle);
        const detected = detectTopicFromTitle(extractedTitle);
        if (detected) {
          setSuggestedTopic(detected);
          setTopic(detected);
        }
      }
    }
  };

  // Duplicate problem detection
  const duplicateMatch = React.useMemo(() => {
    if (!title.trim() || !Array.isArray(existingProblems) || existingProblems.length === 0) return null;
    const lowerTitle = title.trim().toLowerCase();
    const cleanUrl = cleanLeetCodeUrl(leetcodeUrl);
    
    return existingProblems.find(p => 
      p.title.toLowerCase() === lowerTitle || 
      (cleanUrl && p.leetcodeUrl && cleanLeetCodeUrl(p.leetcodeUrl) === cleanUrl)
    );
  }, [title, leetcodeUrl, existingProblems]);

  const handleSubmit = async (e, addAnother = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error('Please enter a problem title or paste a LeetCode URL');
      if (titleInputRef.current) titleInputRef.current.focus();
      return;
    }

    const matchedTopic = TOPICS.find(t => t.name === topic);
    const topicIndex = matchedTopic ? matchedTopic.index : 1;

    let finalLeetcode = cleanLeetCodeUrl(leetcodeUrl);
    if (!finalLeetcode) {
      finalLeetcode = slugifyTitle(cleanTitle);
    }

    setIsSubmitting(true);
    try {
      await onProblemAdded({
        title: cleanTitle,
        topic,
        topicIndex,
        difficulty,
        leetcodeUrl: finalLeetcode,
        articleUrl: `https://takeuforward.org/?s=${encodeURIComponent(cleanTitle)}`,
        notes: notes.trim(),
        isOriginal,
        isStriver: false
      });

      toast.success(`Problem added: "${cleanTitle}"!`);

      if (addAnother) {
        // Reset form for next question, but keep the current topic & difficulty
        setTitle('');
        setLeetcodeUrl('');
        setNotes('');
        setUserEditedUrl(false);
        setSuggestedTopic(null);
        setIsOriginal(false);
        if (titleInputRef.current) titleInputRef.current.focus();
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchLeetCode = () => {
    const searchUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title || 'algorithm')}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTestLink = () => {
    const finalUrl = cleanLeetCodeUrl(leetcodeUrl) || slugifyTitle(title);
    if (!finalUrl) {
      toast.error('Enter a title or URL first');
      return;
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Add New DSA Question
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type title or paste any LeetCode URL — auto-extracts slug & topic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Duplicate Warning */}
          {duplicateMatch && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Possible duplicate: </span>
                <span>#{duplicateMatch.number} "{duplicateMatch.title}" already exists in topic <strong>{duplicateMatch.topic}</strong>.</span>
              </div>
            </div>
          )}

          {/* Problem Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Problem Title *
              </label>
              {suggestedTopic && (
                <button
                  type="button"
                  onClick={() => {
                    setTopic(suggestedTopic);
                    setSuggestedTopic(null);
                  }}
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>✨ Suggest: {suggestedTopic}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              ref={titleInputRef}
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Trapping Rain Water, Course Schedule II, 3Sum..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Topic & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Roadmap Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
              >
                {TOPICS.map(t => (
                  <option key={t.slug} value={t.name}>{t.index}. {t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : diff === 'Medium'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LeetCode URL */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                LeetCode URL or Slug
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchLeetCode}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3 h-3" /> Search
                </button>
                {(leetcodeUrl || title) && (
                  <button
                    type="button"
                    onClick={handleTestLink}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" /> Test
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://leetcode.com/problems/... (paste any link or slug)"
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none font-mono text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Initial Notes & Approach (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key pattern, edge cases, time/space complexity..."
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none"
            />
          </div>

          {/* Is Original 369 Core Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="isOriginalCheckbox"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 cursor-pointer"
            />
            <label htmlFor="isOriginalCheckbox" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Include in <span className="font-bold text-amber-600 dark:text-amber-400">⭐ Original 369 Sheet</span>
            </label>
          </div>

          {/* Live Preview Card */}
          {title.trim() && (
            <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                Live Row Preview
              </span>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400">#Auto</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{title}</span>
                  {isOriginal && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      ⭐ 369 Core
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                    difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-rose-500/10 text-rose-600'
                  }`}>
                    {difficulty}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                    {topic}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting || !title.trim()}
                onClick={(e) => handleSubmit(e, true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Save this problem and immediately start adding another without closing"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Add Another</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Problem'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;
