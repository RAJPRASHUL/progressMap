import { createContext, useContext, useState, useEffect } from 'react';
import { getNewlyUnlockedAchievements } from '../utils/milestones';

const MilestoneContext = createContext({});

export function MilestoneProvider({ children }) {
  const [toastQueue, setToastQueue] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);

  // Process toast queue
  useEffect(() => {
    if (toastQueue.length > 0 && !currentToast) {
      setCurrentToast(toastQueue[0]);
    }
  }, [toastQueue, currentToast]);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (currentToast) {
      const timer = setTimeout(() => {
        setCurrentToast(null);
        setToastQueue((prev) => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentToast]);

  function checkAndNotifyUnlocks(oldStats, newStats) {
    const newUnlocks = getNewlyUnlockedAchievements(oldStats, newStats);
    if (newUnlocks.length > 0) {
      setToastQueue((prev) => [...prev, ...newUnlocks]);
    }
  }

  return (
    <MilestoneContext.Provider value={{ checkAndNotifyUnlocks }}>
      {children}
      
      {/* Global Toast Container */}
      {currentToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className="bg-[#1f283d] border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 rounded-2xl p-4 pr-12 flex items-center space-x-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-cyan-400" />
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-indigo-500/40 flex items-center justify-center text-2xl shadow-sm shadow-blue-500/20">
              {currentToast.emoji}
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Achievement Unlocked
              </div>
              <div className="text-sm font-bold text-white">
                {currentToast.name}
              </div>
              <div className="text-xs text-slate-400">
                {currentToast.desc}
              </div>
            </div>
            <button 
              onClick={() => {
                setCurrentToast(null);
                setToastQueue((prev) => prev.slice(1));
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </MilestoneContext.Provider>
  );
}

export function useMilestones() {
  return useContext(MilestoneContext);
}
