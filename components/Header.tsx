
import React from 'react';
import MenuIcon from './icons/MenuIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';

interface HeaderProps {
    onMenuClick: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, theme, onToggleTheme }) => {
  return (
    <header className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <MenuIcon />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.598 15.25 15.25 0 01-1.358-1.428 15.25 15.25 0 01-1.358 1.428 15.247 15.247 0 01-1.383.598l-.022.012-.007.003h-.001a.75.75 0 01.002 0l-.002.001a.75.75 0 010 1.498l.003-.001.006-.003.021-.012a16.75 16.75 0 001.52- .67 16.75 16.75 0 001.5-1.583 16.75 16.75 0 001.5 1.583 16.75 16.75 0 001.52.67l.021.012.006.003.003.001a.75.75 0 010-1.498l-.002-.001h-.001zM12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 S0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75z" />
              </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">AI Bot</h1>
        </div>
      </div>
       <button 
        onClick={onToggleTheme}
        className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </header>
  );
};

export default Header;