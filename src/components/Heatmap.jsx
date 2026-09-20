import { useState, useEffect, useMemo, useCallback } from 'react';
import { getTasks } from '../storage';

// ── Helpers ───────────────────────────────────────────────────────────

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Generate all dates from Jan 1 of `year` through Dec 31 (or today). */
function getYearDates(year) {
  const start = new Date(year, 0, 1);       // Jan 1
  const now = new Date();
  const endDate = year === now.getFullYear()
    ? now                                     // only up to today for current year
    : new Date(year, 11, 31);                 // full year for past years

  const dates = [];
  const d = new Date(start);
  while (d <= endDate) {
    dates.push(toLocalDate(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Map ratio (0–1) to intensity level 0–4. */
function intensityLevel(ratio) {
  if (ratio <= 0)    return 0; // no tasks or 0%
  if (ratio < 0.33)  return 1; // dim
  if (ratio < 0.66)  return 2; // med
  if (ratio < 1)     return 3; // bright
  return 4;                    // perfect (100%)
}

const CELL_COLORS = [
  '#1a2233',  // 0: empty / no tasks
  '#143528',  // 1: dim
  '#15803d',  // 2: med
  '#22c55e',  // 3: bright
  '#4ade80',  // 4: intense (perfect)
];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Heatmap Component ─────────────────────────────────────────────────

export default function Heatmap({ onDayClick }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [tasksByDate, setTasksByDate] = useState({});  // { 'YYYY-MM-DD': { total, done } }
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const today = toLocalDate();

  // Fetch all tasks for the selected year
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = `${year}-01-01`;
    const to = year === currentYear ? today : `${year}-12-31`;

    getTasks(from, to)
      .then((tasks) => {
        if (cancelled) return;
        // Aggregate tasks per date
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
  }, [year, today, currentYear]);

  // Build the grid: 7 rows (Mon–Sun) × N week columns
  const { grid, monthLabels } = useMemo(() => {
    const dates = getYearDates(year);
    if (dates.length === 0) return { grid: [], monthLabels: [] };

    // Find the weekday of Jan 1 (0=Sun..6=Sat). We use Mon=0 layout.
    const jan1 = new Date(year, 0, 1);
    const jan1Day = jan1.getDay(); // 0=Sun
    // Convert to Mon=0: Mon=0,Tue=1,...,Sun=6
    const startOffset = jan1Day === 0 ? 6 : jan1Day - 1;

    // Build columns (weeks). Each column = 7 slots (Mon–Sun).
    const columns = [];
    let col = new Array(7).fill(null);

    // Fill offset at start
    let dateIndex = 0;
    for (let i = startOffset; i < 7 && dateIndex < dates.length; i++) {
      col[i] = dates[dateIndex++];
    }
    columns.push(col);

    // Fill remaining weeks
    while (dateIndex < dates.length) {
      col = new Array(7).fill(null);
      for (let i = 0; i < 7 && dateIndex < dates.length; i++) {
        col[i] = dates[dateIndex++];
      }
      columns.push(col);
    }

    // Compute month labels positioned at the first column where that month starts
    const labels = [];
    let lastMonth = -1;
    columns.forEach((week, colIdx) => {
      for (const dateStr of week) {
        if (!dateStr) continue;
        const month = parseInt(dateStr.slice(5, 7), 10) - 1;
        if (month !== lastMonth) {
          labels.push({ month, colIdx });
          lastMonth = month;
        }
        break; // only check first non-null date in the week
      }
    });

    return { grid: columns, monthLabels: labels };
  }, [year]);

  const handleMouseEnter = useCallback((e, dateStr) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(dateStr);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const handleCellClick = useCallback((dateStr) => {
    if (dateStr && onDayClick) {
      onDayClick(dateStr);
    }
  }, [onDayClick]);

  // Tooltip data
  const tooltipData = useMemo(() => {
    if (!hoveredDay) return null;
    const info = tasksByDate[hoveredDay];
    const d = new Date(hoveredDay + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!info || info.total === 0) {
      return { label, done: 0, total: 0, pct: 0 };
    }
    return {
      label,
      done: info.done,
      total: info.total,
      pct: Math.round((info.done / info.total) * 100),
    };
  }, [hoveredDay, tasksByDate]);

  return (
    <section
      id="heatmap-container"
      className="lg:col-span-6 card-glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      data-purpose="my-year-heatmap"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wide text-white">My Year</h2>

          {/* Year switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="w-6 h-6 rounded-md bg-[#1f283d] text-slate-400 hover:text-white text-xs flex items-center justify-center transition"
              aria-label="Previous year"
            >
              ‹
            </button>
            <span className="text-xs font-medium text-slate-300 min-w-[36px] text-center">
              {year}
            </span>
            <button
              onClick={() => setYear((y) => Math.min(y + 1, currentYear))}
              disabled={year >= currentYear}
              className="w-6 h-6 rounded-md bg-[#1f283d] text-slate-400 hover:text-white text-xs flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next year"
            >
              ›
            </button>
          </div>
        </div>

        {/* Heatmap grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[160px]">
            <div className="text-slate-500 text-xs">Loading...</div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            {/* Month labels row */}
            <div className="flex mb-1 ml-0" style={{ minWidth: grid.length * 26 }}>
              {monthLabels.map(({ month, colIdx }) => (
                <span
                  key={`${month}-${colIdx}`}
                  className="text-[10px] text-slate-500 font-medium absolute"
                  style={{
                    position: 'relative',
                    left: colIdx * 26,
                  }}
                >
                  {MONTH_NAMES[month]}
                </span>
              ))}
            </div>

            {/* Grid: 7 rows × N columns */}
            <div
              className="grid grid-rows-7 grid-flow-col gap-[5px]"
              style={{ minWidth: grid.length * 26 }}
            >
              {grid.map((week, colIdx) =>
                week.map((dateStr, rowIdx) => {
                  if (!dateStr) {
                    // Empty slot (before Jan 1 or after today)
                    return (
                      <div
                        key={`empty-${colIdx}-${rowIdx}`}
                        className="w-5 h-5 rounded-md"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    );
                  }

                  const info = tasksByDate[dateStr];
                  const total = info?.total || 0;
                  const done = info?.done || 0;
                  const ratio = total > 0 ? done / total : 0;
                  const level = total > 0 ? intensityLevel(ratio) : 0;
                  const isPerfect = total > 0 && done === total;
                  const isToday = dateStr === today;

                  return (
                    <div
                      key={dateStr}
                      className={`
                        w-5 h-5 rounded-md relative cursor-pointer
                        transition-all duration-150 hover:scale-125 hover:z-10
                        ${isToday ? 'border-2 border-amber-500' : ''}
                        ${isPerfect ? 'flex items-center justify-center' : ''}
                      `}
                      style={{
                        backgroundColor: CELL_COLORS[level],
                        ...(isToday ? { boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)' } : {}),
                      }}
                      onMouseEnter={(e) => handleMouseEnter(e, dateStr)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCellClick(dateStr)}
                      title={dateStr}
                    >
                      {isPerfect && (
                        <span className="text-[8px] leading-none">👑</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Legend Gradient Bar */}
      <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>No tasks</span>
        <div className="w-3/5 h-1.5 mx-3 rounded-full bg-gradient-to-r from-emerald-950 via-emerald-600 to-green-400" />
        <span>Perfect day</span>
      </div>

      {/* Floating tooltip */}
      {hoveredDay && tooltipData && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-[#1f283d] text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-slate-700 shadow-lg flex items-center space-x-1 whitespace-nowrap">
            <span className="font-medium text-white">{tooltipData.label}</span>
            <span className="text-slate-500">—</span>
            {tooltipData.total > 0 ? (
              <>
                <span className="text-emerald-400 font-bold">✓ {tooltipData.done}</span>
                <span>{tooltipData.done}/{tooltipData.total} · {tooltipData.pct}%</span>
              </>
            ) : (
              <span className="text-slate-500">no tasks</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
