export type PandaAnimation =
  | 'idle'
  | 'waving'
  | 'happy_bouncing'
  | 'sleeping'
  | 'sad'
  | 'playful'
  | 'thinking'
  | 'studying'
  | 'celebrating'
  | 'eating'
  | 'low_energy'
  | 'stretching'
  | 'hopping'
  | 'tail_wagging'
  | 'fetching';

export type PandaMood =
  | 'ecstatic'
  | 'happy'
  | 'content'
  | 'sleepy'
  | 'playful'
  | 'focused'
  | 'tired'
  | 'hungry'
  | 'sad';

export type PetSpecies =
  | 'panda'
  | 'dog'
  | 'cat'
  | 'rabbit'
  | 'fox'
  | 'kitten'
  | 'puppy'
  | 'bunny';

export type PetPersonality =
  | 'playful'
  | 'calm'
  | 'sleepy'
  | 'energetic'
  | 'study_buddy';

// For backwards compatibility
export type PandaPersonality = PetPersonality | 'playful_adventurer' | 'zen_scholar' | 'cozy_dreamer' | 'cheerful_motivator';

export type RoomBackground =
  | 'bedroom'
  | 'garden'
  | 'beach'
  | 'magical_forest'
  | 'space_room';

export type PetOutfit =
  | 'none'
  | 'cozy_hoodie'
  | 'sailor_suit'
  | 'hero_cape'
  | 'knit_sweater'
  | 'royal_robe';

export interface PetAccessories {
  hat: 'none' | 'wizard_hat' | 'sun_hat' | 'party_hat' | 'bamboo_crown' | 'flower_crown' | 'detective_hat';
  glasses: boolean;
  bow: boolean;
  collar: boolean;
  scarf: boolean;
  zenHeadband: boolean;
  bambooCrown?: boolean;
  outfit?: PetOutfit;
  cozyScarf?: boolean;
}

// Backwards compatibility
export type PandaAccessories = PetAccessories;

export interface PandaStats {
  happiness: number; // 0-100
  energy: number;    // 0-100 (Virtual pet energy)
  fullness: number;  // 0-100
  friendshipExp: number;
  friendshipLevel: number;
}

export interface PetProfile {
  species: PetSpecies;
  breed: string;
  name: string;
  furColor: string; // color code or preset
  eyeColor: string; // color code or preset
  roomBackground: RoomBackground;
  personality: PetPersonality;
  stats: PandaStats;
  accessories: PetAccessories;
  currentAnimation: PandaAnimation;
  currentMood: PandaMood;
  speechText: string | null;
  speechTimeout?: number;
  daysTogether: number;
  lastCheckInDate?: string;
  dailyRewardClaimed?: boolean;
  treatsFedCount: number;
  focusMinutesTotal: number;
  miniGameHighScore: number;
  soundsEnabled: boolean;
}

export type PandaProfile = PetProfile;

export type ActiveScreen =
  | 'room'
  | 'interact'
  | 'schedule'
  | 'focus'
  | 'chat'
  | 'progress'
  | 'settings'
  | 'adopt'
  | 'customize';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DailyTask {
  id: string;
  title: string;
  category: 'wellness' | 'focus' | 'habit' | 'pet' | 'study';
  startTime: string; // e.g. "18:00"
  endTime: string;   // e.g. "19:00"
  recurring: boolean;
  repeatDays?: DayOfWeek[];
  completed: boolean;
  completedAt?: string;
  missed?: boolean;
  rewardXp: number;
  notes?: string;
}

export interface ScheduleReminder {
  id: string;
  title: string;
  time: string;
  category: 'focus' | 'health' | 'break' | 'fun';
  completed: boolean;
}

export interface DailyReport {
  date: string;
  tasksCompleted: number;
  tasksMissed: number;
  totalFocusMinutes: number;
  happinessGained: number;
  bambooEaten: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'panda';
  text: string;
  timestamp: string;
  triggerAnimation?: PandaAnimation;
  moodReaction?: PandaMood;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  progress: number;
  maxProgress: number;
  dateUnlocked?: string;
}

export interface DeviceBatteryState {
  supported: boolean;
  level: number;
  charging: boolean;
  lowBatteryNotified: boolean;
}

export interface DistractionSettings {
  enabled: boolean;
  warnOnTabSwitch: boolean;
  studySessionActive: boolean;
  dailyLimitMinutes: number;
  warningIntervalMinutes: number;
  distractingList: string[];
  tabSwitchCount: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: boolean;
  renderMode: '3d' | 'cinematic';
  desktopWidgetMode: boolean;
  ambientSound: 'none' | 'bamboo_rain' | 'crickets' | 'temple_bell';
  distraction: DistractionSettings;
}
