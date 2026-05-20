import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Pencil, Trash2, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { usePriority } from '../../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  dragHandleProps?: object;
}

export default function TaskCard({ task, onEdit, onDelete, onComplete, dragHandleProps }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const priority = usePriority(task.priority);
  const isDone = task.status === 'done';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-gray-50 dark:bg-gray-800/60 border rounded-xl p-4 group cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150 ${
        isDone ? 'border-gray-200 dark:border-gray-700/50 opacity-70' : 'border-gray-200 dark:border-gray-700'
      }`}
      {...dragHandleProps}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(task.id)}
          className="mt-0.5 text-gray-400 hover:text-emerald-500 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors shrink-0"
        >
          {isDone
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            : <Circle className="w-4 h-4" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
              {priority.label}
            </span>
            {task.category && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.category.color }} />
                {task.category.name}
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`}>
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <Pencil className="w-3 h-3" />
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(task.id)}
                className="text-xs text-rose-500 px-1.5 hover:text-rose-400 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
