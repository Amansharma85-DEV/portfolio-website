import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Tag } from 'lucide-react';
import { useCategories } from '../../hooks/useTasks';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await addCategory(catName.trim(), catColor);
    setCatName('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account and preferences</p>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {user?.email?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Member since {new Date(user?.created_at ?? '').toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-rose-500 hover:text-rose-400 transition-colors"
        >
          Sign out
        </button>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">Theme</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Currently using {theme} mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          Categories
        </h2>

        {/* Existing */}
        <div className="space-y-2">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No categories yet</p>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
              </div>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New */}
        <form onSubmit={handleAddCategory} className="space-y-3">
          <input
            type="text"
            placeholder="Category name"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="flex gap-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCatColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${catColor === c ? 'scale-125 ring-2 ring-gray-400 dark:ring-white/30' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </form>
      </motion.div>
    </div>
  );
}
