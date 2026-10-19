import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, RotateCcw, Save, X, Volume2, VolumeX, Palette, Eye, Shirt, Image as ImageIcon, Smile, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PetProfile, PetSpecies, PetPersonality, RoomBackground, PetAccessories, AppSettings } from '../types';
import { UniversalPetCanvas } from '../components/UniversalPetCanvas';
import { playSound } from '../utils/audio';

interface PetCustomizationStudioProps {
  pet: PetProfile;
  settings: AppSettings;
  onSavePet: (updatedPet: PetProfile) => void;
  onBack: () => void;
}

const BREED_OPTIONS: Record<PetSpecies, string[]> = {
  panda: ['Qinling Panda', 'Giant Bamboo Panda', 'Fluffy Panda Cub'],
  dog: ['Golden Retriever', 'Shiba Inu', 'Siberian Husky', 'German Shepherd'],
  puppy: ['Corgi Pup', 'Beagle Pup', 'Little Poodle', 'Golden Puppy'],
  cat: ['Calico Shorthair', 'Tabby Cat', 'Siamese Cat', 'Scottish Fold'],
  kitten: ['Munchkin Fluff', 'Ginger Kitten', 'Cloud White Kitten'],
  rabbit: ['Dutch Rabbit', 'Angora Rabbit', 'Lop-eared Rabbit'],
  bunny: ['Mini Lop Bunny', 'Honey Bunny', 'Snowball Bunny'],
  fox: ['Red Woodland Fox', 'Arctic White Fox', 'Silver Star Fox'],
};

