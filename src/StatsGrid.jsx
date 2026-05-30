import React from 'react';

export function StatsGrid({ stats, activeTab }) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-center shadow-[0_0_15px_rgba(236,72,153,0.1)]">
        <p className="text-pink-400 font-bold text-sm uppercase">Total 30 Bs ({activeTab})</p>
        <p className="text-4xl font-black mt-2 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{stats.total30}</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 text-center shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <p className="text-cyan-400 font-bold text-sm uppercase">Total 40 Bs ({activeTab})</p>
        <p className="text-4xl font-black mt-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{stats.total40}</p>
      </div>
      <div className="col-span-2 relative p-[2px] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-lime-400 via-cyan-400 to-purple-500 animate-rainbow"></div>
        <div className="relative bg-neutral-950 rounded-[22px] p-6 text-center h-full">
          <p className="text-neutral-300 font-bold text-xs uppercase tracking-widest mb-1">Recaudado Confirmado ({activeTab})</p>
          <div className="text-5xl font-black text-white flex justify-center items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400 text-3xl">Bs.</span>{stats.montoTotal}
          </div>
        </div>
      </div>
      <div className={`col-span-2 bg-neutral-900 border ${stats.totalPendientes > 0 ? 'border-orange-500/50' : 'border-neutral-800'} rounded-2xl p-4 text-center flex justify-between items-center transition-colors`}>
        <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">Fichas Pendientes/En Espera ({activeTab}):</span>
        <span className="text-2xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">{stats.totalPendientes}</span>
      </div>
    </section>
  );
}

