import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../storage';
import {
  toLocalDate,
  BADGE_TIERS,
  computePerfectDayStreak,
  computeLongestPerfectStreak
} from '../utils/milestones';

export default function BadgeWall() {
  const navigate = useNavigate();
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
  const { perfectDayStreak, longestPerfectStreak, currentBadge, nextBadge } = useMemo(() => {
    const longest = computeLongestPerfectStreak(tasksByDate);
    const current = BADGE_TIERS.reduce((highest, tier) => (
      longest >= tier.threshold ? tier : highest
    ), null);
    const next = BADGE_TIERS.find((tier) => longest < tier.threshold) || null;

    return {
      perfectDayStreak: computePerfectDayStreak(tasksByDate),
      longestPerfectStreak: longest,
      currentBadge: current,
      nextBadge: next,
    };
  }, [tasksByDate]);
  const achievementStatus = useMemo(() => {
    return BADGE_TIERS.map((badge) => ({
      ...badge,
      id: badge.name,
      unlocked: longestPerfectStreak >= badge.threshold,
    }));
  }, [longestPerfectStreak]);

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

  const badgeSubtitle = !currentBadge && nextBadge
    ? `${nextBadge.name} - unlock at ${nextBadge.threshold} perfect day${nextBadge.threshold === 1 ? '' : 's'}`
    : nextBadge
      ? `${nextBadge.name} - ${perfectDayStreak === 0
        ? `unlock at ${nextBadge.threshold} consecutive perfect days`
        : `${nextBadge.threshold - perfectDayStreak} more perfect day${nextBadge.threshold - perfectDayStreak === 1 ? '' : 's'} to go`}`
      : 'All milestones complete';
  const badgeSubtitleIcon = nextBadge?.emoji || currentBadge?.emoji;

  return (
    <div className="space-y-4">
      
      <section
        className="card-glass rounded-2xl p-3.5 flex items-center space-x-3.5"
        data-purpose="current-badge"
      >
        <div className={`w-12 h-12 rounded-xl ${currentBadge
            ? `${colorMap[currentBadge.color].bg} ${colorMap[currentBadge.color].border} shadow-lg ${colorMap[currentBadge.color].shadow}`
            : 'bg-slate-800/80 border-slate-700'
          } border flex items-center justify-center text-xl`}>
          {loading ? '…' : currentBadge ? currentBadge.emoji : '—'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Current Badge
          </div>
          <div className="text-sm font-bold text-indigo-300">
            {loading ? '—' : currentBadge ? currentBadge.name : 'None yet'}
          </div>
          {!loading && (
            <div className="text-[11px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="inline-block max-w-full truncate">
                {badgeSubtitleIcon} {badgeSubtitle}
              </span>
            </div>
          )}
        </div>
      </section>

      
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
              <button
                key={badge.id}
                type="button"
                className="flex items-center justify-center"
                title={badge.desc}
                aria-label={`View ${badge.name} achievement`}
                onClick={() => navigate('/achievements')}
              >
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
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
