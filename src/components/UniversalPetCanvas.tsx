import React, { useState, useEffect, useRef } from 'react';
import { PetProfile, PandaAnimation } from '../types';
import { playSound } from '../utils/audio';

interface UniversalPetCanvasProps {
  pet: PetProfile;
  onPetClick: () => void;
  onPetPet: () => void;
  soundEnabled: boolean;
  soundVolume: number;
}

export const UniversalPetCanvas: React.FC<UniversalPetCanvasProps> = ({
  pet,
  onPetClick,
  onPetPet,
  soundEnabled,
  soundVolume,
}) => {
  const [blinking, setBlinking] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [dragProgress, setDragProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Blinking system
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    }, 2800 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  // Pointer tracking
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointerOffset({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  // Pointer click & petting interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const onPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointerup', onPointerUp);
      const dist = Math.hypot(upEvt.clientX - startX, upEvt.clientY - startY);
      if (dist < 10) {
        // Tap / Click
        playSpeciesSound(pet.species, 'click');
        onPetClick();
      } else {
        // Drag / Pet
        playSpeciesSound(pet.species, 'pet');
        onPetPet();
      }
      setDragProgress(0);
    };

    const onPointerDrag = (dragEvt: PointerEvent) => {
      const dist = Math.hypot(dragEvt.clientX - startX, dragEvt.clientY - startY);
      if (dist > 15) {
        setDragProgress(Math.min(1, dist / 80));
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerDrag);
  };

  const playSpeciesSound = (species: PetProfile['species'], interaction: 'click' | 'pet') => {
    if (interaction === 'pet') {
      playSound('purr', soundVolume, soundEnabled);
      return;
    }

    switch (species) {
      case 'dog':
      case 'puppy':
        playSound('dog_bark', soundVolume, soundEnabled);
        break;
      case 'cat':
      case 'kitten':
        playSound('cat_meow', soundVolume, soundEnabled);
        break;
      case 'rabbit':
      case 'bunny':
        playSound('rabbit_hop', soundVolume, soundEnabled);
        break;
      case 'fox':
        playSound('fox_yip', soundVolume, soundEnabled);
        break;
      case 'panda':
      default:
        playSound('squeak', soundVolume, soundEnabled);
        break;
    }
  };

  // Fur Color Palette Mapping
  const getFurColors = (colorId: string) => {
    switch (colorId.toLowerCase()) {
      case 'golden':
        return { primary: '#f59e0b', secondary: '#fde68a', accent: '#b45309', belly: '#fef3c7' };
      case 'brown':
        return { primary: '#854d0e', secondary: '#a16207', accent: '#713f12', belly: '#fef08a' };
      case 'black':
        return { primary: '#1e1b4b', secondary: '#2e1065', accent: '#0f172a', belly: '#475569' };
      case 'grey':
      case 'gray':
        return { primary: '#64748b', secondary: '#94a3b8', accent: '#475569', belly: '#e2e8f0' };
      case 'cream':
        return { primary: '#fef08a', secondary: '#fef9c3', accent: '#eab308', belly: '#ffffff' };
      case 'orange':
        return { primary: '#ea580c', secondary: '#fb923c', accent: '#9a3412', belly: '#ffedd5' };
      case 'white':
      default:
        return { primary: '#f8fafc', secondary: '#ffffff', accent: '#cbd5e1', belly: '#f1f5f9' };
    }
  };

  // Eye Color Palette Mapping
  const getEyeColorHex = (eyeId: string) => {
    switch (eyeId.toLowerCase()) {
      case 'sapphire':
      case 'blue':
        return '#38bdf8';
      case 'emerald':
      case 'green':
        return '#10b981';
      case 'ruby':
      case 'pink':
        return '#f43f5e';
      case 'amber':
        return '#f59e0b';
      case 'obsidian':
      case 'dark':
        return '#09090b';
      case 'hazel':
      default:
        return '#b45309';
    }
  };

  const fur = getFurColors(pet.furColor);
  const eyeColor = getEyeColorHex(pet.eyeColor);
  const isSleeping = pet.currentAnimation === 'sleeping';

  // Animation CSS classes
  const getAnimClass = () => {
    switch (pet.currentAnimation) {
      case 'happy_bouncing':
      case 'celebrating':
        return 'animate-bounce';
      case 'hopping':
        return 'animate-[bounce_0.5s_ease-in-out_infinite]';
      case 'tail_wagging':
        return 'animate-[wiggle_0.3s_ease-in-out_infinite]';
      case 'stretching':
        return 'scale-y-[1.06] origin-bottom transition-transform duration-500';
      case 'fetching':
        return 'animate-[bounce_0.6s_ease-in-out_infinite]';
      case 'sleeping':
        return 'opacity-90 scale-95';
      case 'playful':
      case 'waving':
        return 'animate-float-gentle';
      default:
        return 'animate-breathe';
    }
  };

  const headAngle = pointerOffset.x * 6;
  const eyeOffsetX = pointerOffset.x * 3.5;
  const eyeOffsetY = pointerOffset.y * 3;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none touch-none p-4"
      title={`Click to interact with ${pet.name} · Drag to pet!`}
    >
      <div className={`relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center ${getAnimClass()} transition-transform duration-300`}>
        {/* Soft Lavender Halo Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/25 via-indigo-500/20 to-purple-400/25 rounded-full blur-2xl pointer-events-none" />

        {/* Petting Ripple Indicator */}
        {dragProgress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <span className="text-4xl animate-ping">💖</span>
          </div>
        )}

        {/* Articulated Multi-Part Pet SVG Character */}
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Fur Gradients */}
            <linearGradient id="furGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fur.secondary} />
              <stop offset="60%" stopColor={fur.primary} />
              <stop offset="100%" stopColor={fur.accent} />
            </linearGradient>

            <linearGradient id="bellyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={fur.belly} />
              <stop offset="100%" stopColor={fur.secondary} />
            </linearGradient>

            <radialGradient id="eyeReflection" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="35%" stopColor={eyeColor} />
              <stop offset="85%" stopColor="#09090b" />
            </radialGradient>

            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#090814" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Ground Contact Shadow */}
          <ellipse cx="160" cy="290" rx="95" ry="18" fill="rgba(10, 8, 22, 0.55)" />

          {/* 1. TAIL LAYER */}
          {(pet.species === 'dog' || pet.species === 'puppy') && (
            <g className="origin-[100px_240px] animate-[wiggle_0.4s_ease-in-out_infinite]">
              <path
                d="M 90 230 C 50 210 40 170 55 145 C 65 130 80 145 75 165 C 70 190 95 230 90 230 Z"
                fill="url(#furGradient)"
                filter="url(#shadowFilter)"
              />
            </g>
          )}

          {(pet.species === 'cat' || pet.species === 'kitten') && (
            <g className="origin-[100px_240px] animate-[wiggle_1.6s_ease-in-out_infinite]">
              <path
                d="M 95 240 C 60 220 50 160 70 120 C 78 105 88 115 82 135 C 65 170 75 220 95 240 Z"
                fill="url(#furGradient)"
                filter="url(#shadowFilter)"
              />
            </g>
          )}

          {pet.species === 'fox' && (
            <g className="origin-[90px_240px] animate-[wiggle_2s_ease-in-out_infinite]">
              <path
                d="M 95 245 C 40 210 20 140 50 95 C 65 70 85 90 80 120 C 70 170 95 235 95 245 Z"
                fill="url(#furGradient)"
                filter="url(#shadowFilter)"
              />
              {/* Fox tail white fluffy tip */}
              <path
                d="M 50 95 C 65 70 85 90 80 120 C 65 105 55 100 50 95 Z"
                fill="#ffffff"
              />
            </g>
          )}

          {(pet.species === 'rabbit' || pet.species === 'bunny') && (
            <circle cx="85" cy="245" r="22" fill={fur.belly} filter="url(#shadowFilter)" />
          )}

          {pet.species === 'panda' && (
            <circle cx="90" cy="245" r="16" fill="#181622" filter="url(#shadowFilter)" />
          )}

          {/* 2. BODY & LEGS */}
          <g id="bodyGroup">
            {/* Seated feet / paws */}
            <ellipse cx="105" cy="275" rx="30" ry="18" fill="url(#furGradient)" filter="url(#shadowFilter)" />
            <ellipse cx="215" cy="275" rx="30" ry="18" fill="url(#furGradient)" filter="url(#shadowFilter)" />
            {/* Cute Paw Pads */}
            <ellipse cx="105" cy="276" rx="14" ry="9" fill={fur.accent} opacity="0.75" />
            <ellipse cx="215" cy="276" rx="14" ry="9" fill={fur.accent} opacity="0.75" />

            {/* Torso */}
            <path
              d="M 95 190 C 85 240 100 280 160 280 C 220 280 235 240 225 190 C 220 150 100 150 95 190 Z"
              fill={pet.species === 'panda' ? '#181622' : 'url(#furGradient)'}
              filter="url(#shadowFilter)"
            />

            {/* Belly patch */}
            <ellipse cx="160" cy="225" rx="44" ry="48" fill={pet.species === 'panda' ? '#f6f6fc' : 'url(#bellyGradient)'} />

            {/* Left & Right Paws resting / gesturing */}
            <ellipse cx="115" cy="205" rx="18" ry="24" fill={pet.species === 'panda' ? '#181622' : 'url(#furGradient)'} transform="rotate(15 115 205)" />
            <ellipse
              cx="205"
              cy={pet.currentAnimation === 'waving' ? '160' : '205'}
              rx="18"
              ry="24"
              fill={pet.species === 'panda' ? '#181622' : 'url(#furGradient)'}
              transform={pet.currentAnimation === 'waving' ? 'rotate(-45 205 160)' : 'rotate(-15 205 205)'}
              className={pet.currentAnimation === 'waving' ? 'animate-[wiggle_0.4s_ease-in-out_infinite]' : ''}
            />

            {/* Outfits Overlay */}
            {pet.accessories.outfit === 'cozy_hoodie' && (
              <g>
                <path d="M 94 195 C 86 240 102 278 160 278 C 218 278 234 240 226 195 C 220 170 100 170 94 195 Z" fill="#8b5cf6" />
                <path d="M 125 240 C 125 235 195 235 195 240 L 190 268 C 190 272 130 272 130 268 Z" fill="#7c3aed" stroke="#c4b5fd" strokeWidth="1.5" />
                <line x1="150" y1="188" x2="148" y2="215" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="148" cy="216" r="2.5" fill="#c4b5fd" />
                <line x1="170" y1="188" x2="172" y2="215" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="172" cy="216" r="2.5" fill="#c4b5fd" />
              </g>
            )}

            {pet.accessories.outfit === 'sailor_suit' && (
              <g>
                <path d="M 95 195 C 88 238 102 276 160 276 C 218 276 232 238 225 195 C 218 172 102 172 95 195 Z" fill="#f8fafc" />
                <path d="M 108 266 C 130 274 190 274 212 266 L 210 275 C 190 278 130 278 110 275 Z" fill="#1e3a8a" />
                <path d="M 115 180 L 135 220 L 160 195 L 185 220 L 205 180 Z" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                <path d="M 152 205 L 160 210 L 168 205 L 160 220 Z" fill="#ef4444" />
                <circle cx="160" cy="208" r="4" fill="#f87171" />
              </g>
            )}

            {pet.accessories.outfit === 'hero_cape' && (
              <g>
                <path d="M 98 185 C 55 210 45 280 75 300 C 110 285 130 275 140 265 C 105 240 98 200 98 185 Z" fill="#dc2626" className="origin-[98px_185px] animate-[wiggle_1.2s_ease-in-out_infinite]" />
                <path d="M 222 185 C 265 210 275 280 245 300 C 210 285 190 275 180 265 C 215 240 222 200 222 185 Z" fill="#b91c1c" className="origin-[222px_185px] animate-[wiggle_1.2s_ease-in-out_infinite]" />
                <circle cx="160" cy="215" r="14" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
                <text x="154" y="221" fontSize="16" fill="#78350f" fontWeight="bold">★</text>
              </g>
            )}

            {pet.accessories.outfit === 'knit_sweater' && (
              <g>
                <path d="M 93 195 C 85 240 100 278 160 278 C 220 278 235 240 227 195 C 220 170 100 170 93 195 Z" fill="#0d9488" />
                <path d="M 100 220 Q 160 230 220 220 L 222 232 Q 160 242 98 232 Z" fill="#ccfbf1" opacity="0.9" />
                <path d="M 104 246 Q 160 255 216 246 L 214 258 Q 160 266 106 258 Z" fill="#fef08a" opacity="0.9" />
                <path d="M 125 182 Q 160 192 195 182 L 195 192 Q 160 202 125 192 Z" fill="#0f766e" />
              </g>
            )}

            {pet.accessories.outfit === 'royal_robe' && (
              <g>
                <path d="M 90 195 C 80 245 96 282 160 282 C 224 282 240 245 230 195 C 222 170 98 170 90 195 Z" fill="#7f1d1d" />
                <path d="M 100 270 Q 160 284 220 270 L 222 282 Q 160 292 98 282 Z" fill="#ffffff" />
                <circle cx="120" cy="276" r="2" fill="#09090b" />
                <circle cx="140" cy="278" r="2" fill="#09090b" />
                <circle cx="160" cy="280" r="2" fill="#09090b" />
                <circle cx="180" cy="278" r="2" fill="#09090b" />
                <circle cx="200" cy="276" r="2" fill="#09090b" />
                <circle cx="160" cy="205" r="9" fill="#f59e0b" stroke="#fef08a" strokeWidth="2" />
                <text x="156" y="210" fontSize="12" fill="#451a03">👑</text>
              </g>
            )}

            {/* Held Item: Bamboo for Panda, Bone for Dog, Fish for Cat, Carrot for Rabbit, Berry for Fox */}
            {pet.currentAnimation === 'eating' && (
              <g transform="translate(195, 170)">
                {pet.species === 'panda' && <text fontSize="28">🎋</text>}
                {(pet.species === 'dog' || pet.species === 'puppy') && <text fontSize="28">🦴</text>}
                {(pet.species === 'cat' || pet.species === 'kitten') && <text fontSize="28">🐟</text>}
                {(pet.species === 'rabbit' || pet.species === 'bunny') && <text fontSize="28">🥕</text>}
                {pet.species === 'fox' && <text fontSize="28">🍓</text>}
              </g>
            )}

            {/* Interactive Play/Fetch Props */}
            {(pet.currentAnimation === 'playful' || pet.currentAnimation === 'fetching') && (
              <g transform="translate(225, 235)" className="animate-bounce">
                {(pet.species === 'dog' || pet.species === 'puppy') && <text fontSize="26">🎾</text>}
                {(pet.species === 'cat' || pet.species === 'kitten') && <text fontSize="26">🧶</text>}
                {(pet.species === 'rabbit' || pet.species === 'bunny') && <text fontSize="26">🥕</text>}
                {pet.species === 'fox' && <text fontSize="26">✨</text>}
                {pet.species === 'panda' && <text fontSize="26">🎋</text>}
              </g>
            )}

            {/* Sleeping Floating Zzz */}
            {pet.currentAnimation === 'sleeping' && (
              <g transform="translate(220, 110)" className="animate-float-gentle" opacity="0.85">
                <text x="0" y="0" fontSize="18" fill="#a78bfa" fontWeight="bold">z</text>
                <text x="12" y="-12" fontSize="22" fill="#c084fc" fontWeight="bold">Z</text>
                <text x="26" y="-28" fontSize="28" fill="#e879f9" fontWeight="bold">Z</text>
              </g>
            )}
          </g>

          {/* 3. HEAD & FACIAL FEATURES (with pointer tracking) */}
          <g
            id="headGroup"
            transform={`rotate(${headAngle} 160 135)`}
            className="transition-transform duration-150 ease-out"
          >
            {/* EARS BY SPECIES */}
            {/* Panda Ears */}
            {pet.species === 'panda' && (
              <>
                <circle cx="102" cy="78" r="28" fill="#181622" filter="url(#shadowFilter)" />
                <circle cx="102" cy="78" r="16" fill="#242033" />
                <circle cx="218" cy="78" r="28" fill="#181622" filter="url(#shadowFilter)" />
                <circle cx="218" cy="78" r="16" fill="#242033" />
              </>
            )}

            {/* Dog & Puppy Ears (Floppy & Animated) */}
            {(pet.species === 'dog' || pet.species === 'puppy') && (
              <>
                <path
                  d="M 98 90 C 70 80 50 130 70 170 C 85 185 105 160 102 120 Z"
                  fill="url(#furGradient)"
                  filter="url(#shadowFilter)"
                  className="origin-[98px_90px] animate-[wiggle_3s_ease-in-out_infinite]"
                />
                <path
                  d="M 222 90 C 250 80 270 130 250 170 C 235 185 215 160 218 120 Z"
                  fill="url(#furGradient)"
                  filter="url(#shadowFilter)"
                  className="origin-[222px_90px] animate-[wiggle_3s_ease-in-out_infinite]"
                />
              </>
            )}

            {/* Cat & Kitten Ears (Pointed with Pink Inners) */}
            {(pet.species === 'cat' || pet.species === 'kitten') && (
              <>
                <path d="M 95 110 L 85 45 L 140 85 Z" fill="url(#furGradient)" filter="url(#shadowFilter)" />
                <path d="M 100 102 L 95 58 L 132 86 Z" fill="#fda4af" opacity="0.8" />
                <path d="M 225 110 L 235 45 L 180 85 Z" fill="url(#furGradient)" filter="url(#shadowFilter)" />
                <path d="M 220 102 L 225 58 L 188 86 Z" fill="#fda4af" opacity="0.8" />
              </>
            )}

            {/* Rabbit & Bunny Ears (Tall & Expressive) */}
            {(pet.species === 'rabbit' || pet.species === 'bunny') && (
              <>
                <path
                  d="M 120 100 C 100 30 110 -15 130 -15 C 150 -15 155 30 140 100 Z"
                  fill="url(#furGradient)"
                  filter="url(#shadowFilter)"
                />
                <path d="M 124 88 C 112 35 120 0 130 0 C 140 0 144 35 136 88 Z" fill="#fbcfe8" />
                <path
                  d="M 200 100 C 180 30 185 -15 205 -15 C 225 -15 235 30 215 100 Z"
                  fill="url(#furGradient)"
                  filter="url(#shadowFilter)"
                />
                <path d="M 196 88 C 184 35 190 0 205 0 C 215 0 220 35 210 88 Z" fill="#fbcfe8" />
              </>
            )}

            {/* Fox Ears (Large Pointed with Black Outers) */}
            {pet.species === 'fox' && (
              <>
                <path d="M 90 115 L 75 35 L 145 80 Z" fill="#1e1b4b" filter="url(#shadowFilter)" />
                <path d="M 96 110 L 85 48 L 138 82 Z" fill="url(#furGradient)" />
                <path d="M 104 102 L 98 62 L 132 84 Z" fill="#ffffff" opacity="0.85" />
                <path d="M 230 115 L 245 35 L 175 80 Z" fill="#1e1b4b" filter="url(#shadowFilter)" />
                <path d="M 224 110 L 235 48 L 182 82 Z" fill="url(#furGradient)" />
                <path d="M 216 102 L 222 62 L 188 84 Z" fill="#ffffff" opacity="0.85" />
              </>
            )}

            {/* Main Head Base */}
            <ellipse
              cx="160"
              cy="135"
              rx={pet.species === 'puppy' || pet.species === 'kitten' ? '74' : '70'}
              ry={pet.species === 'puppy' || pet.species === 'kitten' ? '68' : '64'}
              fill={pet.species === 'panda' ? '#ffffff' : 'url(#furGradient)'}
              filter="url(#shadowFilter)"
            />

            {/* Panda Black Eye Patches */}
            {pet.species === 'panda' && (
              <>
                <ellipse cx="125" cy="130" rx="24" ry="30" fill="#181622" transform="rotate(-15 125 130)" />
                <ellipse cx="195" cy="130" rx="24" ry="30" fill="#181622" transform="rotate(15 195 130)" />
              </>
            )}

            {/* Fox White Muzzle/Cheek Patches */}
            {pet.species === 'fox' && (
              <>
                <path d="M 100 145 C 120 175 145 185 160 185 C 140 165 110 135 100 145 Z" fill="#ffffff" />
                <path d="M 220 145 C 200 175 175 185 160 185 C 180 165 210 135 220 145 Z" fill="#ffffff" />
              </>
            )}

            {/* Blushing Cheeks */}
            <ellipse cx="112" cy="155" rx="14" ry="8" fill="#f43f5e" opacity="0.35" />
            <ellipse cx="208" cy="155" rx="14" ry="8" fill="#f43f5e" opacity="0.35" />

            {/* EYES */}
            {isSleeping ? (
              // Sleeping curved gentle lines
              <>
                <path d="M 115 135 Q 128 145 140 135" stroke="#18181b" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 180 135 Q 192 145 205 135" stroke="#18181b" strokeWidth="4" strokeLinecap="round" fill="none" />
              </>
            ) : blinking ? (
              // Blink slits
              <>
                <line x1="118" y1="135" x2="138" y2="135" stroke="#18181b" strokeWidth="4" strokeLinecap="round" />
                <line x1="182" y1="135" x2="202" y2="135" stroke="#18181b" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              // Expressive round glassy eyes with pupil highlights
              <>
                {/* Left Eye */}
                <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                  <circle cx="128" cy="132" r="14" fill="#ffffff" />
                  <circle cx="128" cy="132" r="12" fill="url(#eyeReflection)" />
                  <circle cx="128" cy="132" r="7" fill="#09090b" />
                  {/* Highlights */}
                  <circle cx="124" cy="128" r="3.5" fill="#ffffff" />
                  <circle cx="131" cy="134" r="1.5" fill="#ffffff" />
                </g>

                {/* Right Eye */}
                <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                  <circle cx="192" cy="132" r="14" fill="#ffffff" />
                  <circle cx="192" cy="132" r="12" fill="url(#eyeReflection)" />
                  <circle cx="192" cy="132" r="7" fill="#09090b" />
                  {/* Highlights */}
                  <circle cx="188" cy="128" r="3.5" fill="#ffffff" />
                  <circle cx="195" cy="134" r="1.5" fill="#ffffff" />
                </g>
              </>
            )}

            {/* SNOUT & NOSE */}
            <ellipse cx="160" cy="155" rx="22" ry="16" fill={pet.species === 'panda' ? '#ffffff' : fur.belly} />
            {/* Cute nose */}
            <path
              d="M 152 148 C 156 146 164 146 168 148 C 166 156 154 156 152 148 Z"
              fill={pet.species === 'cat' || pet.species === 'kitten' || pet.species === 'rabbit' ? '#fda4af' : '#18181b'}
            />
            {/* Mouth */}
            <path d="M 160 154 L 160 160" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 152 160 Q 160 166 168 160" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Whiskers for Cat, Kitten, Rabbit, Bunny, Fox */}
            {(pet.species === 'cat' || pet.species === 'kitten' || pet.species === 'rabbit' || pet.species === 'bunny' || pet.species === 'fox') && (
              <g stroke="#94a3b8" strokeWidth="1.5" opacity="0.6">
                <line x1="105" y1="150" x2="135" y2="154" />
                <line x1="100" y1="160" x2="135" y2="160" />
                <line x1="185" y1="154" x2="215" y2="150" />
                <line x1="185" y1="160" x2="220" y2="160" />
              </g>
            )}

            {/* 4. ACCESSORIES OVERLAY */}
            {/* Glasses */}
            {pet.accessories.glasses && (
              <g stroke="#fbbf24" strokeWidth="3.5" fill="rgba(255,255,255,0.15)">
                <circle cx="128" cy="132" r="19" />
                <circle cx="192" cy="132" r="19" />
                <line x1="147" y1="132" x2="173" y2="132" />
                <line x1="109" y1="130" x2="95" y2="120" />
                <line x1="211" y1="130" x2="225" y2="120" />
              </g>
            )}

            {/* Zen Headband */}
            {pet.accessories.zenHeadband && (
              <g>
                <path d="M 92 105 Q 160 90 228 105" stroke="#a855f7" strokeWidth="12" strokeLinecap="round" fill="none" />
                <circle cx="160" cy="98" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}

            {/* Hats */}
            {pet.accessories.hat === 'wizard_hat' && (
              <g transform="translate(160, 75) rotate(-5)">
                <ellipse cx="0" cy="10" rx="60" ry="12" fill="#4338ca" />
                <polygon points="0,-75 -35,5 35,5" fill="#6366f1" />
                <polygon points="0,-75 -15,-20 15,-20" fill="#4f46e5" />
                <text x="-6" y="-30" fontSize="16" fill="#fbbf24">⭐</text>
                <circle cx="0" cy="-75" r="7" fill="#fbbf24" />
              </g>
            )}

            {pet.accessories.hat === 'sun_hat' && (
              <g transform="translate(160, 80)">
                <ellipse cx="0" cy="5" rx="68" ry="15" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                <path d="M -30 5 C -35 -25 35 -25 30 5 Z" fill="#fde047" />
                <path d="M -32 5 Q 0 0 32 5" stroke="#f43f5e" strokeWidth="5" fill="none" />
              </g>
            )}

            {pet.accessories.hat === 'party_hat' && (
              <g transform="translate(160, 72) rotate(6)">
                <polygon points="0,-65 -28,8 28,8" fill="#ec4899" />
                <path d="M -22 -10 L 22 -30" stroke="#fef08a" strokeWidth="5" />
                <path d="M -15 -35 L 15 -55" stroke="#38bdf8" strokeWidth="5" />
                <circle cx="0" cy="-68" r="7" fill="#fef08a" />
              </g>
            )}

            {(pet.accessories.hat === 'bamboo_crown' || pet.accessories.bambooCrown) && (
              <g transform="translate(160, 75)">
                <text x="-35" y="0" fontSize="26">🌿</text>
                <text x="5" y="0" fontSize="26">🌿</text>
              </g>
            )}

            {pet.accessories.hat === 'flower_crown' && (
              <g transform="translate(160, 85)">
                <path d="M -45 5 Q 0 -15 45 5" stroke="#10b981" strokeWidth="4" fill="none" />
                <text x="-40" y="2" fontSize="20">🌸</text>
                <text x="-15" y="-6" fontSize="22">🌼</text>
                <text x="10" y="-8" fontSize="24">🌺</text>
                <text x="32" y="2" fontSize="18">🌸</text>
              </g>
            )}

            {pet.accessories.hat === 'detective_hat' && (
              <g transform="translate(160, 80)">
                <ellipse cx="0" cy="5" rx="60" ry="12" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <path d="M -42 5 C -45 -35 45 -35 42 5 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
                <path d="M -2 5 L -2 -34" stroke="#d97706" strokeWidth="3" />
                <path d="M -35 -14 Q 0 -22 35 -14" stroke="#d97706" strokeWidth="3" fill="none" />
                <path d="M -15 -35 Q 0 -45 15 -35" stroke="#451a03" strokeWidth="4" fill="none" />
                <circle cx="0" cy="-38" r="4" fill="#b45309" />
              </g>
            )}

            {/* Bow on Ear or Collar */}
            {pet.accessories.bow && (
              <g transform="translate(160, 185)">
                <path d="M -15 -8 L 0 0 L -15 8 Z" fill="#ec4899" />
                <path d="M 15 -8 L 0 0 L 15 8 Z" fill="#ec4899" />
                <circle cx="0" cy="0" r="5" fill="#f43f5e" />
              </g>
            )}

            {/* Collar with Golden Bell */}
            {pet.accessories.collar && (
              <g>
                <path d="M 115 180 Q 160 195 205 180" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" fill="none" />
                <circle cx="160" cy="190" r="8" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1.5" />
                <circle cx="160" cy="192" r="2" fill="#78350f" />
              </g>
            )}

            {/* Cozy Lavender Scarf */}
            {(pet.accessories.scarf || pet.accessories.cozyScarf) && (
              <g>
                <path d="M 110 178 Q 160 200 210 178" stroke="#a855f7" strokeWidth="16" strokeLinecap="round" fill="none" />
                <path d="M 180 188 L 188 230" stroke="#9333ea" strokeWidth="12" strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
