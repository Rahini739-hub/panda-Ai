import React from 'react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Zap,
  Info,
  ArrowLeft,
  ShieldAlert,
  Sliders,
  Check,
} from 'lucide-react';
import { DeviceBatteryState, BatterySettings, PandaProfile, AppSettings } from '../types';
import { playSound } from '../utils/audio';

interface BatteryAssistantScreenProps {
  panda: PandaProfile;
  batteryState: DeviceBatteryState;
  batterySettings: BatterySettings;
  settings: AppSettings;
  onUpdateBatterySettings: (updater: (prev: BatterySettings) => BatterySettings) => void;
  onBack: () => void;
}

export const BatteryAssistantScreen: React.FC<BatteryAssistantScreenProps> = ({
  panda,
  batteryState,
  batterySettings,
  settings,
  onUpdateBatterySettings,
  onBack,
}) => {
  const isLow = batteryState.supported && batteryState.level <= batterySettings.lowBatteryThreshold && !batteryState.charging;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Battery & Charging Assistant</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real device hardware battery monitoring and smart power reminders with {panda.name}.
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

      {/* Main Battery Status Card */}
      <div className="bg-[#120f26] border border-purple-500/25 rounded-3xl p-6 shadow-2xl mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div
              className={`w-18 h-18 rounded-3xl flex items-center justify-center text-4xl shadow-xl ${
                !batteryState.supported
                  ? 'bg-slate-800/80 text-slate-400'
                  : batteryState.charging
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                  : isLow
                  ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              }`}
            >
              {batteryState.charging ? (
                <BatteryCharging className="w-9 h-9" />
              ) : isLow ? (
                <BatteryWarning className="w-9 h-9" />
              ) : (
                <Battery className="w-9 h-9" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Hardware Battery Status
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    !batteryState.supported
                      ? 'bg-slate-800 text-slate-400'
                      : batteryState.charging
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}
                >
                  {batteryState.supported ? (batteryState.charging ? 'Charging' : 'Discharging') : 'API Unavailable'}
                </span>
              </div>

              <div className="text-3xl font-extrabold text-white mt-1 tabular-nums font-display">
                {batteryState.supported ? `${batteryState.level}%` : 'Unavailable in Browser'}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {batteryState.supported
                  ? batteryState.charging
                    ? 'Device is plugged into AC power. Panda is calm and happy!'
                    : isLow
                    ? '⚠️ Low battery level! Connect a charger soon to avoid interruption.'
                    : `Running on battery power. Alert set at ${batterySettings.lowBatteryThreshold}%.`
                  : 'Your current browser does not expose the Battery Status API. Fabricated readings are never shown.'}
              </div>
            </div>
          </div>

          {/* Virtual Pet Energy distinction */}
          <div className="bg-[#181434] border border-purple-900/40 rounded-2xl p-4 sm:w-60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Pet Virtual Energy</span>
              </span>
              <span className="font-bold text-white tabular-nums">{panda.stats.energy}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${panda.stats.energy}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
              Separate from your laptop/phone battery. Recharges when {panda.name} rests or sleeps!
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Slider and Settings */}
      <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Low Battery Alert Preferences
          </h3>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">Alert Threshold:</span>
            <span className="font-bold text-purple-200 tabular-nums">
              Warn me at {batterySettings.lowBatteryThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="35"
            step="5"
            value={batterySettings.lowBatteryThreshold}
            onChange={(e) => {
              const val = Number(e.target.value);
              playSound('pop', settings.soundVolume, settings.soundEnabled);
              onUpdateBatterySettings((s) => ({ ...s, lowBatteryThreshold: val }));
            }}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>10% (Critical)</span>
            <span>20% (Recommended)</span>
            <span>35% (Early)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
          <div>
            <div className="text-xs font-bold text-white">Low Battery Panda Notifications</div>
            <div className="text-[11px] text-slate-400">
              {panda.name} will speak up and trigger a warning when unplugged and low
            </div>
          </div>
          <input
            type="checkbox"
            checked={batterySettings.notificationsEnabled}
            onChange={(e) => {
              playSound('pop', settings.soundVolume, settings.soundEnabled);
              onUpdateBatterySettings((s) => ({ ...s, notificationsEnabled: e.target.checked }));
            }}
            className="accent-purple-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Device Policy & Privacy Explanation */}
      <div className="bg-[#14112e] border border-indigo-500/30 rounded-3xl p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="font-bold text-white text-sm">
              Battery Information Privacy & Browser Policy
            </h4>
            <p>
              • <strong>Supported Browsers:</strong> Google Chrome, Microsoft Edge, Opera, and Chrome for Android support the W3C <code>navigator.getBattery()</code> standard.
            </p>
            <p>
              • <strong>Unsupported Browsers:</strong> Apple Safari and Mozilla Firefox intentionally removed battery APIs to prevent device fingerprinting. When unavailable, PandaBuddy never fabricates artificial readings.
            </p>
            <p>
              • <strong>Windows & Native Companions:</strong> For Windows laptops, native background helpers can read detailed battery cycle counts, power profiles, and charging wattage directly from Windows ACPI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
