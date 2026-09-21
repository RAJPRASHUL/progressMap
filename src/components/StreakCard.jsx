import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';
import { toLocalDate, computePerfectDayStreak, BADGE_TIERS } from '../utils/milestones';

function getNextBadge(streak) {
  for (const tier of BADGE_TIERS) {
    if (streak < tier.threshold) return tier;
  }
  return null; // maxed out
}

export default function StreakCard() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const to = toLocalDate();
    const d = new Date();
    d.setDate(d.getDate() - 1000);
    const from = toLocalDate(d);

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
  }, [refreshKey]);

  useEffect(() => {
    const handleTasksChanged = () => setRefreshKey((key) => key + 1);
    window.addEventListener('tasks-changed', handleTasksChanged);
    return () => window.removeEventListener('tasks-changed', handleTasksChanged);
  }, []);

  const streak = useMemo(() => computePerfectDayStreak(tasksByDate), [tasksByDate]);

  const nextBadge = getNextBadge(streak);
  const daysToNext = nextBadge ? nextBadge.threshold - streak : 0;
  const progressPct = nextBadge
    ? Math.min(100, Math.round((streak / nextBadge.threshold) * 100))
    : 100;

  return (
    <section
      className="card-glass rounded-2xl p-4 flex-1 flex flex-col justify-center"
      data-purpose="current-streak"
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>Current Streak</span>
      </div>

      <div className="flex items-center space-x-2 text-lg font-bold text-white mb-2">
        <span className="text-amber-500">🔥</span>
        <span>{loading ? '—' : `${streak} day${streak !== 1 ? 's' : ''}`}</span>
      </div>

      
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
        <div
          className="bg-gradient-to-r from-red-500 to-amber-400 h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${loading ? 0 : progressPct}%` }}
        />
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        {nextBadge ? (
          <span>{daysToNext} more day{daysToNext !== 1 ? 's' : ''} to {nextBadge.name} {nextBadge.emoji}</span>
        ) : (
          <span>Max streak badge reached! 👑</span>
        )}
      </div>
    </section>
  );
}