const FUR_COLORS = [
  { id: 'white', name: 'Snow White', hex: '#f8fafc' },
  { id: 'black', name: 'Obsidian Black', hex: '#1e1b4b' },
  { id: 'golden', name: 'Golden Honey', hex: '#f59e0b' },
  { id: 'brown', name: 'Chestnut Brown', hex: '#854d0e' },
  { id: 'grey', name: 'Silver Grey', hex: '#64748b' },
  { id: 'cream', name: 'Vanilla Cream', hex: '#fef08a' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ea580c' },
  { id: 'chocolate', name: 'Warm Chocolate', hex: '#451a03' },
];

const EYE_COLORS = [
  { id: 'hazel', name: 'Warm Hazel', hex: '#b45309' },
  { id: 'sapphire', name: 'Sapphire Blue', hex: '#38bdf8' },
  { id: 'emerald', name: 'Emerald Green', hex: '#10b981' },
  { id: 'amber', name: 'Golden Amber', hex: '#f59e0b' },
  { id: 'ruby', name: 'Ruby Blossom', hex: '#f43f5e' },
  { id: 'obsidian', name: 'Obsidian Night', hex: '#09090b' },
];

const OUTFIT_OPTIONS = [
  { id: 'none', label: 'No Outfit', icon: '✨', desc: 'Natural fluffy coat' },
  { id: 'cozy_hoodie', label: 'Cozy Hoodie', icon: '💜', desc: 'Lavender fleece with pocket' },
  { id: 'sailor_suit', label: 'Sailor Suit', icon: '⚓', desc: 'Classic navy nautical trim' },
  { id: 'hero_cape', label: 'Hero Cape', icon: '🦸', desc: 'Flapping crimson superhero cape' },
  { id: 'knit_sweater', label: 'Knit Sweater', icon: '🧶', desc: 'Warm teal striped knit' },
  { id: 'royal_robe', label: 'Royal Robe', icon: '👑', desc: 'Velvet mantle with golden medal' },
];

const ROOM_BACKGROUNDS: { id: RoomBackground; name: string; icon: string; preview: string }[] = [
  { id: 'bedroom', name: 'Bamboo Sanctuary', icon: '🏮', preview: '/src/assets/images/room_zen_bamboo_haven_1792338723945.jpg' },
  { id: 'garden', name: 'Wisteria Garden', icon: '🌸', preview: '/src/assets/images/bg_garden_blooms_1792343259529.jpg' },
  { id: 'beach', name: 'Sunset Beach', icon: '🏖️', preview: '/src/assets/images/bg_beach_sunset_1792343259631.jpg' },
  { id: 'magical_forest', name: 'Magical Forest', icon: '✨', preview: '/src/assets/images/bg_magical_forest_1792343260427.jpg' },
  { id: 'space_room', name: 'Space Observatory', icon: '🚀', preview: '/src/assets/images/bg_space_observatory_1792343261426.jpg' },
];

const PERSONALITY_OPTIONS: { id: PetPersonality; name: string; desc: string; icon: string }[] = [
  { id: 'playful', name: 'Playful', desc: 'High spirits, bouncy hops, and cheerful banter', icon: '🎾' },
  { id: 'calm', name: 'Calm', desc: 'Serene, peaceful presence for relaxing work', icon: '🍵' },
  { id: 'sleepy', name: 'Sleepy', desc: 'Loves soft naps, cozy cushions, and warm lullabies', icon: '🌙' },
  { id: 'energetic', name: 'Energetic', desc: 'Infectious motivation and goal celebration', icon: '⚡' },
  { id: 'study_buddy', name: 'Study Buddy', desc: 'Disciplined companion for focused sprints', icon: '📚' },
];

export const PetCustomizationStudio: React.FC<PetCustomizationStudioProps> = ({
  pet,
  settings,
  onSavePet,
  onBack,
}) => {
  // Staged local state for live preview before saving
  const [stagedPet, setStagedPet] = useState<PetProfile>({ ...pet });
  const [activeTab, setActiveTab] = useState<'appearance' | 'accessories' | 'room' | 'personality'>('appearance');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const availableBreeds = BREED_OPTIONS[stagedPet.species] || BREED_OPTIONS.panda;

  const handleApply = () => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onSavePet(stagedPet);
    setStatusNotice('Changes applied to your companion!');
    setTimeout(() => setStatusNotice(null), 2500);
  };

  const handleSaveAndExit = () => {
    playSound('victory', settings.soundVolume, settings.soundEnabled);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    onSavePet(stagedPet);
    onBack();
  };

  const handleResetToDefault = () => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    setStagedPet((prev) => ({
      ...prev,
      furColor: prev.species === 'panda' ? 'white' : 'golden',
      eyeColor: prev.species === 'panda' ? 'dark' : 'hazel',
      accessories: {
        hat: 'none',
        glasses: false,
        bow: false,
        collar: false,
        scarf: false,
        zenHeadband: false,
        bambooCrown: false,
        outfit: 'none',
      },
    }));
    setStatusNotice('Visual appearance reset to default!');
    setTimeout(() => setStatusNotice(null), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pet Customization Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize {stagedPet.name}'s fur, eyes, wardrobe accessories, and sanctuary room.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="mb-4 bg-purple-900/40 border border-purple-400 text-purple-200 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Studio Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Character Preview (5 columns) */}
        <div className="lg:col-span-5 bg-[#120f26] border border-purple-500/25 rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
          {/* Room backdrop preview */}
          <div className="absolute inset-0 z-0">
            <img
              src={ROOM_BACKGROUNDS.find((b) => b.id === stagedPet.roomBackground)?.preview || ROOM_BACKGROUNDS[0].preview}
              alt="Room preview"
              className="w-full h-full object-cover opacity-25 filter brightness-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120f26] via-[#120f26]/60 to-transparent" />
          </div>

          {/* Live Preview Label & Pet Name */}
          <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</span>
            </div>
            <span className="text-xs text-purple-300 font-semibold">{stagedPet.breed}</span>
          </div>

          {/* Character Canvas Component */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center my-2">
            <UniversalPetCanvas
              pet={stagedPet}
              onPetClick={() => {
                playSound('squeak', settings.soundVolume, settings.soundEnabled);
                setStagedPet((p) => ({ ...p, currentAnimation: 'happy_bouncing' }));
                setTimeout(() => setStagedPet((p) => ({ ...p, currentAnimation: 'idle' })), 2500);
              }}
              onPetPet={() => {
                playSound('purr', settings.soundVolume, settings.soundEnabled);
                setStagedPet((p) => ({ ...p, currentAnimation: 'waving' }));
                setTimeout(() => setStagedPet((p) => ({ ...p, currentAnimation: 'idle' })), 2500);
              }}
              soundEnabled={stagedPet.soundsEnabled}
              soundVolume={settings.soundVolume}
            />
          </div>

          {/* Live Interactive Action Strip */}
          <div className="relative z-10 w-full flex items-center justify-between gap-2 pt-3 border-t border-purple-900/40">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl border border-purple-900/40 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Reset visual traits to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
              <button
                onClick={handleSaveAndExit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Finish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls (7 columns) */}
        <div className="lg:col-span-7 bg-[#120f26] border border-purple-500/25 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          {/* Functional Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#151130] border border-purple-900/40 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'appearance'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('accessories')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'accessories'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Accessories</span>
            </button>

            <button
              onClick={() => setActiveTab('room')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'room'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Sanctuary</span>
            </button>

            <button
              onClick={() => setActiveTab('personality')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'personality'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Personality</span>
            </button>
          </div>

          {/* TAB 1: APPEARANCE (Name, Breed, Fur, Eyes) */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Pet Name input */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Pet Name
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={stagedPet.name}
                  onChange={(e) => setStagedPet({ ...stagedPet, name: e.target.value })}
                  placeholder="Companion name"
                  className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400 font-medium"
                />
              </div>

              {/* Breed Selector */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Appearance / Breed Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableBreeds.map((breed) => {
                    const isSelected = stagedPet.breed === breed;
                    return (
                      <button
                        key={breed}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({ ...stagedPet, breed });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:text-slate-200 hover:border-purple-800'
                        }`}
                      >
                        {breed}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fur Colors */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Fur Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FUR_COLORS.map((c) => {
                    const isSelected = stagedPet.furColor === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({ ...stagedPet, furColor: c.id });
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-medium truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Eye Colors */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Eye Style & Iris Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EYE_COLORS.map((eye) => {
                    const isSelected = stagedPet.eyeColor === eye.id;
                    return (
                      <button
                        key={eye.id}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({ ...stagedPet, eyeColor: eye.id });
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs shrink-0"
                          style={{ backgroundColor: eye.hex }}
                        />
                        <span className="text-xs font-medium truncate">{eye.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCESSORIES (Hats, Bows, Collars, Glasses, Scarves) */}
          {activeTab === 'accessories' && (
            <div className="space-y-5">
              {/* Hats */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Hats & Crowns
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'none', label: 'No Hat', icon: '✨' },
                    { id: 'wizard_hat', label: 'Wizard Hat', icon: '🧙' },
                    { id: 'sun_hat', label: 'Summer Sun Hat', icon: '👒' },
                    { id: 'party_hat', label: 'Party Cone', icon: '🎉' },
                    { id: 'bamboo_crown', label: 'Bamboo Crown', icon: '🌿' },
                    { id: 'flower_crown', label: 'Flower Crown', icon: '🌸' },
                    { id: 'detective_hat', label: 'Detective Cap', icon: '🕵️' },
                  ].map((hat) => {
                    const isSelected = stagedPet.accessories.hat === hat.id;
                    return (
                      <button
                        key={hat.id}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({
                            ...stagedPet,
                            accessories: {
                              ...stagedPet.accessories,
                              hat: hat.id as PetAccessories['hat'],
                            },
                          });
                        }}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <span className="text-xl">{hat.icon}</span>
                        <span className="text-xs font-semibold truncate">{hat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wearable Accessories (Toggles) */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Accessories & Jewelry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'glasses' as keyof PetAccessories, label: 'Scholar Glasses', icon: '👓' },
                    { key: 'collar' as keyof PetAccessories, label: 'Bell Collar', icon: '🔔' },
                    { key: 'bow' as keyof PetAccessories, label: 'Silk Bow Tie', icon: '🎀' },
                    { key: 'scarf' as keyof PetAccessories, label: 'Lavender Scarf', icon: '🧣' },
                    { key: 'zenHeadband' as keyof PetAccessories, label: 'Zen Headband', icon: '🪢' },
                  ].map((item) => {
                    const isEquipped = !!stagedPet.accessories[item.key];
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({
                            ...stagedPet,
                            accessories: {
                              ...stagedPet.accessories,
                              [item.key]: !isEquipped,
                            },
                          });
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-xs font-semibold truncate">{item.label}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isEquipped ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isEquipped ? 'On' : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cute Outfits & Costumes */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  Cute Outfits & Costumes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {OUTFIT_OPTIONS.map((outfit) => {
                    const isSelected = (stagedPet.accessories.outfit || 'none') === outfit.id;
                    return (
                      <button
                        key={outfit.id}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({
                            ...stagedPet,
                            accessories: {
                              ...stagedPet.accessories,
                              outfit: outfit.id as PetAccessories['outfit'],
                            },
                          });
                        }}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{outfit.icon}</span>
                          <span className="text-xs font-bold text-white truncate">{outfit.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight">{outfit.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANCTUARY ROOM (Bedroom, Garden, Beach, Magical Forest, Space Room) */}
          {activeTab === 'room' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                Sanctuary Environment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROOM_BACKGROUNDS.map((bg) => {
                  const isSelected = stagedPet.roomBackground === bg.id;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => {
                        playSound('pop', settings.soundVolume, settings.soundEnabled);
                        setStagedPet({ ...stagedPet, roomBackground: bg.id });
                      }}
                      className={`relative h-24 rounded-2xl border overflow-hidden p-3 flex flex-col justify-end text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                          : 'border-purple-900/30 hover:border-purple-600'
                      }`}
                    >
                      <img
                        src={bg.preview}
                        alt={bg.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{bg.icon}</span>
                          <span>{bg.name}</span>
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PERSONALITY & SOUNDS */}
          {activeTab === 'personality' && (
            <div className="space-y-5">
              {/* Personality Archetype */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                  Companion Personality
                </label>
                <div className="space-y-2">
                  {PERSONALITY_OPTIONS.map((p) => {
                    const isSelected = stagedPet.personality === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          playSound('pop', settings.soundVolume, settings.soundEnabled);
                          setStagedPet({ ...stagedPet, personality: p.id });
                        }}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-400 text-white shadow-sm'
                            : 'bg-slate-900/50 border-purple-900/20 text-slate-400 hover:border-purple-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{p.name}</div>
                            <div className="text-[11px] text-slate-400">{p.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sounds Toggle & Audio Test */}
              <div className="bg-slate-900/60 border border-purple-900/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {stagedPet.soundsEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    <span>Pet Interaction Audio</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Species-specific squeaks, barks, meows, and purrs</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const soundType =
                        stagedPet.species === 'dog' || stagedPet.species === 'puppy'
                          ? 'dog_bark'
                          : stagedPet.species === 'cat' || stagedPet.species === 'kitten'
                          ? 'cat_meow'
                          : stagedPet.species === 'rabbit' || stagedPet.species === 'bunny'
                          ? 'rabbit_hop'
                          : stagedPet.species === 'fox'
                          ? 'fox_yip'
                          : 'squeak';
                      playSound(soundType, settings.soundVolume, true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Test audio sound"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Sound</span>
                  </button>

                  <button
                    onClick={() =>
                      setStagedPet((prev) => ({ ...prev, soundsEnabled: !prev.soundsEnabled }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      stagedPet.soundsEnabled ? 'bg-purple-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                        stagedPet.soundsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
