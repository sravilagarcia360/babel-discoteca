import React from 'react';
import { Check, Clock, X, LogOut, Eye, Trash2 } from 'lucide-react';

const FichaHistorialMZ = React.memo(({ ficha, activeTab, onMarcarPagado, onViewImage, onReturn, onDelete, onPonerEspera, onQuitarEspera }) => {
  return (
    <div className={`bg-slate-950 border ${ficha.enEspera ? 'border-orange-500/30' : 'border-slate-800'} p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-black/30 hover:border-slate-700 transition-colors`}>
      <div className="flex-1 w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{ficha.serie ? `${ficha.serie}-` : '#'}{ficha.numero}</span>
          {ficha.estado === 'Pendiente' ? <span className="bg-orange-500/10 text-orange-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/20">Pendiente</span> :
            ficha.estado === 'Anulada' ? <span className="bg-red-500/10 text-red-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-red-500/20">Anulada</span> :
              ficha.estado === 'Devuelta' ? <span className="bg-slate-600/20 text-slate-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-slate-600/30">Devuelta</span> :
                <span className="bg-lime-400/10 text-lime-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-lime-400/20">Pagado</span>}
          {ficha.enEspera && <span className="bg-orange-500/20 text-orange-500 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-orange-500/30">Espera</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
          {ficha.monto > 0 ? <span className={`text-lg sm:text-xl font-black ${ficha.monto === 30 ? 'text-pink-500' : 'text-cyan-400'}`}>{ficha.monto} Bs</span> : <span className="text-lg sm:text-xl font-black text-slate-500">Sin Monto</span>}
          <span className="text-slate-500 text-xs font-bold tracking-widest ml-1 sm:ml-2">{new Date(ficha.createdAt).toLocaleTimeString()} <span className="uppercase mx-1">· {ficha.metodo}</span></span>
        </div>
      </div>
      <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
        {ficha.estado !== 'Devuelta' && ficha.estado !== 'Anulada' && (
          ficha.enEspera ? (
            <button onClick={() => onQuitarEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30 transition-colors" title="Quitar de Espera"><X size={20} /></button>
          ) : (
            <button onClick={() => onPonerEspera(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-orange-500/20 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white border border-orange-500/30 transition-colors" title="Poner en Espera"><Clock size={20} /></button>
          )
        )}
        {ficha.estado === 'Pendiente' && activeTab === 'efectivo' && (
          <button onClick={() => onMarcarPagado(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-lime-500/20 text-lime-500 rounded-xl hover:bg-lime-500 hover:text-white border border-lime-500/30 transition-colors" title="Marcar como Pagado"><Check size={20} /></button>
        )}
        {ficha.comprobanteUrl && (
          <button onClick={() => onViewImage(ficha.comprobanteUrl)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white border border-purple-500/30 transition-colors" title="Ver Comprobante"><Eye size={20} /></button>
        )}
        {ficha.estado !== 'Devuelta' && ficha.estado !== 'Anulada' && (
          <button onClick={() => onReturn(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-slate-600/20 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white border border-slate-600/30 transition-colors" title="Devolver Ficha"><LogOut size={20} className="rotate-180" /></button>
        )}
        <button onClick={() => onDelete(ficha.id)} className="flex-1 sm:flex-none flex justify-center items-center p-2 sm:p-3 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white border border-red-600/30 transition-colors" title="Eliminar"><Trash2 size={20} /></button>
      </div>
    </div>
  );
});

export default FichaHistorialMZ;
