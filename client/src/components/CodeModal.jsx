import React, { useState } from 'react';
import { X, Code2, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Editor } from '@monaco-editor/react';
import { addSolution, deleteSolution } from '../api/client';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust'];

const CodeModal = ({ problem, onClose, onUpdate }) => {
  const [solutions, setSolutions] = useState(problem.solutions || []);
  const [activeTab, setActiveTab] = useState(solutions.length > 0 ? 0 : -1);
  const [isAdding, setIsAdding] = useState(solutions.length === 0);
  
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newLanguage, setNewLanguage] = useState('cpp');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || !newCode.trim()) {
      toast.error('Please enter a name and code');
      return;
    }
    
    setLoading(true);
    try {
      const updatedProblem = await addSolution(problem.number, {
        name: newName,
        code: newCode,
        language: newLanguage
      });
      setSolutions(updatedProblem.solutions);
      setActiveTab(updatedProblem.solutions.length - 1);
      setIsAdding(false);
      setNewName('');
      setNewCode('');
      onUpdate(updatedProblem);
      toast.success('Solution added');
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error('Please sign in to save your code solutions!');
      } else {
        toast.error('Failed to add solution');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (solutionId) => {
    if (!window.confirm('Delete this solution?')) return;
    
    setLoading(true);
    try {
      const updatedProblem = await deleteSolution(problem.number, solutionId);
      setSolutions(updatedProblem.solutions);
      if (activeTab >= updatedProblem.solutions.length) {
        setActiveTab(Math.max(0, updatedProblem.solutions.length - 1));
      }
      if (updatedProblem.solutions.length === 0) {
        setIsAdding(true);
        setActiveTab(-1);
      }
      onUpdate(updatedProblem);
      toast.success('Solution deleted');
    } catch (e) {
      toast.error('Failed to delete solution');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg">
              <Code2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Code Solutions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                #{problem.number} — {problem.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex px-4 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {solutions.map((sol, idx) => (
              <button
                key={sol._id}
                onClick={() => { setIsAdding(false); setActiveTab(idx); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  !isAdding && activeTab === idx
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {sol.name} ({sol.language})
              </button>
            ))}
            <button
              onClick={() => setIsAdding(true)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isAdding
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Plus className="w-4 h-4" /> New Solution
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-[#0d1117]">
            {isAdding ? (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Method Name</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)}
                      placeholder="e.g. Brute Force, Optimal O(N)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                    <select 
                      value={newLanguage} 
                      onChange={e => setNewLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none transition-all dark:text-white"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-[300px]">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                  <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <Editor
                      height="100%"
                      language={newLanguage === 'c++' ? 'cpp' : newLanguage}
                      theme={localStorage.getItem('darkMode') === 'true' ? 'vs-dark' : 'light'}
                      value={newCode}
                      onChange={(value) => setNewCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleAdd}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Save Solution
                  </button>
                </div>
              </div>
            ) : (
              activeTab >= 0 && solutions[activeTab] && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                      {solutions[activeTab].language}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(solutions[activeTab].code)}
                        className="text-xs px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
                      >
                        Copy
                      </button>
                      <button 
                        onClick={() => handleDelete(solutions[activeTab]._id)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/40 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
                    <Editor
                      height="100%"
                      language={solutions[activeTab].language === 'c++' ? 'cpp' : solutions[activeTab].language}
                      theme={localStorage.getItem('darkMode') === 'true' ? 'vs-dark' : 'light'}
                      value={solutions[activeTab].code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;
