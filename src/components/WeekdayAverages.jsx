import { useState, useEffect, useMemo } from 'react';
import { getTasks } from '../storage';

// ── Helpers ───────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Get the last 90 days of dates for a statistically meaningful average. */
function getPast90Days() {
  const dates = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(toLocalDate(d));
  }
  return dates;
}

// ── Component ─────────────────────────────────────────────────────────

export default function WeekdayAverages() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);

  const dates = useMemo(() => getPast90Days(), []);

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

  // Compute averages per weekday (Mon=0 .. Sun=6)
  const averages = useMemo(() => {
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);

    dates.forEach((dateStr) => {
      const d = new Date(dateStr + 'T12:00:00');
      const jsDay = d.getDay(); // 0=Sun, 1=Mon...6=Sat
      // Convert to Mon=0: Mon=0,Tue=1,...,Sun=6
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

      const info = tasksByDate[dateStr];
      if (info && info.total > 0) {
        sums[dayIdx] += info.done / info.total;
        counts[dayIdx] += 1;
      }
    });

    return sums.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
  }, [dates, tasksByDate]);

  // Find which day has the highest average (for purple highlight)
  const maxAvg = Math.max(...averages);
  const bestDayIdx = averages.indexOf(maxAvg);

  // Today's weekday index for a subtle indicator
  const todayJsDay = new Date().getDay();
  const todayIdx = todayJsDay === 0 ? 6 : todayJsDay - 1;

  return (
    <section
      className="card-glass rounded-2xl p-5 flex flex-col justify-between"
      data-purpose="weekday-averages"
    >
      <h2 className="text-sm font-semibold tracking-wide text-white mb-4">
        Weekday Averages
      </h2>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-sm text-slate-500">
          Loading...
        </div>
      ) : (
        <div className="h-40 flex items-end justify-between px-2 pt-4">
          {DAY_LABELS.map((label, i) => {
            const avg = averages[i];
            // Min height 5 (h-5 = 20px), max 128px
            const heightPx = Math.max(20, Math.round(avg * 128));
            const isBest = i === bestDayIdx && maxAvg > 0;
            const isToday = i === todayIdx;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`w-3.5 rounded-full transition-all duration-500 ${isBest
                      ? 'bg-[#6d5dfc]'
                      : 'bg-emerald-400'
                    }`}
                  style={{
                    height: `${heightPx}px`,
                    ...(isBest
                      ? { filter: 'drop-shadow(0 0 10px rgba(128, 104, 255, 0.5))' }
                      : {}),
                  }}
                />
                <span
                  className={`text-[10px] ${isBest
                      ? 'text-slate-400 font-semibold'
                      : isToday
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
