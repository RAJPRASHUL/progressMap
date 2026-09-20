import { useState } from 'react';
import Navbar from '../components/Navbar';
import TodaysQuest from '../components/TodaysQuest';
import Heatmap from '../components/Heatmap';
import DayDrawer from '../components/DayDrawer';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Export PNG handler — implemented in Step 22
  function handleExportPng() {
    // placeholder until Step 22 (Canvas export)
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
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[160px]">
              <p className="text-slate-500 text-sm">30-Day Chart — Step 15</p>
            </div>
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[160px]">
              <p className="text-slate-500 text-sm">Weekday Averages — Step 16</p>
            </div>
          </section>

          {/* Right col: Rings + Badges */}
          <section className="lg:col-span-3 space-y-5">
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
              <p className="text-slate-500 text-sm">Consistency Ring — Step 17</p>
            </div>
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
              <p className="text-slate-500 text-sm">Streak Card — Step 17</p>
            </div>
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
              <p className="text-slate-500 text-sm">Badge Wall — Step 18</p>
            </div>
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
