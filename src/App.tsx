import React, { useState, useEffect } from 'react';
import {
  PetProfile,
  PetSpecies,
  PetPersonality,
  AppSettings,
  ActiveScreen,
  DailyTask,
  ScheduleReminder,
  ChatMessage,
  Achievement,
  PandaAnimation,
  DailyReport,
} from './types';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './screens/OnboardingModal';
import { MainPetRoom } from './screens/MainPetRoom';
import { InteractionScreen } from './screens/InteractionScreen';
import { DailyScheduleScreen } from './screens/DailyScheduleScreen';
import { FocusModeScreen } from './screens/FocusModeScreen';
import { AiChatScreen } from './screens/AiChatScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdoptPetScreen } from './screens/AdoptPetScreen';
import { PetCustomizationStudio } from './screens/PetCustomizationStudio';
import { playSound } from './utils/audio';
import { useDeviceBattery } from './hooks/useDeviceBattery';
import {
  STORAGE_KEYS,
  loadStoredData,
  saveStoredData,
  checkDailyReset,
  exportUserData,
  getTodayDateKey,
} from './services/storageService';

const INITIAL_PANDA: PetProfile = {
  species: 'panda',
  breed: 'Qinling Panda',
  name: 'BaoBao',
  furColor: 'white',
  eyeColor: 'obsidian',
  roomBackground: 'bedroom',
  personality: 'playful',
  currentAnimation: 'idle',
  currentMood: 'happy',
  speechText: 'Welcome home! BaoBao was waiting for you! 🐾',
  daysTogether: 7,
  lastCheckInDate: getTodayDateKey(),
  dailyRewardClaimed: false,
  treatsFedCount: 42,
  focusMinutesTotal: 125,
  miniGameHighScore: 180,
  soundsEnabled: true,
  stats: {
    happiness: 92,
    energy: 84,
    fullness: 86,
    friendshipExp: 380,
    friendshipLevel: 14,
  },
  accessories: {
    hat: 'bamboo_crown',
    glasses: false,
    bow: false,
    collar: false,
    scarf: false,
    zenHeadband: false,
    bambooCrown: true,
  },
};

const INITIAL_TASKS: DailyTask[] = [
  {
    id: '1',
    title: 'Python Practice: Algorithms & Data Structures',
    category: 'study',
    startTime: '18:00',
    endTime: '19:00',
    recurring: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    completed: false,
    rewardXp: 25,
    notes: 'Implement two pointer & tree traversal problems',
  },
  {
    id: '2',
    title: 'Sanctuary Break & Warm Green Tea',
    category: 'wellness',
    startTime: '19:00',
    endTime: '19:15',
    recurring: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    completed: false,
    rewardXp: 10,
    notes: 'Stretch arms and rest eyes with companion',
  },
  {
    id: '3',
    title: 'English Vocabulary & Pronunciation Practice',
    category: 'study',
    startTime: '19:15',
    endTime: '20:00',
    recurring: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    completed: false,
    rewardXp: 25,
    notes: 'Read 2 articles aloud and review 10 idioms',
  },
  {
    id: '4',
    title: 'Feed companion fresh delicious snack',
    category: 'pet',
    startTime: '20:00',
    endTime: '20:10',
    recurring: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    completed: true,
    rewardXp: 15,
  },
  {
    id: '5',
    title: 'Evening reflection & sleep preparation',
    category: 'habit',
    startTime: '22:00',
    endTime: '22:30',
    recurring: true,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    completed: false,
    rewardXp: 20,
  },
];

