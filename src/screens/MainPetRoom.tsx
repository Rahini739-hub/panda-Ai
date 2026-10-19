import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Zap,
  Utensils,
  Moon,
  Sun,
  Smile,
  Timer,
  Calendar,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Award,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Gift,
  Palette,
  PawPrint,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetProfile, PandaAnimation, AppSettings, ActiveScreen, ScheduleReminder, DeviceBatteryState, PandaMood, RoomBackground } from '../types';
import { ThreePandaCanvas } from '../components/ThreePandaCanvas';
import { UniversalPetCanvas } from '../components/UniversalPetCanvas';
import { PetSpeechBubble } from '../components/PetSpeechBubble';
import { playSound } from '../utils/audio';

interface MainPetRoomProps {
  panda: PetProfile;
  settings: AppSettings;
  reminders: ScheduleReminder[];
  batteryState: DeviceBatteryState;
  onUpdatePanda: (updater: (prev: PetProfile) => PetProfile) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onToggleSound: () => void;
  onToggleRenderMode: () => void;
  onToggleWidgetMode: () => void;
}

const getRoomImage = (bg?: RoomBackground) => {
  switch (bg) {
    case 'garden':
      return '/src/assets/images/bg_garden_blooms_1792343259529.jpg';
    case 'beach':
      return '/src/assets/images/bg_beach_sunset_1792343259631.jpg';
    case 'magical_forest':
      return '/src/assets/images/bg_magical_forest_1792343260427.jpg';
    case 'space_room':
      return '/src/assets/images/bg_space_observatory_1792343261426.jpg';
    case 'bedroom':
    default:
      return '/src/assets/images/room_zen_bamboo_haven_1792338723945.jpg';
  }
};

const getSpeciesIcon = (species?: string) => {
  switch (species) {
    case 'dog':
      return '🐕';
    case 'puppy':
      return '🐶';
    case 'cat':
      return '🐈';
    case 'kitten':
      return '🐱';
    case 'rabbit':
      return '🐇';
    case 'bunny':
      return '🐰';
    case 'fox':
      return '🦊';
    case 'panda':
    default:
      return '🐼';
  }
};

