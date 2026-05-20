import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Sparkles } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Category } from '../../types';

interface TaskModalProps {
  task?: Task | null;
  categories: Category[];
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

const AI_SUGGESTIONS = [
  'Review and respond to team feedback',
  'Update project documentation',
  'Schedule weekly sync meeting',
  'Research competitor features',
  'Write unit tests for new module',
  'Optimize database queries',
  'Prepare quarterly report',
  'Code review open pull requests',
];

export default function TaskModal({ task, categories, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [categoryId, setCategoryId] = useState<string>(task?.category_id ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [listening, setListening] = useState(false);
  const [suggestion] = useState(() => AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)]);
  const [showSuggestion, setShowSuggestion] = useState(!task);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleVoice = () => {
    const SpeechRec = (window as unknown as Record<string, unknown>)['SpeechRecognition']
      || (window as unknown as Record<string, unknown>)['webkitSpeechRecognition'];
    if (!SpeechRec) {
      alert('Voice input not supported in this browser');
      return;
    }
    const recognition = new (SpeechRec as new () => SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = (e.results[0][0] as SpeechRecognitionAlternative).transcript;
      setTitle(prev => prev + transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category_id: categoryId || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">{task ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* AI Suggestion */}
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"
              >
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">AI Suggestion</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setTitle(suggestion); setShowSuggestion(false); }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors px-2 py-1 bg-blue-500/10 rounded-lg"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestion(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Title */}
            <div className="relative">
              <input
                type="text"
                placeholder="Task title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleVoice}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${listening ? 'text-rose-500 animate-pulse' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Description */}
            <textarea
              placeholder="Description (optional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />

            {/* Row: Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5 font-medium">Priority</label>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        priority === p
                          ? p === 'high' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                          : p === 'medium' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-transparent hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5 font-medium">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Row: Category + Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5 font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">None</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1.5 font-medium">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                {task ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
