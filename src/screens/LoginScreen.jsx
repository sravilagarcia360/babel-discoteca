import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import NeonButton from '../components/ui/NeonButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError('Error al iniciar modo demo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-white font-sans overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-700/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-700/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-2xl shadow-slate-300/50 dark:shadow-black/50 backdrop-blur-md relative z-10 transition-colors">
        <div className="text-center mb-10">
          <Zap className="mx-auto text-cyan-600 dark:text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(8,145,178,0.5)]" size={48} />
          <h1 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1 drop-shadow-lg">BABEL</h1>
          <p className="text-cyan-600 dark:text-cyan-400 tracking-[0.3em] font-bold text-sm uppercase">Discoteca</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-lg" 
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-lg" 
            required 
          />
          {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
          
          <NeonButton type="submit" color="primary" className="w-full py-4 text-lg border-0" disabled={loading}>
            {loading ? 'Procesando...' : 'Ingresar'}
          </NeonButton>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-800">
          <div className="bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-500/40 p-3 rounded-xl mb-4 text-center">
            <p className="text-[11px] text-cyan-800 dark:text-cyan-300 font-medium uppercase tracking-wider leading-relaxed">
              Para <strong className="text-cyan-900 dark:text-cyan-400 font-black">vincular PC y Celular en tiempo real</strong>, asegúrate de iniciar sesión con el mismo correo y contraseña.
            </p>
          </div>
          <button 
            onClick={handleDemoLogin} 
            type="button" 
            className="w-full text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 transition-colors text-sm uppercase tracking-wider font-semibold bg-slate-200 dark:bg-slate-800 py-3 rounded-xl border border-slate-300 dark:border-slate-700"
          >
            Ingresar Modo Local (Sin Sincronización)
          </button>
        </div>
      </div>
    </div>
  );
}
