import React from 'react';
import { Check, Clock, X, LogOut, Camera } from 'lucide-react';

const FichaQRMZ = React.memo(({ ficha, isSelected, onToggle, onQuitarEspera, onPonerEspera, onReturn, onPhoto }) => {
  return (
    <div onClick={() => onToggle(ficha.id)} className={`bg-slate-950 border cursor-pointer transition-all shadow-lg ${isSelected ? 'border-cyan-500 shadow-cyan-500/10 scale-[1.01]' : ficha.enEspera ? 'border-orange-500/50 shadow-orange-500/10' : 'border-slate-800 shadow-black/20'} p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
          {isSelected && <Check size={14} className="text-slate-900" strokeWidth={4} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
            <span className="bg-purple-600/20 text-purple-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-purple-600/30 whitespace-nowrap">QR Pendiente</span>
            {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30 whitespace-nowrap">En Espera</span>}
          </div>
          <p className={`text-lg sm:text-xl font-black mt-0.5 sm:mt-1 ${ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}`}>{ficha.monto} Bs</p>
        </div>
      </div>
      <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto pl-9 sm:pl-0 mt-1 sm:mt-0" onClick={(e) => e.stopPropagation()}>
        {ficha.enEspera ? (
          <button onClick={() => onQuitarEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30" title="Quitar de Espera"><X size={20} /></button>
        ) : (
          <button onClick={() => onPonerEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white border border-orange-500/30" title="Poner en Espera"><Clock size={20} /></button>
        )}
        <button onClick={() => onReturn(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30" title="Devolver Ficha"><LogOut size={18} className="rotate-180" /></button>
        <button onClick={() => onPhoto(ficha.id)} className="flex-[2] sm:flex-none flex justify-center items-center px-3 sm:px-4 py-2 sm:py-3 bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold uppercase tracking-wider rounded-xl transition-all gap-1 sm:gap-2 text-[10px] sm:text-sm shadow-lg shadow-lime-500/20 whitespace-nowrap"><Camera size={16} /> Foto</button>
      </div>
    </div>
  );
});

export default FichaQRMZ;
