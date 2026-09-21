import { useState, useEffect, useRef, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../storage';

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDate(d);
}

function dayName(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function ProgressRing({ percent }) {
  const CIRCUMFERENCE = 2 * Math.PI * 14.5; // r = 14.5
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
        
        <circle
          cx="18" cy="18" r="14.5"
          fill="none" stroke="#1f283d" strokeWidth="3.5"
        />
        
        <circle
          cx="18" cy="18" r="14.5"
          fill="none" stroke="url(#questPurpleGrad)"
          strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <defs>
          <linearGradient id="questPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        {percent}%
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(task._id);
  }

  return (
    <div
      className="group flex items-center space-x-3 text-xs cursor-pointer"
      onClick={() => !task.completed && onToggle(task._id, true)}
    >
      
      {task.completed ? (
        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] flex-shrink-0 transition-all">
          ✓
        </span>
      ) : (
        <span className="w-4 h-4 rounded-full border border-slate-600 bg-transparent flex items-center justify-center flex-shrink-0 hover:border-indigo-400 transition-all" />
      )}

      
      <span
        className={`flex-1 transition-colors ${task.completed
            ? 'line-through text-slate-500'
            : 'text-slate-300'
          }`}
      >
        {task.title}
      </span>

      
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-[10px] p-0.5"
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  );
}

export default function TodaysQuest() {
  const today = toLocalDate();
  const [tasks, setTasks] = useState([]);
  const [yesterdayUndone, setYesterdayUndone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef(null);
  const fetchTasks = useCallback(async () => {
    try {
      const yd = yesterday();
      const data = await getTasks(yd, today);
      setTasks(data.filter((t) => t.date === today));
      setYesterdayUndone(data.filter((t) => t.date === yd && !t.completed));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    window.addEventListener('tasks-changed', fetchTasks);
    return () => window.removeEventListener('tasks-changed', fetchTasks);
  }, [fetchTasks]);
  async function handleAdd() {
    if (adding) {
      const title = newTitle.trim();
      if (!title) {
        setAdding(false);
        setNewTitle('');
        return;
      }
      try {
        const created = await createTask({ title, date: today });
        setTasks((prev) => [...prev, created]);
        setNewTitle('');
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    } else {
      setAdding(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setAdding(false);
      setNewTitle('');
    }
  }
  async function handleToggle(id, completed) {
    if (!completed) return;
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed } : t))
    );
    try {
      await updateTask(id, { completed });
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !completed } : t))
      );
      console.error('Failed to update task:', err);
    }
  }
  async function handleDelete(id) {
    const prev = tasks;
    setTasks((t) => t.filter((x) => x._id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      setTasks(prev);
      console.error('Failed to delete task:', err);
    }
  }
  async function handleRollOver() {
    try {
      const promises = yesterdayUndone.map((t) =>
        createTask({ title: t.title, date: today })
      );
      const created = await Promise.all(promises);
      setTasks((prev) => [...prev, ...created]);
      setYesterdayUndone([]);
    } catch (err) {
      console.error('Failed to roll over tasks:', err);
    }
  }
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <section className="lg:col-span-2 bg-black rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-theme-text mb-4">
          Today's Quest
        </h2>

        
        <div className="flex items-center space-x-4 mb-6">
          <ProgressRing percent={percent} />
          <div>
            <div className="text-sm font-bold text-theme-text tracking-tight">
              {done} of {total} tasks
            </div>
            <div className="text-xs text-theme-muted">{dayName()}</div>
          </div>
        </div>

        
        {loading ? (
          <div className="text-xs text-theme-muted text-center py-4">Loading…</div>
        ) : tasks.length === 0 && !adding ? (
          <div className="text-xs text-theme-muted text-center py-4">
            No tasks yet — add your first one!
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        
        {adding && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={() => {
                if (!newTitle.trim()) {
                  setAdding(false);
                  setNewTitle('');
                }
              }}
              placeholder="What will you do today?"
              className="flex-1 bg-transparent border-b border-theme-border focus:border-indigo-500 outline-none text-xs text-theme-text placeholder-slate-600 py-1 transition-colors"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          className="w-full mt-5 py-2 px-3 border border-dashed border-theme-border hover:border-slate-500 rounded-xl text-theme-muted text-xs flex items-center justify-center space-x-1.5 transition"
        >
          <span>+ Add task</span>
        </button>
      </div>

      
      {yesterdayUndone.length > 0 && (
        <button
          type="button"
          onClick={handleRollOver}
          className="w-full pt-4 text-center text-[11px] text-theme-muted hover:text-indigo-400 transition flex items-center justify-center gap-1.5"
        >
          <span>↺</span>
          <span>
            Roll over yesterday's undone tasks ({yesterdayUndone.length})
          </span>
        </button>
      )}
    </section>
  );
}
