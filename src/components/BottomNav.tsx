import React from 'react';
import { Home, Sparkles, Timer, Calendar, MessageSquare, Award, Settings, Palette, PawPrint } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const tabs = [
    { id: 'room' as ActiveScreen, label: 'My Pet', icon: Home },
    { id: 'customize' as ActiveScreen, label: 'Studio', icon: Palette },
    { id: 'adopt' as ActiveScreen, label: 'Adopt', icon: PawPrint },
    { id: 'interact' as ActiveScreen, label: 'Play', icon: Sparkles },
    { id: 'focus' as ActiveScreen, label: 'Focus', icon: Timer },
    { id: 'schedule' as ActiveScreen, label: 'Schedule', icon: Calendar },
    { id: 'chat' as ActiveScreen, label: 'Chat', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0b1d]/95 backdrop-blur-xl border-t border-purple-900/40 pb-safe">
      <div className="grid grid-cols-7 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors relative ${
                isActive ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-300' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-[48px] ${
                isActive ? 'text-purple-200 font-semibold' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