const INITIAL_REMINDERS: ScheduleReminder[] = [
  { id: 'r1', title: '6:00 PM Python Study Session', time: '18:00', category: 'focus', completed: false },
  { id: 'r2', title: 'Posture check & stretch break', time: '19:00', category: 'break', completed: false },
  { id: 'r3', title: 'Mini-game tournament & treats', time: '20:15', category: 'fun', completed: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Snack Connoisseur', description: 'Fed 40+ delicious treats to your pet companion', unlocked: true, icon: '🎋', progress: 42, maxProgress: 40, dateUnlocked: 'Oct 2026' },
  { id: 'a2', title: 'Zen Focus Master', description: 'Complete 120+ minutes in the Zen Focus Sanctuary', unlocked: true, icon: '🧘', progress: 125, maxProgress: 120, dateUnlocked: 'Oct 2026' },
  { id: 'a3', title: 'Golden 7-Day Streak', description: 'Spend 7 consecutive days together with your companion', unlocked: true, icon: '🔥', progress: 7, maxProgress: 7, dateUnlocked: 'Oct 2026' },
  { id: 'a4', title: 'Reflex Champion', description: 'Score over 150 points in Bamboo Catcher', unlocked: true, icon: '⚡', progress: 180, maxProgress: 150, dateUnlocked: 'Oct 2026' },
  { id: 'a5', title: 'Soulmate Connection', description: 'Reach Friendship Level 15 with your pet', unlocked: false, icon: '💖', progress: 14, maxProgress: 15 },
  { id: 'a6', title: 'Centurion Scholar', description: 'Log 300 minutes of deep study sessions', unlocked: false, icon: '📚', progress: 125, maxProgress: 300 },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'panda',
    text: "Hi friend! I'm your fluffy companion. How's your energy feeling today?",
    timestamp: '09:00 AM',
    triggerAnimation: 'waving',
  },
  {
    id: 'm2',
    sender: 'user',
    text: "Ready to focus on my Python practice and English studies with you!",
    timestamp: '09:01 AM',
  },
  {
    id: 'm3',
    sender: 'panda',
    text: "Yay! That brings so much joy to my heart! Remember: take deep breaths and don't forget to drink water. I'll cheer you on every step! 🐾",
    timestamp: '09:01 AM',
    triggerAnimation: 'happy_bouncing',
  },
];

const INITIAL_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.6,
  reducedMotion: false,
  renderMode: '3d',
  desktopWidgetMode: false,
  ambientSound: 'bamboo_rain',
  distraction: {
    enabled: true,
    warnOnTabSwitch: true,
    studySessionActive: false,
    dailyLimitMinutes: 30,
    warningIntervalMinutes: 10,
    distractingList: ['youtube.com/shorts', 'instagram.com/reels', 'tiktok.com', 'reddit.com'],
    tabSwitchCount: 0,
  },
};

