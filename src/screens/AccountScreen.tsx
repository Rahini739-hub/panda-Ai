import React, { useState } from 'react';
import {
  User,
  Shield,
  Cloud,
  Download,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  LogOut,
  LogIn,
} from 'lucide-react';
import { UserProfile, PandaProfile, AppSettings } from '../types';
import { playSound } from '../utils/audio';

interface AccountScreenProps {
  user: UserProfile;
  panda: PandaProfile;
  settings: AppSettings;
  onUpdateUser: (updater: (prev: UserProfile) => UserProfile) => void;
  onExportData: () => void;
  onResetData: () => void;
  onBack: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  panda,
  settings,
  onUpdateUser,
  onExportData,
  onResetData,
  onBack,
}) => {
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [nameInput, setNameInput] = useState(user.displayName || '');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    playSound('victory', settings.soundVolume, settings.soundEnabled);
    onUpdateUser((prev) => ({
      ...prev,
      signedIn: true,
      email: emailInput.trim(),
      displayName: nameInput.trim() || emailInput.split('@')[0],
      syncEnabled: true,
      lastSyncTime: 'Just now',
    }));
    setAuthNotice('Welcome back! Your companion state is linked.');
    setTimeout(() => setAuthNotice(null), 3000);
  };

  const handleSignOut = () => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onUpdateUser((prev) => ({
      ...prev,
      signedIn: false,
      email: '',
      displayName: 'Guest Companion',
      syncEnabled: false,
    }));
    setAuthNotice('Signed out. Local guest mode active.');
    setTimeout(() => setAuthNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Account & Data Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloud persistence, cross-device sync, and complete user data control.
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

      {authNotice && (
        <div className="mb-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{authNotice}</span>
        </div>
      )}

      {/* Account Profile Card */}
      <div className="bg-[#120f26] border border-purple-500/25 rounded-3xl p-6 shadow-2xl mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg">
              {user.signedIn ? '👤' : '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user.displayName || 'Guest Companion'}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.signedIn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {user.signedIn ? 'Cloud Linked' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.signedIn ? user.email : 'Data saved locally on this browser'}
              </p>
            </div>
          </div>

          {user.signedIn ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-purple-900/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : null}
        </div>

        {!user.signedIn && (
          <form onSubmit={handleSignIn} className="pt-4 border-t border-purple-900/30 space-y-3 max-w-md">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Sign In / Link Device Account
            </h4>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Link Account & Sync</span>
            </button>
          </form>
        )}
      </div>

      {/* Cloud Sync & Firebase Status */}
      <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Cloud Firestore & Auth Sync
          </h3>
        </div>

        <div className="bg-[#161230] border border-purple-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white">Cross-Device Synchronizer</div>
            <div className="text-slate-400 mt-0.5">
              Syncs schedule, sleep alarms, virtual coins ({panda.virtualCoins || 120} 🪙), and pet friendship between laptop and phone.
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Local Cache Ready</span>
          </div>
        </div>
      </div>

      {/* Complete Data Backup Export & Privacy Deletion */}
      <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Data Ownership & Privacy Control
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You own 100% of your schedule and pet progress. You can export an offline backup JSON file or completely erase stored records at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportData}
            className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Companion Data (JSON)</span>
          </button>

          <button
            onClick={onResetData}
            className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete & Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
