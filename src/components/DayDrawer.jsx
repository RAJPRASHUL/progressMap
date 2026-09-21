import { useState, useEffect } from 'react';
import { getTasks, getNote, saveNote } from '../storage';

export default function DayDrawer({ isOpen, date, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !date) return;

    let cancelled = false;
    setLoading(true);
    setNote('');

    Promise.all([
      getTasks(date, date).catch(() => []),
      getNote(date).catch(() => null)
    ])
      .then(([tasksData, noteData]) => {
        if (!cancelled) {
          setTasks(tasksData || []);
          setNote(noteData?.text || '');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load drawer data:', err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, date, refreshKey]);

  useEffect(() => {
    const handleTasksChanged = () => setRefreshKey((key) => key + 1);
    window.addEventListener('tasks-changed', handleTasksChanged);
    return () => window.removeEventListener('tasks-changed', handleTasksChanged);
  }, []);

  async function handleNoteBlur() {
    if (!date) return;
    setSavingNote(true);
    try {
      await saveNote(date, note);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  }

  if (!isOpen) return null;
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
      
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0d121c] border-l border-white/5 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0"
      >
        
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

        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          
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

          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Notes
              </h3>
              {savingNote && <span className="text-[10px] text-slate-500">Saving...</span>}
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : (
              <textarea
                className="w-full bg-[#151b28] border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-y min-h-[120px] transition"
                placeholder="Write your reflections for the day..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleNoteBlur}
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
