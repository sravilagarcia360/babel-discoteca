import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import RendicionDeCuentas from './screens/RendicionDeCuentas';

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-t-cyan-500 border-slate-300 dark:border-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Navbar Layout for authenticated user
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-300 dark:border-slate-800 p-3 flex justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest ${currentRoute === 'dashboard' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          Cajas
        </button>
        <button 
          onClick={() => setCurrentRoute('rendicion')}
          className={`flex flex-col items-center px-6 py-2 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest ${currentRoute === 'rendicion' ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
        >
          Rendición
        </button>
      </nav>
      
      <div className="pb-20">
        {currentRoute === 'dashboard' && <Dashboard user={user} />}
        {currentRoute === 'rendicion' && <RendicionDeCuentas user={user} />}
      </div>
    </div>
  );
}
