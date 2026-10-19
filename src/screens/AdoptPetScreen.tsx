import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Heart, Shield, Play, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetSpecies, PetProfile, AppSettings, PetPersonality, PandaAnimation } from '../types';
import { UniversalPetCanvas } from '../components/UniversalPetCanvas';
import { playSound } from '../utils/audio';

interface AdoptPetScreenProps {
  currentPet: PetProfile;
  settings: AppSettings;
  onSelectPet: (newSpecies: PetSpecies, defaultName: string, breed: string, personality: PetPersonality) => void;
  onBack: () => void;
}

interface PetOption {
  species: PetSpecies;
  title: string;
  defaultName: string;
  breed: string;
  personality: PetPersonality;
  tagline: string;
  description: string;
  icon: string;
  defaultFur: string;
  defaultEye: string;
  signatureAnim: PandaAnimation;
  signatureLabel: string;
  speciesSound: 'squeak' | 'dog_bark' | 'cat_meow' | 'rabbit_hop' | 'fox_yip';
}

const PET_OPTIONS: PetOption[] = [
  {
    species: 'panda',
    title: 'Giant Panda',
    defaultName: 'BaoBao',
    breed: 'Qinling Panda',
    personality: 'playful',
    tagline: 'Peaceful, cuddly bamboo connoisseur',
    description: 'Brimming with gentle wisdom, loves cozy naps and crunchy fresh bamboo treats.',
    icon: '🐼',
    defaultFur: 'white',
    defaultEye: 'dark',
    signatureAnim: 'eating',
    signatureLabel: 'Bamboo Feast',
    speciesSound: 'squeak',
  },
  {
    species: 'dog',
    title: 'Loyal Dog',
    defaultName: 'Barnaby',
    breed: 'Golden Retriever',
    personality: 'energetic',
    tagline: 'Loyal adventure companion & fetch champion',
    description: 'Always excited to see you, wags tail furiously and celebrates every completed task.',
    icon: '🐕',
    defaultFur: 'golden',
    defaultEye: 'amber',
    signatureAnim: 'fetching',
    signatureLabel: 'Fetch Tennis Ball',
    speciesSound: 'dog_bark',
  },
  {
    species: 'cat',
    title: 'Cozy Cat',
    defaultName: 'Luna',
    breed: 'Calico Shorthair',
    personality: 'calm',
    tagline: 'Zen study partner & gentle purr machine',
    description: 'Perches beside your desk during deep focus sessions with soothing melodic purrs.',
    icon: '🐈',
    defaultFur: 'orange',
    defaultEye: 'emerald',
    signatureAnim: 'stretching',
    signatureLabel: 'Cat Stretch',
    speciesSound: 'cat_meow',
  },
  {
    species: 'rabbit',
    title: 'Fluffy Rabbit',
    defaultName: 'Clover',
    breed: 'Dutch Rabbit',
    personality: 'calm',
    tagline: 'Gentle soul with twitchy ears and hops',
    description: 'Quiet and serene, brings peace to stressful work hours and loves crunchy carrots.',
    icon: '🐇',
    defaultFur: 'white',
    defaultEye: 'ruby',
    signatureAnim: 'hopping',
    signatureLabel: 'Energetic Hops',
    speciesSound: 'rabbit_hop',
  },
  {
    species: 'fox',
    title: 'Mystic Fox',
    defaultName: 'Kitsune',
    breed: 'Red Woodland Fox',
    personality: 'playful',
    tagline: 'Clever, lively spirit with majestic bushy tail',
    description: 'Playfully curious, sparks creative thinking and loves exploring new ideas.',
    icon: '🦊',
    defaultFur: 'orange',
    defaultEye: 'amber',
    signatureAnim: 'tail_wagging',
    signatureLabel: 'Tail Swish',
    speciesSound: 'fox_yip',
  },
  {
    species: 'kitten',
    title: 'Tiny Kitten',
    defaultName: 'Mochi',
    breed: 'Munchkin Fluff',
    personality: 'playful',
    tagline: 'Boundless curiosity and soft squeaky meows',
    description: 'Oversized glossy eyes and playful paws that swipe at falling leaves and yarn balls.',
    icon: '🐱',
    defaultFur: 'cream',
    defaultEye: 'sapphire',
    signatureAnim: 'playful',
    signatureLabel: 'Yarn Play',
    speciesSound: 'cat_meow',
  },
  {
    species: 'puppy',
    title: 'Bouncy Puppy',
    defaultName: 'Pip',
    breed: 'Corgi Pup',
    personality: 'energetic',
    tagline: 'Pure joy, tail wiggles, and happy hops',
    description: 'Infectious positive energy that turns any dull study day into a delightful adventure.',
    icon: '🐶',
    defaultFur: 'brown',
    defaultEye: 'hazel',
    signatureAnim: 'happy_bouncing',
    signatureLabel: 'Happy Bouncing',
    speciesSound: 'dog_bark',
  },
  {
    species: 'bunny',
    title: 'Cloud Bunny',
    defaultName: 'Snowdrop',
    breed: 'Mini Lop Bunny',
    personality: 'sleepy',
    tagline: 'Velvet marshmallow softness & gentle naps',
    description: 'Loves soft blankets, lavender tea time, and drifting off into peaceful dreamland.',
    icon: '🐰',
    defaultFur: 'white',
    defaultEye: 'ruby',
    signatureAnim: 'hopping',
    signatureLabel: 'Cloud Hops',
    speciesSound: 'rabbit_hop',
  },
];

