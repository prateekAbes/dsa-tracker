import { useState, useEffect, useCallback } from 'react';
import { fetchProblems as apiFetchProblems, updateProblem as apiUpdateProblem, bulkUpdateProblems as apiBulkUpdateProblems } from '../api/client';
import toast from 'react-hot-toast';

export const useProblems = (initialFilters = {}) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters.topic]);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetchProblems(filters);
      setProblems(data.problems || data);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error fetching problems", err);
      setError('Failed to fetch problems');
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const toggleStatus = async (number, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      // Optimistic update
      setProblems(prev => prev.map(p => p.number === number ? { ...p, status: newStatus } : p));
      await apiUpdateProblem(number, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      // Revert on error
      setProblems(prev => prev.map(p => p.number === number ? { ...p, status: currentStatus } : p));
      if (err.response?.status === 401) {
        toast.error('Please sign in to track and save your progress!', { id: 'auth-required' });
      } else {
        toast.error('Failed to update status');
      }
    }
  };

  const updateProblem = async (number, data) => {
    try {
      setProblems(prev => prev.map(p => p.number === number ? { ...p, ...data } : p));
      await apiUpdateProblem(number, data);
      toast.success('Problem updated');
    } catch (err) {
      fetchProblems();
      if (err.response?.status === 401) {
        toast.error('Please sign in to save changes!', { id: 'auth-required' });
      } else {
        toast.error('Failed to update problem');
      }
    }
  };
  
  const updateFilters = (newFilters) => {
      setFilters(prev => ({...prev, ...newFilters}));
  }

  return { problems, loading, error, filters, updateFilters, toggleStatus, updateProblem, refetch: fetchProblems, stats };
};
