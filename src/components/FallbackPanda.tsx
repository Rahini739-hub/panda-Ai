import React, { useState, useEffect } from 'react';
import { PandaAnimation, PandaAccessories } from '../types';
import { playSound } from '../utils/audio';

interface FallbackPandaProps {
  currentAnimation: PandaAnimation;
  accessories: PandaAccessories;
  onPandaClick: () => void;
  onPandaPet: () => void;
  soundEnabled: boolean;
  soundVolume: number;
}

export const FallbackPanda: React.FC<FallbackPandaProps> = ({
  currentAnimation,
  accessories,
  onPandaClick,
  onPandaPet,
  soundEnabled,
  soundVolume,
}) => {
  const [blinking, setBlinking] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    }, 3200 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointerup', onPointerUp);
      const dist = Math.hypot(upEvt.clientX - startX, upEvt.clientY - startY);
      if (dist < 10) {
        playSound('squeak', soundVolume, soundEnabled);
        onPandaClick();
      } else {
        playSound('purr', soundVolume, soundEnabled);
        onPandaPet();
      }
      setDragProgress(0);
    };

    const onPointerMove = (moveEvt: PointerEvent) => {
      const dist = Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY);
      if (dist > 15) {
        setDragProgress(Math.min(1, dist / 80));
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
  };

  const getAnimationClass = () => {
    switch (currentAnimation) {
      case 'happy_bouncing':
      case 'celebrating':
        return 'animate-bounce';
      case 'sleeping':
        return 'opacity-90 scale-95';
      case 'waving':
      case 'playful':
        return 'animate-float-gentle';
      default:
        return 'animate-breathe';
    }
  };

  const imageSrc =
    currentAnimation === 'sleeping'
      ? '/src/assets/images/panda_cozy_nap_1792338724974.jpg'
      : '/src/assets/images/panda_buddy_portrait_1792338723967.jpg';

  return (
    <div
      onPointerDown={handlePointerDown}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none touch-none p-4"
      title="Click or drag to interact!"
    >
      <div className="relative group max-w-sm w-full aspect-square flex items-center justify-center">
        {/* Soft Lavender Halo Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-indigo-500/20 to-purple-400/20 rounded-full blur-2xl transform group-hover:scale-105 transition-transform duration-500" />

        {/* Character Image */}
        <div className={`relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${getAnimationClass()} transition-transform duration-300`}>
          <img
            src={imageSrc}
            alt="PandaBuddy AI"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Interactive Petting Ripple Overlay */}
          {dragProgress > 0 && (
            <div className="absolute inset-0 bg-purple-500/15 pointer-events-none flex items-center justify-center">
              <span className="text-3xl animate-ping">💖</span>
            </div>
          )}

          {/* Dynamic Blink Overlay */}
          {blinking && currentAnimation !== 'sleeping' && (
            <div className="absolute top-[28%] left-[26%] right-[26%] h-6 bg-slate-950/80 rounded-full blur-xs pointer-events-none" />
          )}

          {/* Visual accessory markers */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-purple-200 border border-white/10">
            {accessories.glasses && <span>👓</span>}
            {accessories.zenHeadband && <span>🪢</span>}
            {accessories.bambooCrown && <span>🌿</span>}
            {accessories.cozyScarf && <span>🧣</span>}
            {!accessories.glasses && !accessories.zenHeadband && !accessories.bambooCrown && !accessories.cozyScarf && (
              <span>✨ Natural Fur</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
