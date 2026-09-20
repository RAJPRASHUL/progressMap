export const BADGE_TIERS = [
  { name: 'Spark',   threshold: 3,  emoji: '⚡', color: 'cyan',   desc: 'Complete 3-day streak' },
  { name: 'Flame',   threshold: 7,  emoji: '🔥', color: 'amber',  desc: 'Complete 7-day streak' },
  { name: 'Phoenix', threshold: 14, emoji: '🏆', color: 'amber',  desc: 'Complete 14-day streak' },
  { name: 'Titan',   threshold: 30, emoji: '💎', color: 'amber',  desc: 'Complete 30-day streak' },
  { name: 'Legend',  threshold: 60, emoji: '👑', color: 'amber',  desc: 'Complete 60-day streak' },
];

export const JOURNEY_TIERS = [
  { name: 'Night Owl', threshold: 1,   emoji: '🦉' },
  { name: 'Spark',     threshold: 3,   emoji: '⚡' },
  { name: 'Flame',     threshold: 7,   emoji: '🔥' },
  { name: 'Phoenix',   threshold: 14,  emoji: '🏆' },
  { name: 'Dragon',    threshold: 30,  emoji: '🐉' },
  { name: 'Titan',     threshold: 60,  emoji: '💎' },
  { name: 'Mythic',    threshold: 100, emoji: '🌌' },
  { name: 'Immortal',  threshold: 365, emoji: '🦁' }
];

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

export function computeLongestStreak(tasksByDate) {
  let longest = 0;
  let current = 0;
  
  // Sort dates to walk forward
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

// Function to compare old and new unlocked badges to find new unlocks
export function getNewlyUnlockedAchievements(oldStats, newStats) {
  const oldUnlocked = ACHIEVEMENT_BADGES.filter(b => b.check(oldStats)).map(b => b.id);
  const newUnlocked = ACHIEVEMENT_BADGES.filter(b => b.check(newStats));
  
  return newUnlocked.filter(b => !oldUnlocked.includes(b.id));
}
