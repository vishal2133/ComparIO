'use client';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 ${
        isDark
          ? 'bg-blue-600/20 border-blue-500/30'
          : 'bg-amber-100 border-amber-300'
      } ${className}`}
    >
      <span className="absolute left-1.5 text-xs">🌙</span>
      <span className="absolute right-1.5 text-xs">☀️</span>

      <div
        className={`absolute w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
          isDark
            ? 'translate-x-0 bg-blue-500'
            : 'translate-x-7 bg-amber-400'
        }`}
      />
    </button>
  );
}