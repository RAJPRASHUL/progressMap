import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getTasks, getSettings } from '../storage';

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}


function getDatesForView(year, currentYear) {
  const dates = [];
  if (year === currentYear) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 364); // 365 days total
    
    let d = new Date(start);
    while (d <= end) {
      dates.push(toLocalDate(d));
      d.setDate(d.getDate() + 1);
    }
  } else {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    
    let d = new Date(start);
    while (d <= end) {
      dates.push(toLocalDate(d));
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
}


function intensityLevel(ratio) {
  if (ratio <= 0) return 0;
  if (ratio <= 0.33) return 1;
  if (ratio <= 0.66) return 2;
  if (ratio <= 0.99) return 3;
  return 4;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const GITHUB_COLORS = [
  '#161b22',
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
];

export default function Heatmap({ onDayClick }) {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  
  const [year, setYear] = useState(currentYear);
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const graphRef = useRef(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const [weekStart, setWeekStart] = useState('Monday');

  const today = toLocalDate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const from = year === currentYear ? getDatesForView(year, currentYear)[0] : `${year}-01-01`;
    const to = year === currentYear ? today : `${year}-12-31`;

    Promise.all([
      getTasks(from, to).catch(() => []),
      getSettings().catch(() => null)
    ]).then(([tasks, settings]) => {
      if (cancelled) return;
      
      if (settings?.preferences?.weekStart) {
        setWeekStart(settings.preferences.weekStart);
      }

      const map = {};
      tasks.forEach((t) => {
        if (!map[t.date]) map[t.date] = { total: 0, done: 0 };
        map[t.date].total += 1;
        if (t.completed) map[t.date].done += 1;
      });
      setTasksByDate(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [year, today, currentYear, refreshKey]);

  useEffect(() => {
    const handleTasksChanged = () => setRefreshKey((key) => key + 1);
    window.addEventListener('tasks-changed', handleTasksChanged);
    return () => window.removeEventListener('tasks-changed', handleTasksChanged);
  }, []);

  useEffect(() => {
    const handleSettingsChanged = () => setRefreshKey((key) => key + 1);
    window.addEventListener('settings-changed', handleSettingsChanged);
    return () => window.removeEventListener('settings-changed', handleSettingsChanged);
  }, []);
  const { grid, monthLabels, totalTasks } = useMemo(() => {
    const dates = getDatesForView(year, currentYear);
    if (dates.length === 0) return { grid: [], monthLabels: [], totalTasks: 0 };

    const firstDate = new Date(dates[0] + 'T12:00:00');
    const firstDay = firstDate.getDay();
    
    let startOffset;
    if (weekStart === 'Monday') {
      startOffset = firstDay === 0 ? 6 : firstDay - 1; 
    } else {
      startOffset = firstDay; 
    }

    const columns = [];
    dates.forEach((dateStr, dateIndex) => {
      const date = new Date(`${dateStr}T12:00:00`);
      const rowIndex = weekStart === 'Monday'
        ? (date.getDay() + 6) % 7
        : date.getDay();
      const columnIndex = Math.floor((dateIndex + startOffset) / 7);

      if (!columns[columnIndex]) columns[columnIndex] = new Array(7).fill(null);
      columns[columnIndex][rowIndex] = dateStr;
    });

    const labels = [];
    let lastMonth = -1;
    columns.forEach((week, colIdx) => {
      const firstValid = week.find(d => d);
      if (!firstValid) return;
      const month = parseInt(firstValid.slice(5, 7), 10) - 1;
      if (month !== lastMonth) {
        if (labels.length === 0 || colIdx - labels[labels.length - 1].colIdx > 2) {
          labels.push({ month, colIdx });
          lastMonth = month;
        }
      }
    });

    let total = 0;
    Object.values(tasksByDate).forEach(info => total += info.done);

    return { grid: columns, monthLabels: labels, totalTasks: total };
  }, [year, currentYear, weekStart, tasksByDate]);

  const handleMouseEnter = useCallback((e, dateStr) => {
    if (!dateStr) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(dateStr);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const handleCellClick = useCallback((dateStr) => {
    if (dateStr && onDayClick && dateStr <= today) {
      onDayClick(dateStr);
    }
  }, [onDayClick, today]);

  const tooltipData = useMemo(() => {
    if (!hoveredDay) return null;
    const info = tasksByDate[hoveredDay];
    const d = new Date(hoveredDay + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!info || info.total === 0) {
      return { label, count: 'No tasks' };
    }
    return {
      label,
      count: `✓ ${info.done} / ${info.total} (${Math.round((info.done / info.total) * 100)}%)`
    };
  }, [hoveredDay, tasksByDate]);
  const colWidth = 15;
  const dayLabels = weekStart === 'Monday'
    ? ['', 'Mon', '', 'Wed', '', 'Fri', '']
    : ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  useEffect(() => {
    if (!loading && year === currentYear && graphRef.current) {
      graphRef.current.scrollLeft = graphRef.current.scrollWidth;
    }
  }, [loading, year, currentYear, grid.length]);

  return (
    <section id="heatmap-container" className="lg:col-span-6 flex flex-col md:flex-row gap-6 relative" data-purpose="my-year-heatmap">
      
      
      <div className="flex-1 min-w-0">
        
        
        <div className="flex justify-between items-end mb-2 px-1">
          <h2 className="text-sm font-semibold text-white">
            {totalTasks} tasks completed in {year === currentYear ? 'the last year' : year}
          </h2>
        </div>

        
        <div 
          ref={graphRef}
          className="border rounded-md p-4 overflow-x-auto overflow-y-hidden"
          style={{ backgroundColor: '#000000', borderColor: '#30363d' }}
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-[140px]">
              <div className="text-[#7d8590] text-xs">Loading...</div>
            </div>
          ) : (
            <div className="flex gap-2">
              
              
              <div className="flex flex-col text-[9px] text-[#f0f6fc] font-medium pt-[18px] pb-[4px]">
                {dayLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="h-[15px] leading-[12px]">{label}</span>
                ))}
              </div>

              
              <div className="flex-1 relative pb-1">
                
                <div className="relative h-[18px]" style={{ minWidth: grid.length * colWidth }}>
                  {monthLabels.map(({ month, colIdx }) => (
                    <span
                      key={`${month}-${colIdx}`}
                      className="text-[9px] text-[#f0f6fc] font-medium absolute top-0"
                      style={{ left: colIdx * colWidth }}
                    >
                      {MONTH_NAMES[month]}
                    </span>
                  ))}
                </div>

                
                <div 
                  className="flex flex-col flex-wrap h-[104px] content-start"
                  style={{ gap: '3px', width: grid.length * colWidth }}
                >
                  {grid.map((week, colIdx) =>
                    week.map((dateStr, rowIdx) => {
                      if (!dateStr) {
                        return (
                          <div
                            key={`empty-${colIdx}-${rowIdx}`}
                            className="w-[12px] h-[12px] rounded-[2px]"
                            style={{ backgroundColor: 'transparent' }}
                          />
                        );
                      }

                      const info = tasksByDate[dateStr];
                      const total = info?.total || 0;
                      const done = info?.done || 0;
                      const ratio = total > 0 ? done / total : 0;
                      
                      const level = total > 0 ? intensityLevel(ratio) : 0;
                      const isFuture = dateStr > today;

                      return (
                        <div
                          key={dateStr}
                          className={`
                            w-[12px] h-[12px] rounded-[2px] transition-all duration-75 outline-none
                            ${isFuture ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:ring-1 hover:ring-white hover:z-10 focus:ring-2 focus:ring-blue-500'}
                          `}
                          style={{
                            backgroundColor: GITHUB_COLORS[level],
                            boxShadow: 'inset 0 0 0 1px rgba(27, 31, 36, 0.65)',
                          }}
                          onMouseEnter={(e) => handleMouseEnter(e, dateStr)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleCellClick(dateStr)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellClick(dateStr);
                          }}
                          tabIndex={isFuture ? -1 : 0}
                          aria-label={`${dateStr}: ${total > 0 ? done + ' completed' : 'No tasks'}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          
          <div className="mt-4 flex items-center justify-between text-[10px] text-[#7d8590]">
            <span />
            <div className="flex items-center gap-1">
              <span className="mr-1">Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: GITHUB_COLORS[0] }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: GITHUB_COLORS[1] }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: GITHUB_COLORS[2] }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: GITHUB_COLORS[3] }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: GITHUB_COLORS[4] }} />
              <span className="ml-1">More</span>
            </div>
          </div>

        </div>
      </div>

      
      <div className="w-full md:w-32 shrink-0 flex flex-row md:flex-col gap-1.5 md:pt-8">
        {availableYears.map(y => {
          const isActive = year === y;
          return (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`
                px-4 py-2 rounded-md text-xs font-medium text-left transition
                ${isActive 
                  ? 'bg-[#1f6feb] text-white' 
                  : 'text-[#7d8590] hover:bg-[#30363d]/50'
                }
              `}
            >
              {y}
            </button>
          );
        })}
      </div>

      
      {hoveredDay && tooltipData && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-black/90 text-slate-100 text-[11px] px-3 py-2 rounded-md font-medium whitespace-nowrap shadow-xl">
            <span className="text-slate-300 font-normal mr-2">{tooltipData.count}</span>
            <span className="text-slate-400">on {tooltipData.label}</span>
          </div>
        </div>
      )}
    </section>
  );
}
