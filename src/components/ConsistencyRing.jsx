import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPast30Days() {
  const dates = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(toLocalDate(d));
  }
  return dates;
}

export default function ConsistencyRing() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const dates = useMemo(() => getPast30Days(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = dates[0];
    const to = dates[dates.length - 1];

    getTasks(from, to)
      .then((tasks) => {
        if (cancelled) return;
        const map = {};
        tasks.forEach((t) => {
          if (!map[t.date]) map[t.date] = { total: 0, done: 0 };
          map[t.date].total += 1;
          if (t.completed) map[t.date].done += 1;
        });
        setTasksByDate(map);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dates, refreshKey]);

  useEffect(() => {
    const handleTasksChanged = () => setRefreshKey((key) => key + 1);
    window.addEventListener('tasks-changed', handleTasksChanged);
    return () => window.removeEventListener('tasks-changed', handleTasksChanged);
  }, []);
  const pct = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    dates.forEach((d) => {
      const info = tasksByDate[d];
      if (info && info.total > 0) {
        totalTasks += info.total;
        completedTasks += info.done;
      }
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [dates, tasksByDate]);
  const radius = 14.5;
  const circumference = 2 * Math.PI * radius; // ~91.1
  const offset = circumference - (pct / 100) * circumference;
  const progressColor = `hsl(${210 - pct * 0.8}, 85%, ${55 - pct * 0.25}%)`;

  return (
    <section
      className="card-glass rounded-2xl p-4 flex items-center space-x-4 flex-1"
      data-purpose="consistency-metric"
    >
      
      <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
          
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="#1f283d"
            strokeWidth="3.5"
          />
          
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={loading ? circumference : offset}
            style={{
              filter: `drop-shadow(0 0 8px ${progressColor})`,
              transition: 'stroke-dashoffset 1s ease-out, stroke 1s ease-out, filter 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
          {loading ? '—' : `${pct}%`}
        </div>
      </div>

      
      <div>
        <h3 className="text-sm font-bold text-white">Consistency</h3>
        <p className="text-xs text-slate-400">last 30 days</p>
      </div>
    </section>
  );
}
