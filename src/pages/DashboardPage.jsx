import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TodaysQuest from '../components/TodaysQuest';
import Heatmap from '../components/Heatmap';
import DayDrawer from '../components/DayDrawer';
import WeekdayAverages from '../components/WeekdayAverages';
import ConsistencyRing from '../components/ConsistencyRing';
import StreakCard from '../components/StreakCard';
import BadgeWall from '../components/BadgeWall';
import { exportHeatmapToPng } from '../utils/exportImage';

export default function DashboardPage() {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  function handleExportPng() {
    exportHeatmapToPng('heatmap-container', `ProgressMap-Heatmap-${new Date().toISOString().slice(0, 10)}.png`);
  }

  useEffect(() => {
    if (new URLSearchParams(location.search).get('export') !== 'true') return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(handleExportPng);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.search]);
  function handleDayClick(dateStr) {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-black p-0 flex items-start justify-center">
      <div className="w-full p-4 sm:p-7 space-y-6">
        
        <Navbar onExportPng={handleExportPng} />

        
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <TodaysQuest />

          
          <section className="lg:col-span-8 space-y-5">
            <Heatmap onDayClick={handleDayClick} />
            <WeekdayAverages />
          </section>

          
          <section className="lg:col-span-2 lg:-ml-4 space-y-5">
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
