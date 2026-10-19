import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2, ArrowLeft, Headphones, Shield, ShieldAlert, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PandaProfile, AppSettings } from '../types';
import { playSound, playAmbient, stopAmbient } from '../utils/audio';

interface FocusModeScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  initialTaskTitle?: string | null;
  onUpdatePanda: (updater: (prev: PandaProfile) => PandaProfile) => void;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onBack: () => void;
}

export const FocusModeScreen: React.FC<FocusModeScreenProps> = ({
  panda,
  settings,
  initialTaskTitle,
  onUpdatePanda,
  onUpdateSettings,
  onBack,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [sessionTaskName, setSessionTaskName] = useState(initialTaskTitle || 'Python Practice');
  const [tabSwitchesCount, setTabSwitchesCount] = useState(0);
  const [distractionNotice, setDistractionNotice] = useState<string | null>(null);

  // Sync timer when preset duration changes
  const selectDuration = (mins: number, isBreak = false) => {
    setIsRunning(false);
    setIsBreakMode(isBreak);
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
    playSound('pop', settings.soundVolume, settings.soundEnabled);
  };

  // Browser-legitimate tab-switching distraction detection during active focus
  useEffect(() => {
    if (!isRunning || !settings.distraction.warnOnTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchesCount((c) => c + 1);
      } else if (document.visibilityState === 'visible') {
        playSound('squeak', settings.soundVolume, settings.soundEnabled);
        setDistractionNotice(`${panda.name} noticed you switched tabs! Let's stay immersed in ${sessionTaskName}! 🐾`);
        setTimeout(() => setDistractionNotice(null), 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, settings.distraction.warnOnTabSwitch, sessionTaskName, panda.name, settings.soundVolume, settings.soundEnabled]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      // Session complete!
      setIsRunning(false);
      stopAmbient();
      playSound('zen_bell', settings.soundVolume, settings.soundEnabled);

      if (!isBreakMode) {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5 },
        });

        onUpdatePanda((p) => ({
          ...p,
          focusMinutesTotal: p.focusMinutesTotal + durationMinutes,
          currentAnimation: 'celebrating',
          speechText: `Great work on ${sessionTaskName}! ${durationMinutes} minutes accomplished. Time for a well-deserved break!`,
          stats: {
            ...p.stats,
            friendshipExp: p.stats.friendshipExp + durationMinutes * 2,
            happiness: Math.min(100, p.stats.happiness + 15),
          },
        }));

        // Suggest a 5-minute break
        setIsBreakMode(true);
        setDurationMinutes(5);
        setSecondsRemaining(5 * 60);
      } else {
        // Break complete
        onUpdatePanda((p) => ({
          ...p,
          currentAnimation: 'waving',
          speechText: "Break is over! Ready for the next focused quest?",
          stats: {
            ...p.stats,
            energy: Math.min(100, p.stats.energy + 20),
          },
        }));
        setIsBreakMode(false);
        setDurationMinutes(25);
        setSecondsRemaining(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, durationMinutes, isBreakMode, sessionTaskName]);

  // Handle Play/Pause
  const togglePlay = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      playSound('pop', settings.soundVolume, settings.soundEnabled);
      playAmbient(settings.ambientSound, settings.soundVolume, settings.soundEnabled);
      onUpdatePanda((p) => ({
        ...p,
        currentAnimation: isBreakMode ? 'happy_bouncing' : 'studying',
        speechText: isBreakMode
          ? `Enjoying a cozy break! Stretch and breathe!`
          : `${p.name} is focusing on ${sessionTaskName} with you. Let's do this!`,
      }));
    } else {
      stopAmbient();
      onUpdatePanda((p) => ({
        ...p,
        currentAnimation: 'idle',
        speechText: 'Pausing our focus session...',
      }));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    stopAmbient();
    setSecondsRemaining(durationMinutes * 60);
    playSound('pop', settings.soundVolume, settings.soundEnabled);
  };

  const changeAmbient = (type: AppSettings['ambientSound']) => {
    onUpdateSettings((s) => ({ ...s, ambientSound: type }));
    if (isRunning) {
      playAmbient(type, settings.soundVolume, settings.soundEnabled);
    }
  };

  // Format time MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isBreakMode ? 'Cozy Sanctuary Break' : 'Zen Focus Sanctuary'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Focus blocks, study timers, and browser distraction monitoring with {panda.name}.
          </p>
        </div>
        <button
          onClick={() => {
            stopAmbient();
            onBack();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Focus</span>
        </button>
      </div>

      {/* Distraction Alert Banner */}
      {distractionNotice && (
        <div className="w-full max-w-md mb-4 bg-purple-900/50 border border-purple-400 rounded-2xl p-3 flex items-center gap-3 text-xs text-purple-200 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-purple-300 shrink-0" />
          <span>{distractionNotice}</span>
        </div>
      )}

      {/* Target Task Label & Preset Durations */}
      <div className="w-full max-w-md mb-6 flex flex-col items-center gap-3">
        <div className="w-full flex items-center gap-2 bg-[#120f26] border border-purple-900/40 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <span className="text-purple-300 font-semibold uppercase text-[10px]">Session Goal:</span>
          <input
            type="text"
            value={sessionTaskName}
            onChange={(e) => setSessionTaskName(e.target.value)}
            placeholder="e.g. Python practice, Essay, English study"
            className="flex-1 bg-transparent text-white focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#130f28] border border-purple-900/40 rounded-2xl">
          {[
            { label: 'Deep Focus', mins: 25, isBreak: false },
            { label: 'Flow State', mins: 50, isBreak: false },
            { label: 'Quick Sprint', mins: 15, isBreak: false },
            { label: 'Tea Break', mins: 5, isBreak: true },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => selectDuration(item.mins, item.isBreak)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                durationMinutes === item.mins && isBreakMode === item.isBreak
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label} ({item.mins}m)
            </button>
          ))}
        </div>
      </div>

      {/* Circular SVG Timer */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
        <div
          className={`absolute inset-4 rounded-full blur-2xl transition-all duration-700 ${
            isRunning ? (isBreakMode ? 'bg-emerald-600/20 scale-105' : 'bg-purple-600/20 scale-105') : 'bg-purple-900/10'
          }`}
        />

        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="110"
            fill="transparent"
            stroke="rgba(49, 46, 129, 0.3)"
            strokeWidth="10"
          />
          <circle
            cx="130"
            cy="130"
            r="110"
            fill="transparent"
            stroke={isBreakMode ? '#34d399' : 'url(#purpleGradient)'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-tight font-display">
            {timeFormatted}
          </span>
          <span className="text-xs font-medium text-purple-300 mt-1 flex items-center gap-1">
            <span>{isBreakMode ? '🍵' : '🐾'}</span>
            <span>
              {isRunning
                ? isBreakMode
                  ? 'Recharging energy...'
                  : `${panda.name} is studying`
                : 'Ready when you are'}
            </span>
          </span>
        </div>
      </div>

      {/* Play / Pause / Reset Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className={`h-14 px-8 rounded-2xl text-white font-bold text-base transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer ${
            isBreakMode
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/40'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause {isBreakMode ? 'Break' : 'Focus'}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start {isBreakMode ? 'Break' : 'Session'}</span>
            </>
          )}
        </button>
      </div>

      {/* Distraction Shield & Ambient Soundscapes */}
      <div className="w-full max-w-md space-y-3">
        {/* Distraction Shield status */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-purple-300" />
            <div>
              <div className="text-xs font-bold text-white">Browser Study Protection</div>
              <div className="text-[10px] text-slate-400">
                Warns when switching tabs away during active study ({tabSwitchesCount} detected)
              </div>
            </div>
          </div>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.distraction.warnOnTabSwitch}
              onChange={(e) =>
                onUpdateSettings((s) => ({
                  ...s,
                  distraction: { ...s.distraction, warnOnTabSwitch: e.target.checked },
                }))
              }
              className="accent-purple-600"
            />
          </label>
        </div>

        {/* Ambient Soundscape selector */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Procedural Soundscape
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'bamboo_rain', label: 'Rain Forest', icon: '🌧️' },
              { id: 'crickets', label: 'Twilight', icon: '🦗' },
              { id: 'temple_bell', label: 'Singing Bowl', icon: '🔔' },
              { id: 'none', label: 'Silence', icon: '🤫' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => changeAmbient(item.id as AppSettings['ambientSound'])}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center ${
                  settings.ambientSound === item.id
                    ? 'bg-purple-900/40 border-purple-400 text-white'
                    : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium mt-1 truncate max-w-full">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
