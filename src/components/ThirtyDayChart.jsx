import { useState, useEffect, useMemo, useRef } from 'react';
import { getTasks } from '../storage';

// ── Helpers ───────────────────────────────────────────────────────────

function toLocalDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPast30Days() {
  const dates = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(toLocalDate(d));
  }
  return dates;
}

// Generates a smooth SVG path using cubic bezier curves
function generateSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    // Control points for a smooth curve (horizontal tangent)
    const cpX = (p0.x + p1.x) / 2;
    d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

// ── Component ─────────────────────────────────────────────────────────

export default function ThirtyDayChart() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const svgRef = useRef(null);

  const dates = useMemo(() => getPast30Days(), []);
  
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
      .catch((err) => {
        console.error('Failed to load 30-day tasks:', err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dates]);

  // Compute points
  const points = useMemo(() => {
    return dates.map((date, i) => {
      const info = tasksByDate[date] || { total: 0, done: 0 };
      const pct = info.total > 0 ? info.done / info.total : 0;
      
      // X: 0 to 500
      const x = (i / 29) * 500;
      // Y: 150 (bottom/0%) to 20 (top/100%)
      const y = 150 - (pct * 130);
      
      return { x, y, date, ...info, pct: Math.round(pct * 100) };
    });
  }, [dates, tasksByDate]);

  // Generate paths
  const linePath = useMemo(() => generateSmoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (!linePath) return '';
    return `${linePath} L 500,180 L 0,180 Z`;
  }, [linePath]);

  // Find 100% days for peaks
  const perfectDays = points.filter(p => p.total > 0 && p.done === p.total);

  // Mouse interaction
  function handleMouseMove(e) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const dataX = xRatio * 500;
    
    // Find closest point index
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].x - dataX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoveredIndex(closestIdx);
  }

  function handleMouseLeave() {
    setHoveredIndex(null);
  }

  const tooltipPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <section 
      className="card-glass rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden h-full min-h-[250px]" 
      data-purpose="30-days-chart"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-white">30 Days</h2>
        
        {/* Active Tooltip Badge (or placeholder) */}
        {tooltipPoint && tooltipPoint.total > 0 ? (
          <div className="bg-[#1f283d] text-slate-300 text-[10px] px-2.5 py-1 rounded-full border border-slate-700 shadow-md flex items-center space-x-1">
            <span>
              {new Date(tooltipPoint.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
              {' · '}{tooltipPoint.done}/{tooltipPoint.total}{' '}
              {tooltipPoint.done === tooltipPoint.total ? '🎯' : ''}
            </span>
          </div>
        ) : tooltipPoint ? (
           <div className="bg-[#1f283d] text-slate-500 text-[10px] px-2.5 py-1 rounded-full border border-slate-700 shadow-md">
            {new Date(tooltipPoint.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · no tasks
          </div>
        ) : (
          <div className="h-6" /> // spacer to prevent layout shift
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
          Loading chart...
        </div>
      ) : (
        <div 
          className="relative w-full h-44 mt-2"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg 
            ref={svgRef}
            className="w-full h-full cursor-crosshair" 
            preserveAspectRatio="none" 
            viewBox="0 0 500 180"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#0e1422" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="35%" stopColor="#818cf8" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Area Fill */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line Stroke */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#strokeGrad)" 
              strokeLinecap="round" 
              strokeWidth="3.5" 
            />

            {/* Perfect Day Peaks (Always visible) */}
            {perfectDays.map((p, idx) => (
              <g key={`peak-${idx}`}>
                <circle cx={p.x} cy={p.y} r="7" fill={idx % 2 === 0 ? "#818cf8" : "#38bdf8"} fillOpacity="0.35" />
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={idx % 2 === 0 ? "#818cf8" : "#38bdf8"} strokeWidth="2" />
              </g>
            ))}

            {/* Hovered Point Indicator */}
            {tooltipPoint && (
              <line 
                x1={tooltipPoint.x} 
                y1="0" 
                x2={tooltipPoint.x} 
                y2="180" 
                stroke="#ffffff" 
                strokeOpacity="0.15" 
                strokeDasharray="4 4" 
              />
            )}
            {tooltipPoint && tooltipPoint.total > 0 && !perfectDays.find(p => p.date === tooltipPoint.date) && (
               <circle cx={tooltipPoint.x} cy={tooltipPoint.y} r="4" fill="#ffffff" stroke="#60a5fa" strokeWidth="2" />
            )}
          </svg>
        </div>
      )}
    </section>
  );
}
