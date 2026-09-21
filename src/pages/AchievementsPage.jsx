import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { getTasks } from '../storage';
import { JOURNEY_TIERS, computeStats, computeLongestPerfectStreak } from '../utils/milestones';

export default function AchievementsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const d = new Date();
        const to = d.toISOString().slice(0, 10);
        d.setDate(d.getDate() - 1000);
        const from = d.toISOString().slice(0, 10);

        const data = await getTasks(from, to);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const { tasksByDate, perfectDays, longestPerfectStreak, perfectDatesAsc } = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!map[t.date]) map[t.date] = { total: 0, done: 0 };
      map[t.date].total += 1;
      if (t.completed) map[t.date].done += 1;
    });

    const stats = computeStats(map);
    const longestPerfect = computeLongestPerfectStreak(map);

    const perfectDatesAsc = Object.keys(map)
      .filter(date => map[date].total > 0 && map[date].total === map[date].done)
      .sort();

    return {
      tasksByDate: map,
      perfectDays: stats.perfectDays,
      longestPerfectStreak: longestPerfect,
      perfectDatesAsc
    };
  }, [tasks]);
  let currentTierIndex = -1;
  for (let i = 0; i < JOURNEY_TIERS.length; i++) {
    if (longestPerfectStreak >= JOURNEY_TIERS[i].threshold) {
      currentTierIndex = i;
    }
  }

  const currentTier = currentTierIndex >= 0 ? JOURNEY_TIERS[currentTierIndex] : { name: 'None yet', emoji: '—' };
  const nextTier = currentTierIndex + 1 < JOURNEY_TIERS.length ? JOURNEY_TIERS[currentTierIndex + 1] : null;

  const nextBadgeIn = nextTier ? Math.max(0, nextTier.threshold - perfectDays) : 0;

  return (
    <div className="min-h-screen bg-[#0d121c] p-0 flex items-start justify-center">
      <div className="w-full p-4 sm:p-7 space-y-6">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-slate-200 selection:bg-amber-500/20">

          <header className="mb-8" data-purpose="page-header">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7d5e2a] bg-[#1d1912]/50 text-[#e6b359] text-xs font-semibold tracking-wider mb-4 uppercase">
              <span>S3 · Achievements</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">The Badge Journey</h1>
            <p className="text-slate-400 text-sm sm:text-base">Every perfect day counts. Climb from Night Owl to Legend.</p>
          </header>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10" data-purpose="user-stats-overview">
            <div className="bg-[#141823] border border-[#222938] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Total Perfect Days</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{perfectDays}</span>
                <span className="text-xs text-slate-400 font-medium">days</span>
              </div>
            </div>

            <div className="bg-[#141823] border border-[#222938] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Longest Streak</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{longestPerfectStreak}</span>
                <span className="text-xs text-slate-400 font-medium">days</span>
              </div>
            </div>

            <div className="bg-[#141823] border border-[#222938] rounded-xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-b from-[#1c2e28] to-[#0c1815] border border-[#2d5f4f] flex items-center justify-center p-1 shadow-inner text-2xl drop-shadow-[0_0_6px_rgba(52,211,153,0.5)] text-emerald-400">
                {currentTier.emoji}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">Current Tier</span>
                <span className="text-lg font-bold text-[#e5ad42]">{currentTier.name}</span>
              </div>
            </div>

            <div className="bg-[#141823] border border-[#222938] rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Next Badge In</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {nextTier ? nextBadgeIn : 'Max'}
                </span>
                <span className="text-xs text-slate-400 font-medium">{nextTier ? 'days' : 'level'}</span>
              </div>
            </div>
          </section>

          <section className="relative space-y-4" data-purpose="badge-roadmap">
            <div className="absolute left-[3.15rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#7e5f29] via-[#85652f] to-[#252c3c] z-0 pointer-events-none hidden sm:block"></div>

            {JOURNEY_TIERS.map((tier, index) => {
              const isUnlocked = longestPerfectStreak >= tier.threshold;
              const isCurrent = index === currentTierIndex;
              const baseClasses = "relative z-10 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition ";
              let wrapperClasses = baseClasses;
              let iconWrapperClasses = "w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl border p-2 flex items-center justify-center badge-icon-box text-3xl ";

              if (isCurrent) {
                wrapperClasses += "bg-[#141824] border border-[#e5ad42] shadow-[0_0_15px_rgba(229,173,66,0.18),inset_0_0_0_1px_#d49a37]";
                iconWrapperClasses += "bg-gradient-to-b from-[#18312b] to-[#0c1916] border-[#296856] ring-2 ring-emerald-500/20 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]";
              } else if (isUnlocked) {
                wrapperClasses += "bg-[#141823] border border-[#222838] hover:border-[#2e374d]";
                iconWrapperClasses += "bg-gradient-to-b from-[#263548] to-[#121922] border-[#486383] drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]";
              } else {
                wrapperClasses += "bg-[#141823]/60 border border-[#202636] opacity-80 hover:border-[#2b3346]";
                iconWrapperClasses += "bg-gradient-to-b from-[#252830] to-[#16181e] border-[#373c47] opacity-65 grayscale";
              }

              const progressPercent = Math.min(100, (longestPerfectStreak / tier.threshold) * 100);
              const remaining = Math.max(0, tier.threshold - longestPerfectStreak);

              const earnedDateStr = isUnlocked && perfectDatesAsc.length >= tier.threshold 
                ? perfectDatesAsc[tier.threshold - 1] 
                : null;
              
              let formattedEarnedDate = '';
              if (earnedDateStr) {
                formattedEarnedDate = new Date(earnedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });
              }

              return (
                <article key={tier.name} className={wrapperClasses}>
                  {isCurrent && (
                    <div className="absolute -top-3 right-6 bg-[#f59e0b] text-[#1a1202] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      Current Tier
                    </div>
                  )}

                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    <div className={iconWrapperClasses}>
                      {tier.emoji}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h2 className={`text-lg sm:text-xl font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {tier.name}
                        </h2>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${isUnlocked ? 'text-slate-400 bg-[#1c2333] border-[#2b354c]' : 'text-slate-500 bg-[#1a202c]/50 border-[#252c3c]'}`}>
                          Tier {index + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        Requirement: <span className={`font-bold ${isUnlocked ? 'text-slate-200' : 'text-slate-300'}`}>{tier.threshold} perfect {tier.threshold === 1 ? 'day' : 'days'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {isUnlocked ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a271d] border border-[#166542] text-[#34d399] text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Unlocked</span>
                        </div>
                        {formattedEarnedDate && (
                          <span className="text-[10px] text-slate-500 font-medium px-1">Earned {formattedEarnedDate}</span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b202c] border border-[#2b3346] text-slate-400 text-xs font-medium">
                          <span className="text-amber-500">🔒</span>
                          <span>{remaining} days remaining</span>
                        </div>
                        <div className="w-32 sm:w-36 h-1.5 bg-[#1b212f] rounded-full overflow-hidden">
                          <div className="bg-amber-500/80 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

        </main>
      </div>
    </div>
  );
}
