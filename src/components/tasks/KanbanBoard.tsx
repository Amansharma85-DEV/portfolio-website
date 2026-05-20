import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Search, X } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Category } from '../../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface KanbanBoardProps {
  tasks: Task[];
  categories: Category[];
  onAdd: (data: Partial<Task>) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (taskId: string, status: TaskStatus, position: number) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-gray-200 dark:border-gray-700', accent: 'bg-gray-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500/30', accent: 'bg-blue-500' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/30', accent: 'bg-emerald-500' },
];

export default function KanbanBoard({ tasks, categories, onAdd, onUpdate, onDelete, onComplete, onMove }: KanbanBoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterCategory && t.category_id !== filterCategory) return false;
      return true;
    });
  }, [tasks, search, filterPriority, filterCategory]);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    filtered.forEach(t => map[t.status].push(t));
    return map;
  }, [filtered]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    onMove(draggableId, destination.droppableId as TaskStatus, destination.index);
  };

  const openAdd = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Task>) => {
    if (editingTask) {
      onUpdate(editingTask.id, data);
    } else {
      onAdd({ ...data, status: defaultStatus });
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const hasFilters = search || filterPriority || filterCategory;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tasks.length} total &bull; {tasks.filter(t => t.status === 'done').length} completed</p>
          </div>
          <button
            onClick={() => openAdd('todo')}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as TaskPriority | '')}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setFilterPriority(''); setFilterCategory(''); }}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-5 min-w-[720px] h-full">
            {COLUMNS.map(col => {
              const colTasks = byStatus[col.id];
              return (
                <div key={col.id} className={`flex flex-col bg-white dark:bg-gray-900 border ${col.color} rounded-2xl overflow-hidden`}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.accent}`} />
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{col.label}</h2>
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <button
                      onClick={() => openAdd(col.id)}
                      className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 space-y-2 overflow-y-auto min-h-32 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-500/5' : ''}`}
                      >
                        <AnimatePresence>
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    opacity: dragSnapshot.isDragging ? 0.8 : 1,
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={openEdit}
                                    onDelete={onDelete}
                                    onComplete={onComplete}
                                    dragHandleProps={dragProvided.dragHandleProps ?? undefined}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <p className="text-gray-400 dark:text-gray-600 text-xs">Drop tasks here or</p>
                            <button onClick={() => openAdd(col.id)} className="text-xs text-blue-500 hover:text-blue-400 mt-1 transition-colors">
                              + Add task
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
