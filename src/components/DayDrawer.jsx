import { useState, useEffect } from 'react';
import { getTasks } from '../storage';

export default function DayDrawer({ isOpen, date, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !date) return;
    
    let cancelled = false;
    setLoading(true);

    getTasks(date, date)
      .then((data) => {
        if (!cancelled) {
          setTasks(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load tasks for drawer:', err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, date]);

  if (!isOpen) return null;

  // Format date header
  const d = new Date(date + 'T12:00:00');
  const dateHeader = d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isPast = date < new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0d121c] border-l border-white/5 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{dateHeader}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {total === 0 ? 'No tasks' : `${doneCount} of ${total} tasks completed (${pct}%)`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tasks List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Tasks
            </h3>
            
            {loading ? (
              <div className="text-sm text-slate-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-sm text-slate-500">No tasks on this day.</div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task._id} className="flex items-center space-x-3 text-sm">
                    {task.completed ? (
                      <>
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs">
                          ✓
                        </span>
                        <span className="line-through text-slate-500">{task.title}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-5 h-5 rounded-full border border-slate-600 bg-transparent flex items-center justify-center" />
                        <span className={isPast ? "text-slate-500" : "text-slate-300"}>
                          {task.title}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Field Placeholder (for Step 14) */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Notes
            </h3>
            <div className="p-4 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm">
              Note field will be added in Step 14.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
