import React from 'react';

export function StatsGrid({ stats, activeTab }) {
  return (
    <section className="grid grid-cols-2 gap-4">
     e <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-pink-500 font-bold text-sm uppercase">Total 30 Bs ({activeTab})</p>
        <p className="text-4xl font-black mt-2">{stats.total30}</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-lg shadow-black/20">
        <p className="text-cyan-400 font-bold text-sm uppercase">Total 40 Bs ({activeTab})</p>
        <p className="text-4xl font-black mt-2">{stats.total40}</p>
      </div>
      <div className="col-span-2 relative p-[2px] rounded-3xl overflow-hidden shadow-xl shadow-black/20 group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-lime-500 via-cyan-500 to-purple-600 animate-rainbow"></div>
        <div className="relative bg-slate-950 rounded-[22px] p-6 text-center h-full">
          <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-1">Recaudado Confirmado ({activeTab})</p>
          <div className="text-5xl font-black text-white flex justify-center items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400 text-3xl">Bs.</span>{stats.montoTotal}
          </div>
        </div>
      </div>
      <div className={`col-span-2 bg-slate-900 border ${stats.totalPendientes > 0 ? 'border-orange-500/50' : 'border-slate-800'} rounded-2xl p-4 text-center flex justify-between items-center transition-colors`}>
        <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">Fichas Pendientes/En Espera ({activeTab}):</span>
        <span className="text-2xl font-black text-orange-500">{stats.totalPendientes}</span>
      </div>
    </section>
  );
}