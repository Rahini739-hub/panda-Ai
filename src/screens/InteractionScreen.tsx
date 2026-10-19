import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, Play, Gamepad2, Heart, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PandaProfile, AppSettings, PandaAnimation } from '../types';
import { playSound } from '../utils/audio';

interface InteractionScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  onUpdatePanda: (updater: (prev: PandaProfile) => PandaProfile) => void;
  onBack: () => void;
}

interface BambooItem {
  id: number;
  x: number; // percentage 5 to 90
  y: number; // percentage 0 to 100
  speed: number;
  type: 'bamboo' | 'golden_leaf' | 'stone';
}

export const InteractionScreen: React.FC<InteractionScreenProps> = ({
  panda,
  settings,
  onUpdatePanda,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'catcher' | 'memory' | 'toys'>('catcher');

  // MINI-GAME 1: Bamboo Catcher
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [catcherX, setCatcherX] = useState(50); // percentage
  const [items, setItems] = useState<BambooItem[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // MINI-GAME 2: Memory Dance
  const danceMoves = ['paw_left', 'paw_right', 'hop', 'bow'] as const;
  type DanceMove = typeof danceMoves[number];
  const [sequence, setSequence] = useState<DanceMove[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [danceRound, setDanceRound] = useState(1);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeHighlightMove, setActiveHighlightMove] = useState<DanceMove | null>(null);
  const [memoryGameStatus, setMemoryGameStatus] = useState<'idle' | 'playing' | 'game_over'>('idle');

  // Catcher Game Loop
  useEffect(() => {
    if (!gameRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameRunning(false);
          playSound('victory', settings.soundVolume, settings.soundEnabled);
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          // Update high score & friendship
          onUpdatePanda((p) => ({
            ...p,
            miniGameHighScore: Math.max(p.miniGameHighScore, score),
            stats: {
              ...p.stats,
              happiness: Math.min(100, p.stats.happiness + 20),
              friendshipExp: p.stats.friendshipExp + Math.floor(score / 2),
            },
            currentAnimation: 'celebrating',
            speechText: `Amazing game! You scored ${score} points! ${panda.name} is so proud! 🐾`,
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameRunning, score, panda.name]);

  // Falling Items Tick
  useEffect(() => {
    if (!gameRunning) return;

    const itemLoop = setInterval(() => {
      setItems((prevItems) => {
        // Spawn random items
        const newItems = [...prevItems];
        if (Math.random() < 0.35 && newItems.length < 8) {
          const rand = Math.random();
          const itemType = rand > 0.8 ? 'golden_leaf' : rand > 0.2 ? 'bamboo' : 'stone';
          newItems.push({
            id: Date.now() + Math.random(),
            x: 8 + Math.random() * 84,
            y: 0,
            speed: 1.2 + Math.random() * 1.5,
            type: itemType,
          });
        }

        // Update positions & check collisions
        const remaining: BambooItem[] = [];
        newItems.forEach((item) => {
          const nextY = item.y + item.speed;
          // Catch check at bottom (y between 78 and 92, x near catcherX +/- 12)
          if (nextY >= 78 && nextY <= 90 && Math.abs(item.x - catcherX) < 14) {
            // Caught!
            if (item.type === 'golden_leaf') {
              setScore((s) => s + 25);
              playSound('pop', settings.soundVolume, settings.soundEnabled);
            } else if (item.type === 'bamboo') {
              setScore((s) => s + 10);
              playSound('munch', settings.soundVolume, settings.soundEnabled);
            } else {
              setScore((s) => Math.max(0, s - 15));
              playSound('squeak', settings.soundVolume, settings.soundEnabled);
            }
          } else if (nextY < 100) {
            remaining.push({ ...item, y: nextY });
          }
        });
        return remaining;
      });
    }, 40);

    return () => clearInterval(itemLoop);
  }, [gameRunning, catcherX]);

  const startCatcherGame = () => {
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setGameRunning(true);
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onUpdatePanda((p) => ({
      ...p,
      currentAnimation: 'playful',
      speechText: "Catch the juicy bamboo! Watch out for the pebbles!",
    }));
  };

  // Touch & Mouse Movement for Catcher
  const handleGameAreaPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gameRunning || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setCatcherX(Math.max(10, Math.min(90, x)));
  };

  // MEMORY DANCE LOGIC
  const startMemoryGame = () => {
    setDanceRound(1);
    setMemoryGameStatus('playing');
    generateSequence(1);
  };

  const generateSequence = (length: number) => {
    const newSeq: DanceMove[] = [];
    for (let i = 0; i < length + 2; i++) {
      const move = danceMoves[Math.floor(Math.random() * danceMoves.length)];
      newSeq.push(move);
    }
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = async (seq: DanceMove[]) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setActiveHighlightMove(seq[i]);
      playSound('pop', settings.soundVolume, settings.soundEnabled);
      await new Promise((r) => setTimeout(r, 450));
      setActiveHighlightMove(null);
    }
    setIsShowingSequence(false);
  };

  const handlePlayerMove = (move: DanceMove) => {
    if (isShowingSequence || memoryGameStatus !== 'playing') return;

    playSound('pop', settings.soundVolume, settings.soundEnabled);

    if (move === sequence[playerStep]) {
      const nextStep = playerStep + 1;
      if (nextStep >= sequence.length) {
        // Round Completed!
        playSound('victory', settings.soundVolume, settings.soundEnabled);
        const nextRound = danceRound + 1;
        setDanceRound(nextRound);
        onUpdatePanda((p) => ({
          ...p,
          currentAnimation: 'celebrating',
          speechText: `Woohoo! Dance round ${danceRound} cleared!`,
          stats: {
            ...p.stats,
            happiness: Math.min(100, p.stats.happiness + 15),
            friendshipExp: p.stats.friendshipExp + 15,
          },
        }));
        setTimeout(() => generateSequence(nextRound), 1200);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Mistake!
      playSound('squeak', settings.soundVolume, settings.soundEnabled);
      setMemoryGameStatus('game_over');
      onUpdatePanda((p) => ({
        ...p,
        currentAnimation: 'sad',
        speechText: "Oops! We got our paws tangled. Let's try again!",
      }));
    }
  };

  // TOY CHEST INTERACTION
  const playWithToy = (toyName: string, anim: PandaAnimation, sound: 'squeak' | 'purr' | 'pop' | 'dog_bark' | 'cat_meow' | 'rabbit_hop' | 'fox_yip' | 'munch') => {
    playSound(sound, settings.soundVolume, settings.soundEnabled);
    onUpdatePanda((p) => ({
      ...p,
      currentAnimation: anim,
      speechText: `${panda.name} loves playing with the ${toyName}! 💖`,
      stats: {
        ...p.stats,
        happiness: Math.min(100, p.stats.happiness + 12),
        friendshipExp: p.stats.friendshipExp + 8,
      },
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Playroom & Mini-Games</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Play with {panda.name} to earn happiness, boost friendship XP, and unlock joyful reactions.
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

      {/* Segmented Game Selection Controls (Compliant with frontend-design: functional button tabs) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#130f28] border border-purple-900/40 rounded-2xl mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('catcher')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'catcher'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎋</span>
          <span>Bamboo Catcher</span>
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'memory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🐾</span>
          <span>Panda Dance</span>
        </button>
        <button
          onClick={() => setActiveTab('toys')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'toys'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🧸</span>
          <span>Toy Chest</span>
        </button>
      </div>

      {/* TAB 1: Bamboo Catcher Mini-Game */}
      {activeTab === 'catcher' && (
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-semibold">Score</span>
                <div className="text-xl font-bold text-white tabular-nums">{score}</div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-semibold">Time Remaining</span>
                <div className="text-xl font-bold text-amber-400 tabular-nums">{timeLeft}s</div>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-semibold">Personal Best</span>
                <div className="text-xl font-bold text-slate-300 tabular-nums">{panda.miniGameHighScore}</div>
              </div>
            </div>

            {!gameRunning ? (
              <button
                onClick={startCatcherGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Game</span>
              </button>
            ) : (
              <span className="text-xs text-purple-300 animate-pulse">Drag or move mouse horizontally to catch!</span>
            )}
          </div>

          {/* Interactive Catch Arena */}
          <div
            ref={gameAreaRef}
            onPointerMove={handleGameAreaPointer}
            className="relative w-full h-80 sm:h-96 bg-[#0a0817] rounded-2xl border border-purple-900/50 overflow-hidden cursor-crosshair select-none touch-none"
          >
            {/* Subtle background bamboo silhouettes */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-900 to-transparent" />

            {!gameRunning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-6 text-center z-20">
                <div className="w-14 h-14 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center text-3xl mb-3 shadow-lg">
                  🎋
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Bamboo Catcher Challenge</h3>
                <p className="text-xs text-slate-300 max-w-xs mb-4">
                  Slide {panda.name}'s basket to catch fresh bamboo (+10) and golden leaves (+25). Avoid dark stones (-15)!
                </p>
                <button
                  onClick={startCatcherGame}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all cursor-pointer"
                >
                  Start Round (30s)
                </button>
              </div>
            )}

            {/* Falling items */}
            {items.map((item) => (
              <div
                key={item.id}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl filter drop-shadow-md pointer-events-none transition-transform"
              >
                {item.type === 'bamboo' ? '🎋' : item.type === 'golden_leaf' ? '✨' : '🪨'}
              </div>
            ))}

            {/* Catcher Basket / Panda Paw */}
            <div
              style={{ left: `${catcherX}%` }}
              className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
            >
              <div className="px-3 py-1 rounded-full bg-purple-600/80 text-white text-[10px] font-bold mb-1 shadow-md">
                {panda.name}
              </div>
              <div className="w-20 h-10 rounded-2xl bg-gradient-to-t from-amber-800 to-amber-600 border-2 border-amber-400 flex items-center justify-center text-xl shadow-xl shadow-purple-950/60">
                🧺
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Memory Dance Mini-Game */}
      {activeTab === 'memory' && (
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-purple-300 uppercase font-semibold">Panda Memory Dance</span>
              <h3 className="text-base font-bold text-white">Round {danceRound}</h3>
            </div>
            {memoryGameStatus !== 'playing' && (
              <button
                onClick={startMemoryGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg cursor-pointer"
              >
                {memoryGameStatus === 'game_over' ? 'Play Again' : 'Start Dancing'}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-6">
            Watch {panda.name}'s dance pattern, then tap the paws in the exact same order!
          </p>

          {/* Dance Floor Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
            <button
              onClick={() => handlePlayerMove('paw_left')}
              disabled={isShowingSequence || memoryGameStatus !== 'playing'}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                activeHighlightMove === 'paw_left'
                  ? 'bg-purple-500 text-white border-purple-300 scale-105 shadow-xl shadow-purple-500/50'
                  : 'bg-slate-900/80 border-purple-900/40 text-slate-300 hover:border-purple-600 active:scale-95'
              }`}
            >
              <span className="text-3xl">👈</span>
              <span className="text-xs font-semibold">Left Paw</span>
            </button>

            <button
              onClick={() => handlePlayerMove('paw_right')}
              disabled={isShowingSequence || memoryGameStatus !== 'playing'}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                activeHighlightMove === 'paw_right'
                  ? 'bg-purple-500 text-white border-purple-300 scale-105 shadow-xl shadow-purple-500/50'
                  : 'bg-slate-900/80 border-purple-900/40 text-slate-300 hover:border-purple-600 active:scale-95'
              }`}
            >
              <span className="text-3xl">👉</span>
              <span className="text-xs font-semibold">Right Paw</span>
            </button>

            <button
              onClick={() => handlePlayerMove('hop')}
              disabled={isShowingSequence || memoryGameStatus !== 'playing'}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                activeHighlightMove === 'hop'
                  ? 'bg-purple-500 text-white border-purple-300 scale-105 shadow-xl shadow-purple-500/50'
                  : 'bg-slate-900/80 border-purple-900/40 text-slate-300 hover:border-purple-600 active:scale-95'
              }`}
            >
              <span className="text-3xl">🐰</span>
              <span className="text-xs font-semibold">Hop!</span>
            </button>

            <button
              onClick={() => handlePlayerMove('bow')}
              disabled={isShowingSequence || memoryGameStatus !== 'playing'}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                activeHighlightMove === 'bow'
                  ? 'bg-purple-500 text-white border-purple-300 scale-105 shadow-xl shadow-purple-500/50'
                  : 'bg-slate-900/80 border-purple-900/40 text-slate-300 hover:border-purple-600 active:scale-95'
              }`}
            >
              <span className="text-3xl">🙇</span>
              <span className="text-xs font-semibold">Zen Bow</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            {isShowingSequence ? (
              <span className="text-purple-300 font-semibold animate-pulse">👀 Memorizing sequence...</span>
            ) : memoryGameStatus === 'playing' ? (
              <span>Your turn! Step {playerStep + 1} of {sequence.length}</span>
            ) : memoryGameStatus === 'game_over' ? (
              <span className="text-rose-400">Game Over! Tap "Play Again" to restart.</span>
            ) : (
              <span>Tap Start to play with {panda.name}!</span>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Toy Chest */}
      {activeTab === 'toys' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Toy 1: Wind-up Butterfly */}
          <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-2xl mb-3">
                🦋
              </div>
              <h3 className="text-base font-bold text-white">Fluttering Butterfly</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A glowing mechanical butterfly that flaps around {panda.name}'s nose, sparking curious glances and giggles.
              </p>
            </div>
            <button
              onClick={() => playWithToy('Fluttering Butterfly', 'playful', 'squeak')}
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all cursor-pointer"
            >
              Wind Up Butterfly
            </button>
          </div>

          {/* Toy 2: Bamboo Drum */}
          <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl mb-3">
                🪘
              </div>
              <h3 className="text-base font-bold text-white">Bamboo Drum</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A resonant hollow bamboo percussion instrument. {panda.name} taps rhythmic joyful beats!
              </p>
            </div>
            <button
              onClick={() => playWithToy('Bamboo Drum', 'happy_bouncing', 'pop')}
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all cursor-pointer"
            >
              Tap Rhythm
            </button>
          </div>

          {/* Toy 3: Cozy Cloud Pillow */}
          <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl mb-3">
                ☁️
              </div>
              <h3 className="text-base font-bold text-white">Velvet Cloud Pillow</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                An ultra-soft lavender marshmallow cushion. Perfect for quick cuddle power-naps.
              </p>
            </div>
            <button
              onClick={() => playWithToy('Cloud Pillow', 'sleeping', 'purr')}
              className="mt-4 w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-semibold text-purple-200 transition-all cursor-pointer"
            >
              Tuck Panda In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