export const MainPetRoom: React.FC<MainPetRoomProps> = ({
  panda,
  settings,
  reminders,
  batteryState,
  onUpdatePanda,
  onNavigate,
  onToggleSound,
  onToggleRenderMode,
  onToggleWidgetMode,
}) => {
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [showRoomBackdrop, setShowRoomBackdrop] = useState(true);

  const getSpeciesSoundType = (species: PetProfile['species']): 'squeak' | 'dog_bark' | 'cat_meow' | 'rabbit_hop' | 'fox_yip' => {
    switch (species) {
      case 'dog':
      case 'puppy':
        return 'dog_bark';
      case 'cat':
      case 'kitten':
        return 'cat_meow';
      case 'rabbit':
      case 'bunny':
        return 'rabbit_hop';
      case 'fox':
        return 'fox_yip';
      case 'panda':
      default:
        return 'squeak';
    }
  };

  const triggerReaction = (
    anim: PandaAnimation,
    speech: string,
    sound: 'squeak' | 'purr' | 'munch' | 'victory' | 'pop' | 'lullaby' | 'dog_bark' | 'cat_meow' | 'rabbit_hop' | 'fox_yip',
    statGains?: { happiness?: number; energy?: number; fullness?: number; exp?: number }
  ) => {
    if (panda.soundsEnabled) {
      playSound(sound, settings.soundVolume, settings.soundEnabled);
    }

    if (anim === 'celebrating') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#a855f7', '#ec4899', '#6366f1', '#fbbf24'],
      });
    }

    onUpdatePanda((prev) => {
      const stats = { ...prev.stats };
      let newExp = stats.friendshipExp + (statGains?.exp || 5);
      let newLevel = stats.friendshipLevel;
      const expNeeded = newLevel * 100;
      if (newExp >= expNeeded) {
        newExp -= expNeeded;
        newLevel += 1;
        playSound('victory', settings.soundVolume, settings.soundEnabled);
      }

      stats.happiness = Math.min(100, Math.max(0, stats.happiness + (statGains?.happiness || 0)));
      stats.energy = Math.min(100, Math.max(0, stats.energy + (statGains?.energy || 0)));
      stats.fullness = Math.min(100, Math.max(0, stats.fullness + (statGains?.fullness || 0)));
      stats.friendshipExp = newExp;
      stats.friendshipLevel = newLevel;

      let newMood: PandaMood = prev.currentMood;
      if (anim === 'sleeping') newMood = 'sleepy';
      else if (stats.energy < 20) newMood = 'tired';
      else if (stats.fullness < 25) newMood = 'hungry';
      else if (stats.happiness > 85) newMood = 'ecstatic';
      else if (anim === 'playful') newMood = 'playful';
      else if (anim === 'studying') newMood = 'focused';

      return {
        ...prev,
        currentAnimation: anim,
        currentMood: newMood,
        speechText: speech,
        stats,
        treatsFedCount: statGains?.fullness ? prev.treatsFedCount + 1 : prev.treatsFedCount,
      };
    });

    if (anim !== 'sleeping') {
      setTimeout(() => {
        onUpdatePanda((prev) => {
          if (prev.currentAnimation === anim) {
            return { ...prev, currentAnimation: 'idle' };
          }
          return prev;
        });
      }, 4200);
    }
  };

  const handlePetClick = () => {
    const soundType = getSpeciesSoundType(panda.species);

    let chosenAnim: PandaAnimation = 'happy_bouncing';
    let speech = `Hi there! ${panda.name} loves spending time with you! 🐾`;

    if (panda.species === 'dog' || panda.species === 'puppy') {
      const dogAnims: PandaAnimation[] = ['tail_wagging', 'happy_bouncing', 'fetching'];
      chosenAnim = dogAnims[Math.floor(Math.random() * dogAnims.length)];
      const dogPhrases = [
        `*Woof! Tail wags like a happy propeller!* ${panda.name} is thrilled!`,
        `Ready to fetch and celebrate all your daily tasks! 🎾`,
        `*Happy joyful hops and tail wiggles!* Best friend ever!`,
      ];
      speech = dogPhrases[Math.floor(Math.random() * dogPhrases.length)];
    } else if (panda.species === 'cat' || panda.species === 'kitten') {
      const catAnims: PandaAnimation[] = ['stretching', 'playful', 'happy_bouncing'];
      chosenAnim = catAnims[Math.floor(Math.random() * catAnims.length)];
      const catPhrases = [
        `*Blinks glassy eyes slowly with affection* Purrr... 🐾`,
        `*Stretches paws forward gracefully* So serene study sessions with you!`,
        `*Playful paw tap at yarn ball!* You've got my full attention!`,
      ];
      speech = catPhrases[Math.floor(Math.random() * catPhrases.length)];
    } else if (panda.species === 'rabbit' || panda.species === 'bunny') {
      const rabbitAnims: PandaAnimation[] = ['hopping', 'playful', 'happy_bouncing'];
      chosenAnim = rabbitAnims[Math.floor(Math.random() * rabbitAnims.length)];
      const rabbitPhrases = [
        `*Twitches soft velvet ears and hops cheerfully!* 🐰`,
        `*Gentle marshmallow nose boop* Let's stay peaceful and focused!`,
        `*Happy rhythmic bunny hops!* Ready for a productive sprint!`,
      ];
      speech = rabbitPhrases[Math.floor(Math.random() * rabbitPhrases.length)];
    } else if (panda.species === 'fox') {
      const foxAnims: PandaAnimation[] = ['tail_wagging', 'playful', 'happy_bouncing'];
      chosenAnim = foxAnims[Math.floor(Math.random() * foxAnims.length)];
      const foxPhrases = [
        `*Swishes majestic bushy tail with golden gleam!* 🦊✨`,
        `*Clever, lively head tilt* What great mystery are we solving next?`,
        `*Playful forest pounce!* Your focus and drive are inspiring!`,
      ];
      speech = foxPhrases[Math.floor(Math.random() * foxPhrases.length)];
    } else {
      const pandaAnims: PandaAnimation[] = ['waving', 'happy_bouncing', 'eating', 'playful'];
      chosenAnim = pandaAnims[Math.floor(Math.random() * pandaAnims.length)];
      const pandaPhrases = [
        `*Waves fluffy paw happily* BaoBao loves spending time with you! 🎋`,
        `*Chubby happy bounce* Let's take deep breaths and smile!`,
        `*Giggles* Tickles! That tickles my tummy!`,
      ];
      speech = pandaPhrases[Math.floor(Math.random() * pandaPhrases.length)];
    }

    triggerReaction(chosenAnim, speech, soundType, { happiness: 4, exp: 3 });
  };

  const handlePetPet = () => {
    let anim: PandaAnimation = 'happy_bouncing';
    let speech = `*Cozy gentle purrs* Petting is ${panda.name}'s favorite thing!`;

    if (panda.species === 'dog' || panda.species === 'puppy') {
      anim = 'tail_wagging';
      speech = `*Woof! Warm ear scratches are heaven! Tail wagging non-stop!* 🐾`;
    } else if (panda.species === 'cat' || panda.species === 'kitten') {
      anim = 'stretching';
      speech = `*Deep melodic purrs and velvet chin rubs... keep going!* ✨`;
    } else if (panda.species === 'rabbit' || panda.species === 'bunny') {
      anim = 'hopping';
      speech = `*Velvet soft head strokes make ${panda.name} melt with happiness!* 🐰`;
    } else if (panda.species === 'fox') {
      anim = 'tail_wagging';
      speech = `*Gentle bushy tail sweeps and affectionate happy purrs!* 🦊`;
    }

    triggerReaction(anim, speech, 'purr', {
      happiness: 8,
      exp: 6,
    });
  };

  const handleFeed = () => {
    const foodName =
      panda.species === 'panda'
        ? 'sweet bamboo shoots'
        : panda.species === 'dog' || panda.species === 'puppy'
        ? 'crunchy golden biscuits'
        : panda.species === 'cat' || panda.species === 'kitten'
        ? 'delicious salmon bites'
        : panda.species === 'rabbit' || panda.species === 'bunny'
        ? 'fresh garden carrots'
        : 'wild mountain berries';

    triggerReaction('eating', `Nom nom nom! Delicious ${foodName}! Thank you so much!`, 'munch', {
      fullness: 18,
      happiness: 6,
      exp: 8,
    });
  };

  const handlePlayBall = () => {
    const soundType = getSpeciesSoundType(panda.species);
    triggerReaction('playful', `Wheee! ${panda.name} caught the ball with lightning reflexes!`, soundType, {
      happiness: 15,
      energy: -8,
      exp: 10,
    });
  };

  const handleBrush = () => {
    triggerReaction('happy_bouncing', `Oooh, feeling silky smooth and sparkling clean! ✨`, 'purr', {
      happiness: 10,
      exp: 7,
    });
  };

  const handleSleepToggle = () => {
    if (panda.currentAnimation === 'sleeping') {
      const soundType = getSpeciesSoundType(panda.species);
      triggerReaction('waving', `Good morning! ${panda.name} is bright-eyed and energized!`, soundType, {
        energy: 30,
        happiness: 5,
        exp: 5,
      });
    } else {
      triggerReaction('sleeping', `Zzz... Resting my eyes on the soft cushion. Sweet dreams!`, 'lullaby', {
        energy: 15,
        happiness: 5,
        exp: 5,
      });
    }
  };

  const handleClaimDailyReward = () => {
    playSound('victory', settings.soundVolume, settings.soundEnabled);
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });

    onUpdatePanda((prev) => ({
      ...prev,
      dailyRewardClaimed: true,
      currentAnimation: 'celebrating',
      speechText: "Daily Companion Gift Claimed! +40 XP & delicious treats! 🎁✨",
      stats: {
        ...prev.stats,
        friendshipExp: prev.stats.friendshipExp + 40,
        happiness: 100,
      },
    }));
  };

  const nextReminder = reminders.find((r) => !r.completed);
  const roomBackdropImage = getRoomImage(panda.roomBackground);
  const speciesEmoji = getSpeciesIcon(panda.species);

  return (
    <div className="relative w-full h-[calc(100vh-61px)] min-h-[580px] flex flex-col justify-between overflow-hidden">
      {/* Background Ambience Layer */}
      {showRoomBackdrop ? (
        <div className="absolute inset-0 z-0">
          <img
            src={roomBackdropImage}
            alt="Sanctuary Room"
            className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1a] via-[#0c0a1a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a1a]/70 via-transparent to-[#0c0a1a]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[#0c0a1a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
      )}

      {/* Floating Header HUD / Status Bar */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 pt-3 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Pet Identity, Level & Daily Gift */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl px-3.5 py-2 flex items-center gap-3 shadow-lg shadow-purple-950/30">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-inner">
              {speciesEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">{panda.name}</span>
                <span className="text-[11px] text-purple-300 font-medium">Lv.{panda.stats.friendshipLevel}</span>
                <span className="text-[11px] text-slate-400 capitalize">· {panda.currentMood}</span>
              </div>
              <div className="w-36 sm:w-44 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(panda.stats.friendshipExp / (panda.stats.friendshipLevel * 100)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {!panda.dailyRewardClaimed && (
            <button
              onClick={handleClaimDailyReward}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-3 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40 animate-bounce cursor-pointer"
              title="Claim Daily Companion Gift"
            >
              <Gift className="w-4 h-4" />
              <span>Daily Gift</span>
            </button>
          )}

          {/* Prominent Customize Pet Button */}
          <button
            onClick={() => onNavigate('customize')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/50 text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-950/40 cursor-pointer active:scale-95"
            title="Open Pet Customization Studio"
          >
            <Palette className="w-3.5 h-3.5 text-purple-200" />
            <span>Customize Pet</span>
          </button>

          {/* Prominent Adopt Pet Button */}
          <button
            onClick={() => onNavigate('adopt')}
            className="bg-slate-900/90 hover:bg-purple-950/70 border border-purple-500/40 text-purple-200 hover:text-white px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            title="Adopt a New Pet Companion"
          >
            <PawPrint className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Adopt Pet</span>
          </button>
        </div>

        {/* Center: Vitality Gauges */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl px-4 py-2 shadow-lg shadow-purple-950/30">
          {/* Happiness */}
          <div className="flex items-center gap-1.5" title={`Happiness: ${panda.stats.happiness}%`}>
            <Heart className="w-4 h-4 text-pink-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">Happiness</span>
              <span className="text-xs font-bold text-slate-100 tabular-nums">{panda.stats.happiness}%</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Virtual Pet Energy */}
          <div className="flex items-center gap-1.5" title={`Virtual Pet Energy: ${panda.stats.energy}%`}>
            <Zap className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">Pet Energy</span>
              <span className="text-xs font-bold text-slate-100 tabular-nums">{panda.stats.energy}%</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Fullness */}
          <div className="flex items-center gap-1.5" title={`Hunger/Fullness: ${panda.stats.fullness}%`}>
            <Utensils className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">Fullness</span>
              <span className="text-xs font-bold text-slate-100 tabular-nums">{panda.stats.fullness}%</span>
            </div>
          </div>

          {/* Actual Hardware Device Battery */}
          {batteryState.supported && (
            <>
              <div className="w-px h-6 bg-slate-800" />
              <div
                className="flex items-center gap-1.5"
                title={`Hardware Device Battery: ${batteryState.level}% (${batteryState.charging ? 'Charging' : 'On Battery'})`}
              >
                {batteryState.charging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                ) : batteryState.level <= 20 ? (
                  <BatteryWarning className="w-4 h-4 text-rose-400 animate-pulse" />
                ) : (
                  <Battery className="w-4 h-4 text-purple-300" />
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">Device Bat</span>
                  <span className="text-xs font-bold text-slate-100 tabular-nums">{batteryState.level}%</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Quick Utility Toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Backdrop Toggle */}
          <button
            onClick={() => setShowRoomBackdrop(!showRoomBackdrop)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Toggle Room Backdrop"
          >
            <span>🏮</span>
            <span className="hidden sm:inline text-[11px]">Backdrop</span>
          </button>

          {/* Render Mode Toggle (for Panda 3D vs Cinematic) */}
          {panda.species === 'panda' && (
            <button
              onClick={onToggleRenderMode}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
              title="Switch between Realtime 3D Engine and Illustrated Studio"
            >
              {settings.renderMode === '3d' ? '3D View' : 'Illustrated'}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Widget Mode Toggle */}
          <button
            onClick={onToggleWidgetMode}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Companion Mini Dock Mode"
          >
            {settings.desktopWidgetMode ? <Minimize2 className="w-4 h-4 text-purple-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Primary Pet Character Viewport */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-[300px]">
        {/* Animated Speech Bubble */}
        <PetSpeechBubble
          text={panda.speechText}
          petName={panda.name}
          onDismiss={() => onUpdatePanda((prev) => ({ ...prev, speechText: null }))}
        />

        {/* Dynamic Character Engine: 3D Three.js for Panda or Universal Multi-Species Character */}
        {panda.species === 'panda' && settings.renderMode === '3d' ? (
          <ThreePandaCanvas
            currentAnimation={panda.currentAnimation}
            accessories={panda.accessories}
            onPandaClick={handlePetClick}
            onPandaPet={handlePetPet}
            soundEnabled={settings.soundEnabled && panda.soundsEnabled}
            soundVolume={settings.soundVolume}
          />
        ) : (
          <UniversalPetCanvas
            pet={panda}
            onPetClick={handlePetClick}
            onPetPet={handlePetPet}
            soundEnabled={settings.soundEnabled && panda.soundsEnabled}
            soundVolume={settings.soundVolume}
          />
        )}

        {/* Floating Quick Task Reminder Card */}
        {nextReminder && !controlsCollapsed && (
          <div
            onClick={() => onNavigate('schedule')}
            className="hidden lg:flex items-center gap-2.5 absolute bottom-4 left-6 z-20 bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md border border-purple-500/20 rounded-2xl px-3.5 py-2.5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg max-w-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">Upcoming Goal</div>
              <div className="text-xs font-medium text-slate-200 truncate">{nextReminder.title}</div>
            </div>
          </div>
        )}

        {/* Floating Quick Focus Action */}
        {!controlsCollapsed && (
          <button
            onClick={() => onNavigate('focus')}
            className="hidden lg:flex items-center gap-2 absolute bottom-4 right-6 z-20 bg-slate-900/70 hover:bg-purple-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl px-3.5 py-2.5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg text-slate-200"
          >
            <Timer className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <div className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider">Zen Focus Mode</div>
              <div className="text-xs font-medium text-white">Start Study Block</div>
            </div>
          </button>
        )}
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div className="relative z-30 w-full max-w-2xl mx-auto px-4 pb-20 md:pb-6 flex flex-col items-center">
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="mb-2 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-purple-900/40 text-slate-400 hover:text-purple-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Care Dock</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Zen View</span>
            </>
          )}
        </button>

        {!controlsCollapsed && (
          <div className="w-full bg-[#120f26]/90 backdrop-blur-xl border border-purple-500/25 rounded-3xl p-2.5 shadow-2xl shadow-purple-950/60 flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Feed */}
            <button
              onClick={handleFeed}
              className="flex-1 py-2 sm:py-2.5 px-2 rounded-2xl bg-slate-800/60 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-500/50 text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95"
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">
                {panda.species === 'panda'
                  ? '🎋'
                  : panda.species === 'dog' || panda.species === 'puppy'
                  ? '🦴'
                  : panda.species === 'cat' || panda.species === 'kitten'
                  ? '🐟'
                  : panda.species === 'rabbit' || panda.species === 'bunny'
                  ? '🥕'
                  : '🍓'}
              </span>
              <span className="text-[11px] font-semibold tracking-tight">Feed</span>
            </button>

            {/* Pet & Tickle */}
            <button
              onClick={handlePetPet}
              className="flex-1 py-2 sm:py-2.5 px-2 rounded-2xl bg-slate-800/60 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-500/50 text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95"
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">💖</span>
              <span className="text-[11px] font-semibold tracking-tight">Pet</span>
            </button>

            {/* Play */}
            <button
              onClick={handlePlayBall}
              className="flex-1 py-2 sm:py-2.5 px-2 rounded-2xl bg-slate-800/60 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-500/50 text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95"
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">🎾</span>
              <span className="text-[11px] font-semibold tracking-tight">Play</span>
            </button>

            {/* Groom */}
            <button
              onClick={handleBrush}
              className="flex-1 py-2 sm:py-2.5 px-2 rounded-2xl bg-slate-800/60 hover:bg-purple-900/40 border border-purple-900/30 hover:border-purple-500/50 text-slate-200 hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95"
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">✨</span>
              <span className="text-[11px] font-semibold tracking-tight">Groom</span>
            </button>

            {/* Rest / Sleep */}
            <button
              onClick={handleSleepToggle}
              className={`flex-1 py-2 sm:py-2.5 px-2 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer group active:scale-95 ${
                panda.currentAnimation === 'sleeping'
                  ? 'bg-purple-600/40 border-purple-400 text-purple-200'
                  : 'bg-slate-800/60 hover:bg-purple-900/40 border-purple-900/30 hover:border-purple-500/50 text-slate-200 hover:text-white'
              }`}
            >
              <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">
                {panda.currentAnimation === 'sleeping' ? '☀️' : '🌙'}
              </span>
              <span className="text-[11px] font-semibold tracking-tight">
                {panda.currentAnimation === 'sleeping' ? 'Wake' : 'Rest'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