export default function App() {
  const [panda, setPanda] = useState<PetProfile>(() => {
    const loaded = loadStoredData(STORAGE_KEYS.PANDA, INITIAL_PANDA);
    // Normalize loaded pet for backward compatibility
    return {
      ...INITIAL_PANDA,
      ...loaded,
      species: loaded.species || 'panda',
      breed: loaded.breed || (loaded.species === 'dog' ? 'Golden Retriever' : 'Qinling Panda'),
      furColor: loaded.furColor || (loaded.species === 'panda' ? 'white' : 'golden'),
      eyeColor: loaded.eyeColor || (loaded.species === 'panda' ? 'obsidian' : 'amber'),
      roomBackground: loaded.roomBackground || 'bedroom',
      personality: (loaded.personality as PetPersonality) || 'playful',
      soundsEnabled: loaded.soundsEnabled !== undefined ? loaded.soundsEnabled : true,
      accessories: {
        hat: loaded.accessories?.hat || 'none',
        glasses: !!loaded.accessories?.glasses,
        bow: !!loaded.accessories?.bow,
        collar: !!loaded.accessories?.collar,
        scarf: !!loaded.accessories?.scarf,
        zenHeadband: !!loaded.accessories?.zenHeadband,
        bambooCrown: !!loaded.accessories?.bambooCrown,
      },
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => loadStoredData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
  const [tasks, setTasks] = useState<DailyTask[]>(() => loadStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS));
  const [reminders, setReminders] = useState<ScheduleReminder[]>(() => loadStoredData(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredData('pandabuddy_chat_v2', INITIAL_MESSAGES));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStoredData(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS));
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => loadStoredData(STORAGE_KEYS.REPORTS, []));

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('room');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFocusTask, setSelectedFocusTask] = useState<string | null>(null);

  // Real device hardware battery hook
  const batteryState = useDeviceBattery();

  // Daily Reset & Streak Maintenance on Mount
  useEffect(() => {
    const { updatedPanda, updatedTasks, updatedReports, isNewDay } = checkDailyReset(panda, tasks, dailyReports);
    if (isNewDay) {
      setPanda(updatedPanda);
      setTasks(updatedTasks);
      setDailyReports(updatedReports);
      saveStoredData(STORAGE_KEYS.PANDA, updatedPanda);
      saveStoredData(STORAGE_KEYS.TASKS, updatedTasks);
      saveStoredData(STORAGE_KEYS.REPORTS, updatedReports);
    }
  }, []);

  // Save changes to persistent storage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PANDA, panda);
  }, [panda]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.REMINDERS, reminders);
  }, [reminders]);

  useEffect(() => {
    saveStoredData('pandabuddy_chat_v2', messages);
  }, [messages]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }, [achievements]);

  // Battery Warning Notification if hardware battery is critically low and not charging
  useEffect(() => {
    if (batteryState.supported && !batteryState.charging && batteryState.level <= 20) {
      setPanda((p) => ({
        ...p,
        speechText: `⚠️ Low battery warning (${batteryState.level}%). Please plug in your charger so we don't disconnect!`,
        currentAnimation: 'thinking',
      }));
    }
  }, [batteryState.supported, batteryState.charging, batteryState.level]);

  // Handle Quick Feed Action from Top Nav
  const handleQuickFeed = () => {
    playSound('munch', settings.soundVolume, settings.soundEnabled);
    setPanda((prev) => {
      const nextFullness = Math.min(100, prev.stats.fullness + 15);
      const nextExp = prev.stats.friendshipExp + 10;
      let newLevel = prev.stats.friendshipLevel;
      let expRemainder = nextExp;
      if (nextExp >= newLevel * 100) {
        expRemainder -= newLevel * 100;
        newLevel += 1;
        playSound('victory', settings.soundVolume, settings.soundEnabled);
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          fullness: nextFullness,
          happiness: Math.min(100, prev.stats.happiness + 5),
          friendshipExp: expRemainder,
          friendshipLevel: newLevel,
        },
        currentAnimation: 'eating',
        speechText: `Crunch crunch! Delicious juicy treats! Thank you, friend!`,
        treatsFedCount: prev.treatsFedCount + 1,
      };
    });

    setTimeout(() => {
      setPanda((prev) => (prev.currentAnimation === 'eating' ? { ...prev, currentAnimation: 'idle' } : prev));
    }, 4000);
  };

  // Companion AI Dialogue Processor
  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "";
      let triggerAnim: PandaAnimation = 'happy_bouncing';
      let soundToPlay: 'squeak' | 'purr' | 'munch' | 'victory' | 'lullaby' = 'squeak';

      if (lower.includes('python') || lower.includes('error') || lower.includes('code')) {
        reply = "Let's debug it together! Check for indentation errors (IndentationError), missing colons (:), or IndexError if your list boundary is exceeded. What does the terminal traceback say?";
        triggerAnim = 'studying';
        soundToPlay = 'purr';
      } else if (lower.includes('english') || lower.includes('grammar') || lower.includes('spelling')) {
        reply = "I'd love to help you polish your English! Share your sentence and I'll suggest clear grammar, natural phrasing, and helpful vocabulary tips!";
        triggerAnim = 'thinking';
        soundToPlay = 'purr';
      } else if (lower.includes('riddle')) {
        reply = `Here's one: What has four paws, a heart full of loyalty, and loves being your companion every day?\n\n... Me, ${panda.name}! Hehehe!`;
        triggerAnim = 'thinking';
      } else if (lower.includes('breath') || lower.includes('mindful')) {
        reply = "Let's do it together. Place one hand on your belly...\n\nBreathe in deeply through your nose for 4 counts... (1... 2... 3... 4)\nHold gently for 4...\nAnd release slowly like mist over a quiet meadow... (4... 3... 2... 1)\n\nFeel that calm settling in? I'm right here with you.";
        triggerAnim = 'studying';
        soundToPlay = 'purr';
      } else if (lower.includes('motivation') || lower.includes('tired') || lower.includes('hard') || lower.includes('work')) {
        reply = `You are capable of wonderful things! Take it one goal at a time. I believe in you with all my fluffy heart, and we'll celebrate as soon as you finish! 💪✨`;
        triggerAnim = 'celebrating';
        soundToPlay = 'victory';
      } else if (lower.includes('bedtime') || lower.includes('sleep') || lower.includes('night') || lower.includes('rest')) {
        reply = "Close your eyes and imagine soft twilight over misty mountains, a warm velvet pillow, and stars blinking gently. Rest your mind, friend. Tomorrow is a fresh new page. Sweet dreams...";
        triggerAnim = 'sleeping';
        soundToPlay = 'lullaby';
      } else if (lower.includes('trivia') || lower.includes('fact')) {
        reply = `Did you know pets can lower human cortisol levels and boost dopamine in just a few minutes of petting? Taking care of me is taking care of you!`;
        triggerAnim = 'waving';
      } else if (lower.includes('love') || lower.includes('cute') || lower.includes('pet')) {
        reply = `*Gentle purr* ${panda.name} loves you so much! Having a human friend like you makes every single day bright and peaceful! 💖`;
        triggerAnim = 'happy_bouncing';
        soundToPlay = 'purr';
      } else {
        const fallbacks = [
          `That sounds meaningful! ${panda.name} is listening carefully. Let's make today full of gentle progress.`,
          `I'm right beside you! Whenever you need a smile or a moment of zen, just tap me.`,
          `Together, nothing feels too overwhelming. Let's conquer our daily goals!`,
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        triggerAnim = 'waving';
      }

      playSound(soundToPlay, settings.soundVolume, settings.soundEnabled);

      const pandaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'panda',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggerAnimation: triggerAnim,
      };

      setMessages((prev) => [...prev, pandaMsg]);

      setPanda((prev) => ({
        ...prev,
        currentAnimation: triggerAnim,
        speechText: reply.slice(0, 90) + (reply.length > 90 ? '...' : ''),
        stats: {
          ...prev.stats,
          friendshipExp: prev.stats.friendshipExp + 5,
        },
      }));
    }, 700);
  };

  // Task Handlers
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setPanda((p) => ({
              ...p,
              currentAnimation: 'celebrating',
              speechText: `Task finished: "${t.title}"! High paw! 🐾`,
              stats: {
                ...p.stats,
                friendshipExp: p.stats.friendshipExp + t.rewardXp,
                happiness: Math.min(100, p.stats.happiness + 8),
              },
            }));
          }
          return { ...t, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : undefined };
        }
        return t;
      })
    );
  };

  const handleAddTask = (newTask: Omit<DailyTask, 'id' | 'completed'>) => {
    const task: DailyTask = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleEditTask = (id: string, updated: Partial<DailyTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleStartFocusForTask = (taskTitle: string) => {
    setSelectedFocusTask(taskTitle);
    setActiveScreen('focus');
  };

  // Reminder Handlers
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (newReminder: Omit<ScheduleReminder, 'id' | 'completed'>) => {
    const reminder: ScheduleReminder = {
      ...newReminder,
      id: Date.now().toString(),
      completed: false,
    };
    setReminders((prev) => [...prev, reminder]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Adoption Handler: Switch to a new species while keeping schedule, tasks, streak, achievements safe!
  const handleSelectPet = (
    newSpecies: PetSpecies,
    defaultName: string,
    breed: string,
    personality: PetPersonality
  ) => {
    setPanda((prev) => ({
      ...prev,
      species: newSpecies,
      name: defaultName,
      breed,
      personality,
      furColor:
        newSpecies === 'panda'
          ? 'white'
          : newSpecies === 'dog' || newSpecies === 'puppy'
          ? 'golden'
          : newSpecies === 'cat' || newSpecies === 'kitten'
          ? 'orange'
          : newSpecies === 'fox'
          ? 'orange'
          : 'white',
      eyeColor:
        newSpecies === 'panda'
          ? 'obsidian'
          : newSpecies === 'cat' || newSpecies === 'kitten'
          ? 'emerald'
          : newSpecies === 'rabbit' || newSpecies === 'bunny'
          ? 'ruby'
          : 'amber',
      speechText: `I'm ${defaultName}, your new companion! Excited to focus and play with you! 🐾`,
      currentAnimation: 'celebrating',
    }));
    setActiveScreen('room');
  };

  // Customization Studio Save Handler
  const handleSaveCustomizedPet = (updatedPet: PetProfile) => {
    setPanda(updatedPet);
  };

  // Onboarding Complete
  const handleOnboardingComplete = (name: string) => {
    setPanda((prev) => ({
      ...prev,
      name,
      speechText: `Hello! I'm ${name}, so thrilled to be your companion!`,
      currentAnimation: 'celebrating',
    }));
    setShowOnboarding(false);
  };

  // Export & Reset Data
  const handleExportData = () => {
    exportUserData({
      profile: panda,
      tasks,
      reminders,
      achievements,
      dailyReports,
      settings,
      messages,
    });
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all companion progress to default values?")) {
      setPanda(INITIAL_PANDA);
      setTasks(INITIAL_TASKS);
      setReminders(INITIAL_REMINDERS);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setDailyReports([]);
      setSettings(INITIAL_SETTINGS);
      localStorage.clear();
      playSound('pop', settings.soundVolume, settings.soundEnabled);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0c0a1a] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white ${
      settings.reducedMotion ? 'motion-reduce' : ''
    }`}>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(name) => handleOnboardingComplete(name)}
          soundEnabled={settings.soundEnabled}
          soundVolume={settings.soundVolume}
        />
      )}

      {/* Top Bar */}
      <TopNav
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onQuickFeed={handleQuickFeed}
        petName={panda.name}
      />

      {/* Main Screen Viewport */}
      <main className="flex-1 w-full relative">
        {activeScreen === 'room' && (
          <MainPetRoom
            panda={panda}
            settings={settings}
            reminders={reminders}
            batteryState={batteryState}
            onUpdatePanda={setPanda}
            onNavigate={setActiveScreen}
            onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            onToggleRenderMode={() =>
              setSettings((s) => ({ ...s, renderMode: s.renderMode === '3d' ? 'cinematic' : '3d' }))
            }
            onToggleWidgetMode={() =>
              setSettings((s) => ({ ...s, desktopWidgetMode: !s.desktopWidgetMode }))
            }
          />
        )}

        {activeScreen === 'adopt' && (
          <AdoptPetScreen
            currentPet={panda}
            settings={settings}
            onSelectPet={handleSelectPet}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'customize' && (
          <PetCustomizationStudio
            pet={panda}
            settings={settings}
            onSavePet={handleSaveCustomizedPet}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'interact' && (
          <InteractionScreen
            panda={panda}
            settings={settings}
            onUpdatePanda={setPanda}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'schedule' && (
          <DailyScheduleScreen
            panda={panda}
            settings={settings}
            tasks={tasks}
            reminders={reminders}
            dailyReports={dailyReports}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onStartFocusForTask={handleStartFocusForTask}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'focus' && (
          <FocusModeScreen
            panda={panda}
            settings={settings}
            initialTaskTitle={selectedFocusTask}
            onUpdatePanda={setPanda}
            onUpdateSettings={setSettings}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'chat' && (
          <AiChatScreen
            panda={panda}
            settings={settings}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'progress' && (
          <ProgressScreen
            panda={panda}
            achievements={achievements}
            onBack={() => setActiveScreen('room')}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            panda={panda}
            settings={settings}
            onUpdatePanda={setPanda}
            onUpdateSettings={setSettings}
            onRestartTour={() => setShowOnboarding(true)}
            onExportData={handleExportData}
            onResetData={handleResetData}
            onBack={() => setActiveScreen('room')}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
}
