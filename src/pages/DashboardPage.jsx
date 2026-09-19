import Navbar from '../components/Navbar';

export default function DashboardPage() {
  // Export PNG handler — implemented in Step 22
  function handleExportPng() {
    // placeholder until Step 22 (Canvas export)
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] p-3 sm:p-6 lg:p-10 flex items-start justify-center">
      <div className="w-full max-w-[1520px] rounded-3xl p-4 sm:p-7 bg-[#0d121c] border border-white/5 shadow-2xl space-y-6">
        {/* ── Navbar ── */}
        <Navbar onExportPng={handleExportPng} />

        {/* ── Dashboard grid — placeholder cards for Step 7 ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left col: Today's Quest */}
          <section className="lg:col-span-3 card-glass rounded-2xl p-5 flex items-center justify-center min-h-[300px]">
            <p className="text-slate-500 text-sm">Today's Quest — Step 10</p>
          </section>

          {/* Center col: Heatmap + Charts */}
          <section className="lg:col-span-6 space-y-5">
            <div className="card-glass rounded-2xl p-5 flex items-center justify-center min-h-[300px]">
              <p className="text-slate-500 text-sm">Heatmap — Step 12</p>
            </div>
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
    </div>
  );
}