export const AdoptPetScreen: React.FC<AdoptPetScreenProps> = ({
  currentPet,
  settings,
  onSelectPet,
  onBack,
}) => {
  const [selectedToAdopt, setSelectedToAdopt] = useState<PetOption | null>(null);
  const [cardAnimations, setCardAnimations] = useState<Record<PetSpecies, PandaAnimation>>({
    panda: 'idle',
    dog: 'idle',
    cat: 'idle',
    rabbit: 'idle',
    fox: 'idle',
    kitten: 'idle',
    puppy: 'idle',
    bunny: 'idle',
  });

  const handleTriggerCardPreview = (item: PetOption) => {
    playSound(item.speciesSound, settings.soundVolume, settings.soundEnabled);
    setCardAnimations((prev) => ({
      ...prev,
      [item.species]: item.signatureAnim,
    }));

    setTimeout(() => {
      setCardAnimations((prev) => ({
        ...prev,
        [item.species]: 'idle',
      }));
    }, 2800);
  };

  const handleConfirmAdoption = () => {
    if (!selectedToAdopt) return;

    playSound('victory', settings.soundVolume, settings.soundEnabled);
    confetti({
      particleCount: 70,
      spread: 85,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#fbbf24', '#38bdf8'],
    });

    onSelectPet(
      selectedToAdopt.species,
      selectedToAdopt.defaultName,
      selectedToAdopt.breed,
      selectedToAdopt.personality
    );
    setSelectedToAdopt(null);
  };

  // Helper to build a lightweight PetProfile for canvas rendering
  const makePreviewPet = (item: PetOption): PetProfile => ({
    species: item.species,
    breed: item.breed,
    name: item.defaultName,
    furColor: item.defaultFur,
    eyeColor: item.defaultEye,
    roomBackground: 'bedroom',
    personality: item.personality,
    currentAnimation: cardAnimations[item.species] || 'idle',
    currentMood: 'happy',
    speechText: null,
    daysTogether: 1,
    treatsFedCount: 0,
    focusMinutesTotal: 0,
    miniGameHighScore: 0,
    soundsEnabled: true,
    stats: { happiness: 100, energy: 95, fullness: 90, friendshipExp: 0, friendshipLevel: 1 },
    accessories: { hat: 'none', glasses: false, bow: false, collar: false, scarf: false, zenHeadband: false },
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Adopt Your Companion</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose from 8 distinct animated companions. Your schedules, tasks, and streaks stay safe!
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sanctuary</span>
        </button>
      </div>

      {/* Grid of 8 Pet Species Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {PET_OPTIONS.map((item) => {
          const isCurrent = currentPet.species === item.species;
          const previewPet = makePreviewPet(item);
          const isAnimating = cardAnimations[item.species] !== 'idle';

          return (
            <div
              key={item.species}
              className={`bg-[#120f26] border rounded-3xl p-4 flex flex-col justify-between transition-all duration-200 relative group hover:scale-[1.01] ${
                isCurrent
                  ? 'border-purple-400 shadow-xl shadow-purple-950/50 bg-[#161230]'
                  : 'border-purple-900/30 hover:border-purple-600/50'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-3 right-3 z-20 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3" />
                  <span>Current Pet</span>
                </div>
              )}

              {/* Animated Character Preview Container */}
              <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-[#181335] to-[#0c091d] border border-purple-900/30 overflow-hidden flex items-center justify-center mb-3 group-hover:border-purple-500/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-pink-500/10 pointer-events-none" />
                <div className="w-40 h-40 scale-75 transform transition-transform group-hover:scale-80">
                  <UniversalPetCanvas
                    pet={previewPet}
                    onPetClick={() => handleTriggerCardPreview(item)}
                    onPetPet={() => handleTriggerCardPreview(item)}
                    soundEnabled={settings.soundEnabled}
                    soundVolume={settings.soundVolume}
                  />
                </div>

                {/* Preview Animation Pill Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerCardPreview(item);
                  }}
                  className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-md cursor-pointer transition-all ${
                    isAnimating
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-slate-900/80 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30'
                  }`}
                  title={`Preview ${item.signatureLabel}`}
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>{item.signatureLabel}</span>
                </button>
              </div>

              {/* Identity & Personality Details */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {item.breed}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 font-medium capitalize">
                    {item.personality}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-1.5">
                  <span>{item.title}</span>
                  <span className="text-sm font-normal text-slate-400">({item.defaultName})</span>
                </h3>

                <p className="text-xs text-amber-300/90 font-medium mt-1">
                  "{item.tagline}"
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Adoption CTA button */}
              <div className="pt-3 mt-3 border-t border-purple-900/30">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-purple-900/30 text-purple-300 text-xs font-semibold cursor-default"
                  >
                    Adopted & Active
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      playSound('pop', settings.soundVolume, settings.soundEnabled);
                      setSelectedToAdopt(item);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Adopt {item.title}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Step Modal before replacing current pet */}
      {selectedToAdopt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#120f26] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center">
            {/* Modal Character Preview */}
            <div className="w-36 h-36 mx-auto mb-2 flex items-center justify-center">
              <UniversalPetCanvas
                pet={makePreviewPet(selectedToAdopt)}
                onPetClick={() => handleTriggerCardPreview(selectedToAdopt)}
                onPetPet={() => handleTriggerCardPreview(selectedToAdopt)}
                soundEnabled={settings.soundEnabled}
                soundVolume={settings.soundVolume}
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Adopt {selectedToAdopt.title}?
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Switch your companion from <span className="font-semibold text-purple-200">{currentPet.name}</span> to a cute new <span className="font-semibold text-purple-200">{selectedToAdopt.title}</span> named <span className="font-semibold text-purple-200">{selectedToAdopt.defaultName}</span>.
            </p>

            <div className="bg-purple-950/40 border border-purple-900/50 rounded-2xl p-3.5 mb-5 text-left flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-snug">
                <span className="font-semibold text-white">Your Progress Is Safe:</span> All daily schedules, study tasks, streak counts, and milestones will stay completely intact!
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedToAdopt(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-900/40 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdoption}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-950/40"
              >
                Confirm Adoption ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
