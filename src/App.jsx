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
      <div className="pb-36">
        {currentRoute === 'dashboard' && <Dashboard user={user} />}
        {currentRoute === 'rendicion' && <RendicionDeCuentas user={user} />}
      </div>
      
      {/* TAB BAR APPLE-STYLE FULL WIDTH */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex justify-around pb-safe">
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-300 ${
            currentRoute === 'dashboard' 
              ? 'text-cyan-400' 
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <LayoutGrid size={24} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Cajas</span>
        </button>
        <button 
          onClick={() => setCurrentRoute('rendicion')}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-300 ${
            currentRoute === 'rendicion' 
              ? 'text-cyan-400' 
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <ClipboardList size={24} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Rendición</span>
        </button>
      </nav>
    </div>
  );
}
