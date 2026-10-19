import React, { useState } from 'react';
import { Sparkles, Check, Heart, Shield, Compass, BookOpen, Moon, Flame } from 'lucide-react';
import { PandaPersonality, PandaProfile } from '../types';
import { playSound } from '../utils/audio';

interface OnboardingModalProps {
  onComplete: (name: string, personality: PandaPersonality) => void;
  soundEnabled: boolean;
  soundVolume: number;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  soundEnabled,
  soundVolume,
}) => {
  const [name, setName] = useState('BaoBao');
  const [personality, setPersonality] = useState<PandaPersonality>('playful_adventurer');
  const [step, setStep] = useState<1 | 2>(1);

  const personalities: { id: PandaPersonality; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'playful_adventurer',
      title: 'Playful Adventurer',
      subtitle: 'Brimming with high spirits, playful hops, and lively cheerful banter',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'zen_scholar',
      title: 'Zen Scholar',
      subtitle: 'Peaceful, disciplined, and calm. Perfect partner for deep work & study',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'cozy_dreamer',
      title: 'Cozy Dreamer',
      subtitle: 'Gentle soul fond of soft naps, warm tea, and calming affirmations',
      icon: <Moon className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'cheerful_motivator',
      title: 'Cheerful Motivator',
      subtitle: 'Your personal hype buddy celebrating every task and daily milestone',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
    },
  ];

  const handleNext = () => {
    playSound('pop', soundVolume, soundEnabled);
    if (step === 1) {
      setStep(2);
    } else {
      playSound('victory', soundVolume, soundEnabled);
      onComplete(name.trim() || 'BaoBao', personality);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#110e24] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-900/40">
            🐾
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to PandaBuddy AI
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Your animated, emotionally intelligent 3D companion for focus, wellness, and joy.
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
                Name Your Companion
              </label>
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BaoBao, Mochi, Zen..."
                className="w-full bg-[#181434] border border-purple-900/50 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-medium text-base"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                You can change your companion's name at any time in Settings.
              </p>
            </div>

            <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-purple-300" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-purple-200">The Companion Bond:</span> BaoBao responds to clicks, feeds, petting, and study sessions with real-time 3D animations and expressive emotions.
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Personality</span>
              <span>→</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">
                Select Personality Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {personalities.map((item) => {
                  const isSelected = personality === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playSound('pop', soundVolume, soundEnabled);
                        setPersonality(item.id);
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-900/30 border-purple-400 shadow-md shadow-purple-950/50'
                          : 'bg-[#181434]/60 border-purple-950/40 hover:border-purple-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-950/80 flex items-center justify-center">
                          {item.icon}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 h-12 rounded-2xl border border-purple-900/50 text-slate-300 hover:text-white hover:bg-purple-950/30 font-medium text-xs transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="w-2/3 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Adventure!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
