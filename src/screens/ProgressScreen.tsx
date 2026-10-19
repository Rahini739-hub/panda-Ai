import React from 'react';
import { Award, Trophy, Heart, Sparkles, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { Achievement, PandaProfile } from '../types';

interface ProgressScreenProps {
  panda: PandaProfile;
  achievements: Achievement[];
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  panda,
  achievements,
  onBack,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const getFriendshipTier = (level: number) => {
    if (level >= 20) return { title: 'Celestial Kin', subtitle: 'An unbreakable eternal spiritual bond' };
    if (level >= 15) return { title: 'Soulmate Companion', subtitle: 'Deep harmonic understanding and warmth' };
    if (level >= 10) return { title: 'Loyal Confidant', subtitle: 'Shares everyday adventures and quiet moments' };
    if (level >= 5) return { title: 'Cherished Friend', subtitle: 'Growing trust and daily cheerful smiles' };
    return { title: 'Kindred Acquaintance', subtitle: 'The beginning of a wonderful journey' };
  };

  const tier = getFriendshipTier(panda.stats.friendshipLevel);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Milestones & Achievements</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Celebrate your shared bond, daily consistency, and unlocked companion badges.
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

      {/* Main Friendship Bond Card */}
      <div className="bg-[#120f26] border border-purple-500/25 rounded-3xl p-6 shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-3xl shadow-xl shadow-purple-950/50">
              💖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Friendship Level {panda.stats.friendshipLevel}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300 font-medium">{tier.title}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {panda.name} & You
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{tier.subtitle}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-purple-300">Level Progress</div>
            <div className="text-lg font-bold text-white tabular-nums">
              {panda.stats.friendshipExp} / {panda.stats.friendshipLevel * 100} XP
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-purple-900/40">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (panda.stats.friendshipExp / (panda.stats.friendshipLevel * 100)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Lifetime Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-medium">Days Together</span>
          <div className="text-xl font-bold text-white tabular-nums mt-1">{panda.daysTogether} Days</div>
        </div>

        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-medium">Bamboo Treats Fed</span>
          <div className="text-xl font-bold text-emerald-400 tabular-nums mt-1">{panda.treatsFedCount} Treats</div>
        </div>

        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-medium">Zen Minutes Logged</span>
          <div className="text-xl font-bold text-purple-300 tabular-nums mt-1">{panda.focusMinutesTotal} Mins</div>
        </div>

        <div className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4">
          <span className="text-[11px] text-slate-400 font-medium">Mini-Game Best</span>
          <div className="text-xl font-bold text-amber-400 tabular-nums mt-1">{panda.miniGameHighScore} Pts</div>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Badges & Honors ({unlockedCount} / {achievements.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-[#151130] border-purple-500/40 shadow-lg shadow-purple-950/30'
                  : 'bg-[#120f26]/60 border-purple-950/40 opacity-75'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  ach.unlocked
                    ? 'bg-purple-600/30 border border-purple-400/50 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-600'
                }`}
              >
                {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold truncate ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {ach.title}
                  </h4>
                  {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>

                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{ach.description}</p>

                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.unlocked ? 'bg-purple-400' : 'bg-slate-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {ach.progress}/{ach.maxProgress}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
