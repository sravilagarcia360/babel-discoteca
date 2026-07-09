import React from 'react';

export default function NeonButton({ children, color = 'cyan', onClick, className = '', disabled = false, icon: Icon, type = "button" }) {
  const colorClasses = {
    red: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-slate-900',
    orange: 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-600 dark:hover:text-slate-900',
    yellow: 'border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-slate-900 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-500 dark:hover:text-slate-900',
    green: 'border-lime-500 text-lime-600 hover:bg-lime-500 hover:text-slate-900 dark:border-lime-500 dark:text-lime-400 dark:hover:bg-lime-600 dark:hover:text-slate-900',
    cyan: 'border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-slate-900 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-500 dark:hover:text-slate-900',
    blue: 'border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white',
    purple: 'border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white',
    pink: 'border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-600 dark:hover:text-white',
    primary: 'border-slate-800 bg-slate-800 text-white hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-slate-300/50 dark:shadow-black/40 ${colorClasses[color]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
