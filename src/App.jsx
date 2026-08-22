import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import RendicionDeCuentas from './screens/RendicionDeCuentas';
import { LayoutGrid, ClipboardList } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('dashboard'); // 'dashboard' or 'rendicion'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-t-cyan-500 border-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen transition-colors">
      <div className="pb-28">
        {currentRoute === 'dashboard' && <Dashboard user={user} />}
        {currentRoute === 'rendicion' && <RendicionDeCuentas user={user} />}
      </div>
      
      {/* TAB BAR APPLE-STYLE */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] glass rounded-[28px] p-2 flex gap-2 shadow-2xl border border-white/10 w-[90%] max-w-sm">
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-4 rounded-[20px] transition-all duration-300 ${
            currentRoute === 'dashboard' 
              ? 'bg-white/10 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.2)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutGrid size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Cajas</span>
        </button>
        <button 
          onClick={() => setCurrentRoute('rendicion')}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-4 rounded-[20px] transition-all duration-300 ${
            currentRoute === 'rendicion' 
              ? 'bg-white/10 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.2)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardList size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Rendición</span>
        </button>
      </nav>
    </div>
  );
}
