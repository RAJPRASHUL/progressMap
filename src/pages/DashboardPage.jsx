import { useState } from 'react';
import Navbar from '../components/Navbar';
import TodaysQuest from '../components/TodaysQuest';
import Heatmap from '../components/Heatmap';
import DayDrawer from '../components/DayDrawer';
import ThirtyDayChart from '../components/ThirtyDayChart';
import WeekdayAverages from '../components/WeekdayAverages';
import ConsistencyRing from '../components/ConsistencyRing';
import StreakCard from '../components/StreakCard';
import BadgeWall from '../components/BadgeWall';
import { exportHeatmapToPng } from '../utils/exportImage';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Export PNG handler
  function handleExportPng() {
    exportHeatmapToPng('heatmap-container', `ProgressMap-Heatmap-${new Date().toISOString().slice(0,10)}.png`);
  }

  // Day click handler
  function handleDayClick(dateStr) {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] p-3 sm:p-6 lg:p-10 flex items-start justify-center">
      <div className="w-full max-w-[1520px] rounded-3xl p-4 sm:p-7 bg-[#0d121c] border border-white/5 shadow-2xl space-y-6">
        {/* ── Navbar ── */}
        <Navbar onExportPng={handleExportPng} />

        {/* ── Dashboard grid ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left col: Today's Quest (live) */}
          <TodaysQuest />

          {/* Center col: Heatmap + Charts */}
          <section className="lg:col-span-6 space-y-5">
            <Heatmap onDayClick={handleDayClick} />
            <ThirtyDayChart />
            <WeekdayAverages />
          </section>

          {/* Right col: Rings + Badges */}
          <section className="lg:col-span-3 space-y-5">
            <ConsistencyRing />
            <StreakCard />
            <BadgeWall />
          </section>
        </main>
      </div>

      <DayDrawer 
        isOpen={isDrawerOpen} 
        date={selectedDate} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
