import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';

// ── Badge Definitions ─────────────────────────────────────────────────

const BADGE_TIERS = [
  { name: 'Spark',   threshold: 3,  emoji: '⚡', color: 'cyan',   desc: 'Complete 3-day streak' },
  { name: 'Flame',   threshold: 7,  emoji: '🔥', color: 'amber',  desc: 'Complete 7-day streak' },
  { name: 'Phoenix', threshold: 14, emoji: '🏆', color: 'amber',  desc: 'Complete 14-day streak' },
  { name: 'Titan',   threshold: 30, emoji: '💎', color: 'amber',  desc: 'Complete 30-day streak' },
  { name: 'Legend',  threshold: 60, emoji: '👑', color: 'amber',  desc: 'Complete 60-day streak' },
];

const ACHIEVEMENT_BADGES = [
  { id: 'first_task',   name: 'First Step',    emoji: '🌟', check: (stats) => stats.totalTasks >= 1, desc: 'Complete your first task' },
  { id: 'ten_tasks',    name: 'Hustler',       emoji: '⭐', check: (stats) => stats.totalDone >= 10, desc: 'Complete 10 tasks' },
  { id: 'perfect_day',  name: 'Perfect Day',   emoji: '🎯', check: (stats) => stats.perfectDays >= 1, desc: 'Complete all tasks in a day' },
  { id: 'five_perfect', name: 'Perfectionist', emoji: '✨', check: (stats) => stats.perfectDays >= 5, desc: '5 perfect days' },
  { id: 'fifty_tasks',  name: 'Warrior',       emoji: '⚔️', check: (stats) => stats.totalDone >= 50, desc: 'Complete 50 tasks' },
  { id: 'hundred',      name: 'Centurion',     emoji: '🛡️', check: (stats) => stats.totalDone >= 100, desc: 'Complete 100 tasks' },
  { id: 'week_perfect', name: 'Unstoppable',   emoji: '🚀', check: (stats) => stats.perfectDays >= 7, desc: '7 perfect days' },
  { id: 'two_hundred',  name: 'Grandmaster',   emoji: '💎', check: (stats) => stats.totalDone >= 200, desc: 'Complete 200 tasks' },
];

// ── Helpers ───────────────────────────────────────────────────────────

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function computeStreak(tasksByDate) {
  let streak = 0;
  const d = new Date();
  const todayStr = toLocalDate(d);
  const todayInfo = tasksByDate[todayStr];
  if (todayInfo && todayInfo.done > 0) {
    streak = 1;
    d.setDate(d.getDate() - 1);
  } else {
    d.setDate(d.getDate() - 1);
  }
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

// ── Component ─────────────────────────────────────────────────────────

export default function BadgeWall() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const to = toLocalDate();
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
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

  // Compute stats for badge checks
  const { streak, stats, currentBadge, nextBadge } = useMemo(() => {
    const s = computeStreak(tasksByDate);

    let totalTasks = 0;
    let totalDone = 0;
    let perfectDays = 0;

    Object.values(tasksByDate).forEach((info) => {
      totalTasks += info.total;
      totalDone += info.done;
      if (info.total > 0 && info.done === info.total) perfectDays += 1;
    });

    const st = { totalTasks, totalDone, perfectDays };

    // Current streak badge
    let current = null;
    let next = BADGE_TIERS[0];
    for (const tier of BADGE_TIERS) {
      if (s >= tier.threshold) {
        current = tier;
      } else {
        next = tier;
        break;
      }
    }
    if (s >= BADGE_TIERS[BADGE_TIERS.length - 1].threshold) {
      next = null;
    }

    return { streak: s, stats: st, currentBadge: current, nextBadge: next };
  }, [tasksByDate]);

  // Determine which achievement badges are unlocked
  const achievementStatus = useMemo(() => {
    return ACHIEVEMENT_BADGES.map((badge) => ({
      ...badge,
      unlocked: badge.check(stats),
    }));
  }, [stats]);

  const colorMap = {
    cyan: {
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-400/40',
      shadow: 'shadow-cyan-400/20',
      text: 'text-cyan-300',
    },
    amber: {
      bg: 'bg-amber-950/30',
      border: 'border-amber-500/40',
      shadow: 'shadow-amber-500/20',
      text: 'text-amber-300',
    },
  };

  return (
    <div className="space-y-4">
      {/* Current Badge Card */}
      <section
        className="card-glass rounded-2xl p-3.5 flex items-center space-x-3.5"
        data-purpose="current-badge"
      >
        <div className={`w-12 h-12 rounded-xl ${
          currentBadge
            ? `${colorMap[currentBadge.color].bg} ${colorMap[currentBadge.color].border} shadow-lg ${colorMap[currentBadge.color].shadow}`
            : 'bg-slate-800/80 border-slate-700'
        } border flex items-center justify-center text-xl`}>
          {loading ? '…' : currentBadge ? currentBadge.emoji : '—'}
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Current Badge
          </div>
          <div className="text-sm font-bold text-indigo-300">
            {loading ? '—' : currentBadge ? currentBadge.name : 'None yet'}
          </div>
          {nextBadge && !loading && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>{nextBadge.emoji} {nextBadge.name}</span>
              <span>— unlock at {nextBadge.threshold} days</span>
            </div>
          )}
        </div>
      </section>

      {/* Badge Wall */}
      <section
        className="card-glass rounded-2xl p-5 flex flex-col justify-between"
        data-purpose="badge-wall"
      >
        <h2 className="text-sm font-semibold tracking-wide text-white mb-4">
          Badge Wall
        </h2>

        {loading ? (
          <div className="h-24 flex items-center justify-center text-sm text-slate-500">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 py-2">
            {achievementStatus.map((badge) => (
              <div key={badge.id} className="flex items-center justify-center" title={badge.desc}>
                {badge.unlocked ? (
                  <div className={`w-10 h-10 rounded-full bg-slate-800/80 border border-indigo-500/40 flex items-center justify-center shadow-sm shadow-blue-500/20 text-sm`}>
                    {badge.emoji}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative opacity-50">
                    <span className="text-xs text-slate-500">{badge.emoji}</span>
                    <span className="absolute -top-1 -right-1 text-[9px] bg-slate-800 rounded-full p-0.5 border border-slate-700">
                      🔒
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
