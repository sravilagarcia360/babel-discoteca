import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function StatsGrid({ stats, activeTab, isCensored, setIsCensored }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 w-full">
        {Object.keys(stats.breakdown || {}).length > 0 ? (
          Object.entries(stats.breakdown).map(([monto, cantidad]) => (
            <div key={monto} className="flex-1 min-w-[120px] bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 text-center shadow-md shadow-slate-300/50 dark:shadow-black/20 transition-colors">
              <p className="text-slate-600 dark:text-cyan-400 font-bold text-sm uppercase tracking-wider">Total {monto} Bs ({activeTab})</p>
              <p className="text-4xl font-black mt-2 text-slate-800 dark:text-white">{cantidad}</p>
            </div>
          ))
        ) : (
          <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 text-center shadow-md shadow-slate-300/50 dark:shadow-black/20 transition-colors">
            <p className="text-slate-600 dark:text-cyan-400 font-bold text-sm uppercase tracking-wider">Sin Ventas ({activeTab})</p>
            <p className="text-4xl font-black mt-2 text-slate-800 dark:text-white">0</p>
          </div>
        )}
      </div>
      <div className="w-full relative p-[2px] rounded-3xl overflow-hidden shadow-lg shadow-slate-300/50 dark:shadow-black/20 group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-500 dark:from-cyan-600 dark:to-blue-700"></div>
        <div className="relative bg-white dark:bg-slate-950 rounded-[22px] p-6 text-center h-full transition-colors">
          <div className="flex justify-center items-center gap-2 mb-1">
            <p className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Recaudado Confirmado ({activeTab})</p>
            <button onClick={() => setIsCensored(!isCensored)} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors">
              {isCensored ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="text-5xl font-black text-slate-900 dark:text-white flex justify-center items-center gap-2">
            <span className="text-slate-400 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400 text-3xl">Bs.</span>
            {isCensored ? '●●●●' : stats.montoTotal}
          </div>
        </div>
      </div>
      <div className={`w-full bg-white dark:bg-slate-900 border ${stats.totalPendientes > 0 ? 'border-orange-400 dark:border-orange-500/50' : 'border-slate-300 dark:border-slate-800'} rounded-2xl p-4 text-center flex justify-between items-center transition-colors shadow-sm`}>
        <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">Fichas Pendientes/En Espera ({activeTab}):</span>
        <span className="text-2xl font-black text-orange-500">{stats.totalPendientes}</span>
      </div>
    </section>
  );
}
