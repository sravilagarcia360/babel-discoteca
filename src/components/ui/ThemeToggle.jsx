import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-[72px] h-9 rounded-full overflow-hidden transition-colors duration-500 shadow-inner shrink-0 ${
        isDark ? 'bg-slate-900 border border-slate-800' : 'bg-pink-300 border border-pink-400'
      }`}
      aria-label="Toggle theme"
    >
      {/* Background container for the landscape */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dark Mode Landscape */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D2A54] to-[#16152B]" />
          {/* Moon */}
          <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          {/* Stars */}
          <div className="absolute top-2.5 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-60" />
          <div className="absolute top-4 left-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
          <div className="absolute top-1 right-1/3 w-[1px] h-[1px] bg-white rounded-full opacity-50" />
          {/* Mountains */}
          <div className="absolute -bottom-1 -left-2 w-10 h-6 bg-[#3B3468] rounded-full blur-[1px]" />
          <div className="absolute -bottom-2 right-0 w-14 h-8 bg-[#241F42] rounded-full blur-[1px]" />
        </div>

        {/* Light Mode Landscape */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB7B2] to-[#FF9A9E]" />
          {/* Sun / Clouds (simplified) */}
          <div className="absolute top-1.5 left-2 w-3 h-3 bg-white/80 rounded-full blur-sm" />
          <div className="absolute top-2.5 left-5 w-4 h-2.5 bg-white/80 rounded-full blur-sm" />
          {/* Mountains */}
          <div className="absolute -bottom-1 -left-2 w-10 h-6 bg-[#E96A74] rounded-full blur-[1px]" />
          <div className="absolute -bottom-2 right-0 w-14 h-8 bg-[#C44D56] rounded-full blur-[1px]" />
        </div>
      </div>

      {/* Thumb / Toggle Knob */}
      <div
        className={`absolute top-[1px] left-[1px] w-8 h-8 rounded-full bg-[#111] shadow-[0_0_10px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-in-out z-10 ${
          isDark ? 'translate-x-0' : 'translate-x-[36px]'
        }`}
      />
    </button>
  );
}
