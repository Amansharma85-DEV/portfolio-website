import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });
    setTasks(data as Task[] ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Partial<Task> & { title: string }) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id, position: tasks.length })
      .select('*, category:categories(*)')
      .single();
    if (!error && data) {
      setTasks(prev => [data as Task, ...prev]);
    }
    return { error };
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    return { error };
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    return { error };
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    await supabase.from('tasks').update({ status: newStatus, position: newPosition }).eq('id', taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t));
  };

  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completed_at = task.status === 'done' ? null : new Date().toISOString();
    const status: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(id, { status, completed_at });
  };

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, completeTask, refetch: fetchTasks };
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<import('../types').Category[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
      .then(({ data }) => setCategories(data ?? []));
  }, [user]);

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color })
      .select()
      .single();
    if (!error && data) setCategories(prev => [...prev, data]);
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return { categories, addCategory, deleteCategory };
}

export function usePriority(priority: TaskPriority) {
  const map: Record<TaskPriority, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    high: { label: 'High', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
  };
  return map[priority];
}
