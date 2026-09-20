import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';

// ── Helpers ───────────────────────────────────────────────────────────

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Walk backwards from today finding consecutive days with ≥1 completed task. */
function computeStreak(tasksByDate) {
  let streak = 0;
  const d = new Date();

  // Start from yesterday if today has no tasks yet (allow today to not break streak)
  const todayStr = toLocalDate(d);
  const todayInfo = tasksByDate[todayStr];
  if (todayInfo && todayInfo.done > 0) {
    streak = 1;
    d.setDate(d.getDate() - 1);
  } else {
    d.setDate(d.getDate() - 1);
  }

  // Walk backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = toLocalDate(d);
    const info = tasksByDate[dateStr];
    if (info && info.done > 0) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Badge tiers
const BADGE_TIERS = [
  { name: 'Spark',    threshold: 3,  emoji: '⚡' },
  { name: 'Flame',    threshold: 7,  emoji: '🔥' },
  { name: 'Phoenix',  threshold: 14, emoji: '🏆' },
  { name: 'Titan',    threshold: 30, emoji: '💎' },
  { name: 'Legend',   threshold: 60, emoji: '👑' },
];

function getCurrentBadge(streak) {
  let current = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (streak >= tier.threshold) current = tier;
  }
  return current;
}

function getNextBadge(streak) {
  for (const tier of BADGE_TIERS) {
    if (streak < tier.threshold) return tier;
  }
  return null; // maxed out
}

// ── Component ─────────────────────────────────────────────────────────

export default function StreakCard() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch last 365 days for streak calculation
    const to = toLocalDate();
    const d = new Date();
    d.setDate(d.getDate() - 365);
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
  }, []);

  const streak = useMemo(() => computeStreak(tasksByDate), [tasksByDate]);

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

      {/* Progress bar toward next badge */}
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
