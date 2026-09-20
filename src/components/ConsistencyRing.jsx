import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';

// ── Helpers ───────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────

export default function ConsistencyRing() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);

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
  }, [dates]);

  // Consistency = % of days with at least 1 task where ≥50% was done
  const pct = useMemo(() => {
    let activeDays = 0;
    let consistentDays = 0;

    dates.forEach((d) => {
      const info = tasksByDate[d];
      if (info && info.total > 0) {
        activeDays += 1;
        if (info.done / info.total >= 0.5) consistentDays += 1;
      }
    });

    return activeDays > 0 ? Math.round((consistentDays / activeDays) * 100) : 0;
  }, [dates, tasksByDate]);

  // SVG ring math
  const radius = 14.5;
  const circumference = 2 * Math.PI * radius; // ~91.1
  const offset = circumference - (pct / 100) * circumference;

  return (
    <section
      className="card-glass rounded-2xl p-4 flex items-center space-x-4 flex-1"
      data-purpose="consistency-metric"
    >
      {/* Ring */}
      <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background track */}
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="#1f283d"
            strokeWidth="3.5"
          />
          {/* Cyan glow ring */}
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="#00e5ff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={loading ? circumference : offset}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.45))',
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
          {loading ? '—' : `${pct}%`}
        </div>
      </div>

      {/* Label */}
      <div>
        <h3 className="text-sm font-bold text-white">Consistency</h3>
        <p className="text-xs text-slate-400">last 30 days</p>
      </div>
    </section>
  );
}
