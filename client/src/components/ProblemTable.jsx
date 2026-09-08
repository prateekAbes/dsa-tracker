import React, { useState } from 'react';
import { Plus, CheckCheck, Sparkles } from 'lucide-react';
import ProblemRow from './ProblemRow';
import NoteModal from './NoteModal';
import AddProblemModal from './AddProblemModal';
import EditLinkModal from './EditLinkModal';
import CodeModal from './CodeModal';
import { bulkUpdateProblems, createProblem } from '../api/client';
import toast from 'react-hot-toast';

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-800">
    <td className="p-3.5"><div className="h-5 w-5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto" /></td>
    <td className="p-3.5"><div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded" /></td>
    <td className="p-3.5 w-full"><div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" /></td>
    <td className="p-3.5"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-md" /></td>
    <td className="p-3.5"><div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-md" /></td>
    <td className="p-3.5"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-md" /></td>
    <td className="p-3.5"><div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-md ml-auto" /></td>
  </tr>
);

const ProblemTable = ({ problems, loading, onToggleStatus, onUpdateProblem, refetch, defaultTopic }) => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedCodeProblem, setSelectedCodeProblem] = useState(null);
  const [editingLinkProblem, setEditingLinkProblem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleUpdateStatus = (number, status) => {
    onUpdateProblem(number, { status });
  };

  const handleSaveNotes = async (number, data) => {
    await onUpdateProblem(number, data);
    setSelectedProblem(null);
  };

  const handleSaveLink = async (number, data) => {
    await onUpdateProblem(number, data);
    setEditingLinkProblem(null);
  };

  const handleAddProblem = async (newProblemData) => {
    await createProblem(newProblemData);
    refetch();
  };

  const handleBulkMarkDone = async () => {
    if (problems.length === 0) return;
    
    const todos = problems.filter(p => p.status !== 'done').map(p => p.number);
    if (todos.length === 0) {
      toast('All visible problems are already completed!', { icon: '🎉' });
      return;
    }

    if (window.confirm(`Mark ${todos.length} problems as completed?`)) {
      setIsBulkUpdating(true);
      try {
        await bulkUpdateProblems(todos, { status: 'done' });
        toast.success(`Marked ${todos.length} problems as completed!`);
        refetch();
      } catch (err) {
        toast.error('Failed to update problems');
      } finally {
        setIsBulkUpdating(false);
      }
    }
  };

  const completedCount = problems.filter(p => p.status === 'done').length;
  const original369Count = problems.filter(p => p.isOriginal).length;

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-2xl overflow-hidden shadow-sm transition-all">
      {/* Table Action Bar */}
      <div className="p-4 bg-gray-50/60 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {problems.length} {problems.length === 1 ? 'Problem' : 'Problems'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
            {completedCount} Completed
          </span>
          {original369Count > 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
              ⭐ {original369Count} in 369 Core
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add Question Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>

          {/* Mark Filtered Done Button */}
          {problems.length > 0 && (
            <button 
              onClick={handleBulkMarkDone}
              disabled={isBulkUpdating}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isBulkUpdating ? 'Updating...' : 'Mark Visible as Done'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/40 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              <th className="p-3.5 w-12 text-center">Status</th>
              <th className="p-3.5 w-14">#</th>
              <th className="p-3.5 w-full">Problem Title</th>
              <th className="p-3.5">Difficulty</th>
              <th className="p-3.5">State</th>
              <th className="p-3.5">Practice</th>
              <th className="p-3.5 text-right">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">No matching problems found</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Try adjusting search or difficulty filters</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Problem</span>
                  </button>
                </td>
              </tr>
            ) : (
              problems.map(problem => (
                <ProblemRow 
                  key={problem.number} 
                  problem={problem} 
                  onToggleStatus={onToggleStatus}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenNotes={setSelectedProblem}
                  onOpenEditLink={setEditingLinkProblem}
                  onOpenCode={setSelectedCodeProblem}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {selectedProblem && (
        <NoteModal 
          problem={selectedProblem} 
          onClose={() => setSelectedProblem(null)}
          onSave={handleSaveNotes}
        />
      )}

      {selectedCodeProblem && (
        <CodeModal
          problem={selectedCodeProblem}
          onClose={() => setSelectedCodeProblem(null)}
          onUpdate={(updatedProblem) => {
            // Optimistically update the UI list
            refetch();
          }}
        />
      )}

      {editingLinkProblem && (
        <EditLinkModal
          problem={editingLinkProblem}
          onClose={() => setEditingLinkProblem(null)}
          onSave={handleSaveLink}
        />
      )}

      {showAddModal && (
        <AddProblemModal
          defaultTopic={defaultTopic}
          existingProblems={problems}
          onClose={() => setShowAddModal(false)}
          onProblemAdded={handleAddProblem}
        />
      )}
    </div>
  );
};

export default ProblemTable;
