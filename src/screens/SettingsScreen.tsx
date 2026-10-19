import React, { useState } from 'react';
import { Settings as SettingsIcon, Volume2, VolumeX, Eye, Sparkles, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { PandaProfile, AppSettings, PandaPersonality, PandaAccessories } from '../types';
import { playSound } from '../utils/audio';

interface SettingsScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  onUpdatePanda: (updater: (prev: PandaProfile) => PandaProfile) => void;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onRestartTour: () => void;
  onExportData: () => void;
  onResetData: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  panda,
  settings,
  onUpdatePanda,
  onUpdateSettings,
  onRestartTour,
  onExportData,
  onResetData,
  onBack,
}) => {
  const [nameInput, setNameInput] = useState(panda.name);
  const [savedNameNotice, setSavedNameNotice] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onUpdatePanda((p) => ({
      ...p,
      name: nameInput.trim(),
      speechText: `I like my name: ${nameInput.trim()}!`,
    }));
    setSavedNameNotice(true);
    setTimeout(() => setSavedNameNotice(false), 2000);
  };

  const toggleAccessory = (key: keyof PandaAccessories) => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onUpdatePanda((p) => {
      const nextAcc = { ...p.accessories, [key]: !p.accessories[key] };
      return {
        ...p,
        accessories: nextAcc,
        speechText: `How do I look with my new style? ✨`,
        currentAnimation: 'happy_bouncing',
      };
    });
  };

  const selectPersonality = (personality: PandaPersonality) => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onUpdatePanda((p) => ({
      ...p,
      personality,
      speechText: `Personality updated! Let's embrace this journey together!`,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings & Personalization</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize {panda.name}'s look, personality, audio ambiance, and display preferences.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Room</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Companion Identity & Rename */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Companion Name
          </h3>
          <form onSubmit={handleSaveName} className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              value={nameInput}
              maxLength={20}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-[#181434] border border-purple-900/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Save
            </button>
          </form>
          {savedNameNotice && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">✓ Name updated successfully!</p>
          )}
        </div>

        {/* Accessory Dressing Room */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Accessory Dressing Room
              </h3>
              <p className="text-xs text-slate-400">
                Accessories appear on {panda.name} in both 3D and cinematic modes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: 'glasses' as keyof PandaAccessories,
                name: 'Scholar Glasses',
                icon: '👓',
                desc: 'Golden circular frames for focused reading',
              },
              {
                id: 'zenHeadband' as keyof PandaAccessories,
                name: 'Zen Headband',
                icon: '🪢',
                desc: 'Purple warrior band with gold crest',
              },
              {
                id: 'bambooCrown' as keyof PandaAccessories,
                name: 'Bamboo Crown',
                icon: '🌿',
                desc: 'Crisp green forest sprig',
              },
              {
                id: 'cozyScarf' as keyof PandaAccessories,
                name: 'Lavender Scarf',
                icon: '🧣',
                desc: 'Hand-knitted winter warmth',
              },
            ].map((acc) => {
              const isEquipped = !!panda.accessories[acc.id];
              return (
                <button
                  key={acc.id}
                  onClick={() => toggleAccessory(acc.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-purple-900/40 border-purple-400 shadow-md shadow-purple-950/40'
                      : 'bg-slate-900/60 border-purple-900/30 text-slate-400 hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{acc.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isEquipped ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isEquipped ? 'Equipped' : 'Off'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{acc.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Personality Archetype Switcher */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Companion Personality
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'playful_adventurer' as PandaPersonality, title: 'Playful Adventurer', icon: '🧭' },
              { id: 'zen_scholar' as PandaPersonality, title: 'Zen Scholar', icon: '📖' },
              { id: 'cozy_dreamer' as PandaPersonality, title: 'Cozy Dreamer', icon: '🌙' },
              { id: 'cheerful_motivator' as PandaPersonality, title: 'Cheerful Motivator', icon: '🔥' },
            ].map((item) => {
              const isSelected = panda.personality === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectPersonality(item.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-900/30 border-purple-400'
                      : 'bg-slate-900/60 border-purple-900/30 text-slate-400 hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio, Motion & Performance Preferences */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Audio & Accessibility
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-purple-900/30">
            <div>
              <div className="text-xs font-bold text-white">Procedural Sound Effects</div>
              <div className="text-[11px] text-slate-400">Gentle squeaks, munching, purrs, and chimes</div>
            </div>
            <button
              onClick={() => onUpdateSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="flex items-center justify-between py-2 border-b border-purple-900/30">
              <div className="text-xs font-bold text-white">Sound Volume</div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings((s) => ({ ...s, soundVolume: val }));
                }}
                className="w-36 accent-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* Render Mode */}
          <div className="flex items-center justify-between py-2 border-b border-purple-900/30">
            <div>
              <div className="text-xs font-bold text-white">Character Rendering Engine</div>
              <div className="text-[11px] text-slate-400">
                {settings.renderMode === '3d' ? 'Interactive 3D Three.js Studio' : 'Cinematic High-Res Artwork'}
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateSettings((s) => ({
                  ...s,
                  renderMode: s.renderMode === '3d' ? 'cinematic' : '3d',
                }))
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-purple-900/40 text-xs font-semibold text-purple-200 hover:text-white cursor-pointer"
            >
              Switch to {settings.renderMode === '3d' ? 'Cinematic' : '3D Studio'}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-bold text-white">Reduced Motion Mode</div>
              <div className="text-[11px] text-slate-400">Minimizes spring bounces for visual comfort</div>
            </div>
            <button
              onClick={() => onUpdateSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.reducedMotion ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Management & Export (User-controlled data export & reset) */}
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Data Control & Backup
          </h3>
          <p className="text-xs text-slate-400">
            Export all companion progress, schedule tasks, and focus history to a JSON file, or restore default values.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onExportData}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <span>💾</span>
              <span>Export Companion Data (JSON)</span>
            </button>

            <button
              onClick={onResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🗑️</span>
              <span>Reset Companion State</span>
            </button>
          </div>
        </div>

        {/* Restart Tour Option */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onRestartTour}
            className="px-4 py-2 rounded-xl border border-purple-900/40 text-slate-400 hover:text-white hover:bg-purple-900/20 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replay Companion Setup Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
