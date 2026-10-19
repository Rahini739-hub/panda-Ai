import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Clock,
  Bell,
  Volume2,
  ShieldAlert,
  ArrowLeft,
  Check,
  AlertTriangle,
  Sparkles,
  Info,
  Power,
  RotateCcw,
} from 'lucide-react';
import { SleepAlarmSettings, PandaProfile, AppSettings } from '../types';
import { playSound } from '../utils/audio';

interface SleepAlarmScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  onUpdatePanda: (updater: (prev: PandaProfile) => PandaProfile) => void;
  onUpdateSleepSettings: (updater: (prev: SleepAlarmSettings) => SleepAlarmSettings) => void;
  onBack: () => void;
}

export const SleepAlarmScreen: React.FC<SleepAlarmScreenProps> = ({
  panda,
  settings,
  onUpdatePanda,
  onUpdateSleepSettings,
  onBack,
}) => {
  const sleep = settings.sleep;
  const [saveToast, setSaveToast] = useState(false);

  const handleToggleSleepMode = () => {
    const nextState = !sleep.sleepModeActive;
    playSound(nextState ? 'lullaby' : 'squeak', settings.soundVolume, settings.soundEnabled);

    onUpdateSleepSettings((prev) => ({
      ...prev,
      sleepModeActive: nextState,
      emergencyOverrideActive: false,
    }));

    onUpdatePanda((p) => ({
      ...p,
      currentAnimation: nextState ? 'sleeping' : 'waving',
      speechText: nextState
        ? `Night time! Time for sweet bamboo dreams... Zzz 🌙`
        : `Good morning! Ready to shine and conquer the day! ☀️`,
      currentMood: nextState ? 'sleepy' : 'happy',
    }));
  };

  const handleTestAlarm = () => {
    playSound('zen_bell', settings.soundVolume, settings.soundEnabled);
  };

  const notifySaved = () => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sleep & Alarm Sanctuary</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized bedtime wind-down, wake-up alarms, and gentle sleep routines with {panda.name}.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sanctuary</span>
        </button>
      </div>

      {saveToast && (
        <div className="mb-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Sleep settings saved successfully!</span>
        </div>
      )}

      {/* Sleep Mode Active Banner */}
      <div
        className={`p-5 rounded-3xl border mb-6 transition-all ${
          sleep.sleepModeActive
            ? 'bg-purple-950/70 border-purple-400 shadow-2xl shadow-purple-950/70'
            : 'bg-[#120f26] border-purple-500/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-3xl shrink-0">
              {sleep.sleepModeActive ? '🌙' : '⏰'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Companion Sleep Mode
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sleep.sleepModeActive ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sleep.sleepModeActive ? 'Active Now' : 'Standby'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {sleep.sleepModeActive ? 'Night Rest In Progress' : 'Routine Scheduled'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Bedtime: <span className="text-purple-200 font-semibold">{sleep.bedtime}</span> · Wake Up: <span className="text-purple-200 font-semibold">{sleep.wakeTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sleep.sleepModeActive && (
              <button
                onClick={() =>
                  onUpdateSleepSettings((prev) => ({
                    ...prev,
                    emergencyOverrideActive: !prev.emergencyOverrideActive,
                  }))
                }
                className="px-3.5 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{sleep.emergencyOverrideActive ? 'Override Active' : 'Emergency Override'}</span>
              </button>
            )}

            <button
              onClick={handleToggleSleepMode}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2 ${
                sleep.sleepModeActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/40'
              }`}
            >
              <span>{sleep.sleepModeActive ? '☀️ Wake Up' : '🌙 Start Sleep Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Regular Schedule Settings */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Weekday Sleep Schedule
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                Bedtime
              </label>
              <input
                type="time"
                value={sleep.bedtime}
                onChange={(e) => {
                  onUpdateSleepSettings((s) => ({ ...s, bedtime: e.target.value }));
                  notifySaved();
                }}
                className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                Wake-Up Time
              </label>
              <input
                type="time"
                value={sleep.wakeTime}
                onChange={(e) => {
                  onUpdateSleepSettings((s) => ({ ...s, wakeTime: e.target.value }));
                  notifySaved();
                }}
                className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Wind-down alert minutes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Wind-Down Reminder: {sleep.windDownMinutes} mins before
              </label>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={sleep.windDownMinutes}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSleepSettings((s) => ({ ...s, windDownMinutes: val }));
                notifySaved();
              }}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Weekend sleep differentiation */}
          <div className="pt-2 border-t border-purple-900/30">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-bold text-white">Different Weekend Schedule</div>
                <div className="text-[11px] text-slate-400">Set custom sleep times for Sat & Sun</div>
              </div>
              <input
                type="checkbox"
                checked={sleep.differentWeekendSchedule}
                onChange={(e) => {
                  onUpdateSleepSettings((s) => ({ ...s, differentWeekendSchedule: e.target.checked }));
                  notifySaved();
                }}
                className="accent-purple-600"
              />
            </label>

            {sleep.differentWeekendSchedule && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 uppercase mb-1">
                    Weekend Bedtime
                  </label>
                  <input
                    type="time"
                    value={sleep.weekendBedtime}
                    onChange={(e) => {
                      onUpdateSleepSettings((s) => ({ ...s, weekendBedtime: e.target.value }));
                      notifySaved();
                    }}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 uppercase mb-1">
                    Weekend Wake Time
                  </label>
                  <input
                    type="time"
                    value={sleep.weekendWakeTime}
                    onChange={(e) => {
                      onUpdateSleepSettings((s) => ({ ...s, weekendWakeTime: e.target.value }));
                      notifySaved();
                    }}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alarm & Restriction Customization */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Alarm & Sleep Restrictions
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/30">
              <div>
                <div className="text-xs font-bold text-white">Wake-Up Alarm Sound</div>
                <div className="text-[11px] text-slate-400">Gentle Tibetan singing bowl chime</div>
              </div>
              <button
                onClick={handleTestAlarm}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Test Sound 🔔
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-purple-900/30">
              <div>
                <div className="text-xs font-bold text-white">Snooze Duration</div>
                <div className="text-[11px] text-slate-400">How long snooze pauses the alarm</div>
              </div>
              <select
                value={sleep.snoozeDurationMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateSleepSettings((s) => ({ ...s, snoozeDurationMinutes: val }));
                  notifySaved();
                }}
                className="bg-[#181434] border border-purple-900/50 rounded-lg px-2.5 py-1 text-white text-xs"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                Custom Sleep Restriction Message
              </label>
              <textarea
                rows={2}
                value={sleep.customRestrictionMessage}
                onChange={(e) => {
                  onUpdateSleepSettings((s) => ({ ...s, customRestrictionMessage: e.target.value }));
                }}
                onBlur={notifySaved}
                placeholder="e.g. Put your phone away and rest your eyes! BaoBao is sleeping."
                className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Honest Platform Capabilities & Limitations Box (Required by prompt Section 5) */}
      <div className="bg-[#14112e] border border-indigo-500/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="font-bold text-white text-sm">
              Platform Permissions & Restriction Limits (Honest Policy)
            </h4>
            <p>
              • <strong className="text-purple-200">Web / PWA Version:</strong> Web browsers run inside secure sandboxes. A website cannot force-lock your entire phone or terminate other native applications. PandaBuddy provides gentle sleep mode overlays, bedtime alerts, and web notifications when the tab or PWA is open.
            </p>
            <p>
              • <strong className="text-purple-200">Android Companion App:</strong> For system-wide app locking or hard screen-time cutoffs on Android, a dedicated native companion using Android's <code>AccessibilityService</code> and <code>UsageStatsManager</code> permissions is required.
            </p>
            <p>
              • <strong className="text-purple-200">iOS Screen Time:</strong> Apple restricts third-party app termination. iOS enforces app limits through Apple's official Screen Time API and Family Controls entitlements.
            </p>
            <p>
              • <strong className="text-purple-200">Windows Desktop Companion:</strong> A local companion script using Windows foreground APIs can monitor distracting desktop windows during study sessions, but will never silently close unsaved work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
