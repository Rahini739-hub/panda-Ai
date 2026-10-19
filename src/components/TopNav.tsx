import React from 'react';
import { ActiveScreen } from '../types';

interface TopNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onQuickFeed: () => void;
  petName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeScreen,
  onNavigate,
  onQuickFeed,
}) => {
  return (
    <header className="w-full bg-[#0d0b1d]/80 backdrop-blur-md border-b border-purple-900/30 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('room')}
          className="text-lg font-bold tracking-tight text-white hover:text-purple-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-sm shadow-md shadow-purple-900/30">
            🐾
          </span>
          <span>PandaBuddy AI</span>
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('room')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'room' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => onNavigate('interact')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'interact' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Playroom
          </button>
          <button
            onClick={() => onNavigate('focus')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'focus' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Focus Zen
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'schedule' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => onNavigate('customize')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'customize' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onNavigate('adopt')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'adopt' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Adopt
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'chat' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'progress' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeScreen === 'settings' ? 'text-purple-300 font-semibold underline underline-offset-8 decoration-purple-400 decoration-2' : ''
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickFeed}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 shadow-md shadow-purple-900/30 active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎋</span>
            <span>Feed Bamboo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
