export const BADGE_TIERS = [
  { name: 'Night Owl', threshold: 1,    emoji: '🦉', color: 'cyan',  desc: 'Complete 1 consecutive perfect day' },
  { name: 'Spark',     threshold: 3,    emoji: '⚡', color: 'cyan',  desc: 'Complete 3 consecutive perfect days' },
  { name: 'Flame',     threshold: 7,    emoji: '🔥', color: 'amber', desc: 'Complete 7 consecutive perfect days' },
  { name: 'Phoenix',   threshold: 14,   emoji: '🏆', color: 'amber', desc: 'Complete 14 consecutive perfect days' },
  { name: 'Dragon',    threshold: 30,   emoji: '🐉', color: 'amber', desc: 'Complete 30 consecutive perfect days' },
  { name: 'Titan',     threshold: 60,   emoji: '💎', color: 'amber', desc: 'Complete 60 consecutive perfect days' },
  { name: 'Mythic',    threshold: 100,  emoji: '🌌', color: 'amber', desc: 'Complete 100 consecutive perfect days' },
  { name: 'Immortal',  threshold: 365,  emoji: '🦁', color: 'amber', desc: 'Complete 365 consecutive perfect days' },
  { name: 'Legend',    threshold: 1000, emoji: '👑', color: 'amber', desc: 'Complete 1000 consecutive perfect days' },
];

export const JOURNEY_TIERS = BADGE_TIERS;

export const ACHIEVEMENT_BADGES = [
  { id: 'first_task',   name: 'First Step',    emoji: '🌟', check: (stats) => stats.totalTasks >= 1, desc: 'Complete your first task' },
  { id: 'ten_tasks',    name: 'Hustler',       emoji: '⭐', check: (stats) => stats.totalDone >= 10, desc: 'Complete 10 tasks' },
  { id: 'perfect_day',  name: 'Perfect Day',   emoji: '🎯', check: (stats) => stats.perfectDays >= 1, desc: 'Complete all tasks in a day' },
  { id: 'five_perfect', name: 'Perfectionist', emoji: '✨', check: (stats) => stats.perfectDays >= 5, desc: '5 perfect days' },
  { id: 'fifty_tasks',  name: 'Warrior',       emoji: '⚔️', check: (stats) => stats.totalDone >= 50, desc: 'Complete 50 tasks' },
  { id: 'hundred',      name: 'Centurion',     emoji: '🛡️', check: (stats) => stats.totalDone >= 100, desc: 'Complete 100 tasks' },
  { id: 'week_perfect', name: 'Unstoppable',   emoji: '🚀', check: (stats) => stats.perfectDays >= 7, desc: '7 perfect days' },
  { id: 'two_hundred',  name: 'Grandmaster',   emoji: '💎', check: (stats) => stats.totalDone >= 200, desc: 'Complete 200 tasks' },
];

export function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function computeStreak(tasksByDate) {
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

export function computePerfectDayStreak(tasksByDate) {
  let streak = 0;
  const date = new Date();

  while (streak < 1000) {
    const info = tasksByDate[toLocalDate(date)];
    if (!info || info.total === 0 || info.done !== info.total) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

export function computeLongestPerfectStreak(tasksByDate) {
  let longest = 0;
  let current = 0;
  let previousDate = null;

  Object.keys(tasksByDate).sort().forEach((dateStr) => {
    const info = tasksByDate[dateStr];
    const date = new Date(`${dateStr}T12:00:00`);
    const isPerfect = info.total > 0 && info.done === info.total;
    const daysSincePrevious = previousDate
      ? Math.floor((date - previousDate) / (1000 * 60 * 60 * 24))
      : null;

    if (isPerfect && daysSincePrevious === 1) {
      current += 1;
    } else if (isPerfect) {
      current = 1;
    } else {
      current = 0;
    }

    if (isPerfect) longest = Math.max(longest, current);
    previousDate = date;
  });

  return longest;
}

export function computeLongestStreak(tasksByDate) {
  let longest = 0;
  let current = 0;
  const sortedDates = Object.keys(tasksByDate).sort();
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const info = tasksByDate[dateStr];
    if (info.done > 0) {
      const d = new Date(dateStr);
      if (!prevDate) {
        current = 1;
      } else {
        const diff = Math.floor((d - prevDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          current += 1;
        } else {
          current = 1;
        }
      }
      prevDate = d;
      if (current > longest) longest = current;
    }
  }
  
  return longest;
}

export function computeStats(tasksByDate) {
  let totalTasks = 0;
  let totalDone = 0;
  let perfectDays = 0;

  Object.values(tasksByDate).forEach((info) => {
    totalTasks += info.total;
    totalDone += info.done;
    if (info.total > 0 && info.done === info.total) perfectDays += 1;
  });

  return { totalTasks, totalDone, perfectDays };
}
export function getNewlyUnlockedAchievements(oldStats, newStats) {
  const oldUnlocked = ACHIEVEMENT_BADGES.filter(b => b.check(oldStats)).map(b => b.id);
  const newUnlocked = ACHIEVEMENT_BADGES.filter(b => b.check(newStats));
  
  return newUnlocked.filter(b => !oldUnlocked.includes(b.id));
}
