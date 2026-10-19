import { PandaProfile, DailyTask, ScheduleReminder, DailyReport, Achievement, AppSettings } from '../types';

const STORAGE_KEYS = {
  PANDA: 'pandabuddy_profile_v2',
  TASKS: 'pandabuddy_tasks_v2',
  REMINDERS: 'pandabuddy_reminders_v2',
  REPORTS: 'pandabuddy_reports_v2',
  ACHIEVEMENTS: 'pandabuddy_achievements_v2',
  SETTINGS: 'pandabuddy_settings_v2',
};

export const getTodayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to read ${key} from storage:`, err);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

/**
 * Evaluates date changes, streak maintenance, missed tasks, and daily reward resets.
 */
export function checkDailyReset(
  currentPanda: PandaProfile,
  currentTasks: DailyTask[],
  reports: DailyReport[]
): {
  updatedPanda: PandaProfile;
  updatedTasks: DailyTask[];
  updatedReports: DailyReport[];
  isNewDay: boolean;
} {
  const today = getTodayDateKey();
  const lastDate = currentPanda.lastCheckInDate;

  if (lastDate === today) {
    return {
      updatedPanda: currentPanda,
      updatedTasks: currentTasks,
      updatedReports: reports,
      isNewDay: false,
    };
  }

  // A new day has dawned!
  const yesterdayCompleted = currentTasks.filter((t) => t.completed).length;
  const yesterdayMissed = currentTasks.filter((t) => !t.completed).length;

  const newReport: DailyReport = {
    date: lastDate || today,
    tasksCompleted: yesterdayCompleted,
    tasksMissed: yesterdayMissed,
    totalFocusMinutes: currentPanda.focusMinutesTotal,
    happinessGained: currentPanda.stats.happiness,
    bambooEaten: currentPanda.treatsFedCount,
  };

  const updatedReports = [newReport, ...reports].slice(0, 30); // Keep last 30 days

  // Check if yesterday was the day before today for streak calculation
  let newStreak = currentPanda.daysTogether;
  if (lastDate) {
    const lastTime = new Date(lastDate).getTime();
    const todayTime = new Date(today).getTime();
    const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1; // Streak reset if missed a day
    }
  } else {
    newStreak = 1;
  }

  // Reset daily task completions for recurring tasks, preserve task list
  const updatedTasks = currentTasks.map((t) => {
    if (t.recurring) {
      return { ...t, completed: false, completedAt: undefined, missed: false };
    }
    return t;
  });

  const updatedPanda: PandaProfile = {
    ...currentPanda,
    daysTogether: newStreak,
    lastCheckInDate: today,
    dailyRewardClaimed: false,
    speechText: `A fresh new day has begun! Good morning! Let's make today joyful and productive! ☀️`,
    currentAnimation: 'waving',
  };

  return {
    updatedPanda,
    updatedTasks,
    updatedReports,
    isNewDay: true,
  };
}

export function exportUserData(allData: Record<string, unknown>): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pandabuddy_backup_${getTodayDateKey()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Failed to export data:', err);
  }
}

export { STORAGE_KEYS };
