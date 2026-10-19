import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  ArrowLeft,
  Sparkles,
  Clock,
  Trash2,
  Edit2,
  Play,
  Copy,
  AlarmClock,
  BarChart3,
  AlertTriangle,
  Check,
  X,
  CalendarDays,
  ListFilter,
  Grid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyTask, ScheduleReminder, PandaProfile, AppSettings, DayOfWeek, DailyReport } from '../types';
import { playSound } from '../utils/audio';

interface DailyScheduleScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  tasks: DailyTask[];
  reminders: ScheduleReminder[];
  dailyReports: DailyReport[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  onEditTask: (id: string, updated: Partial<DailyTask>) => void;
  onDuplicateTask: (id: string) => void;
  onSnoozeTask: (id: string, minutes: number) => void;
  onDeleteTask: (id: string) => void;
  onClearTasks: () => void;
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<ScheduleReminder, 'id' | 'completed'>) => void;
  onDeleteReminder: (id: string) => void;
  onStartFocusForTask: (taskTitle: string) => void;
  onBack: () => void;
}

const ALL_DAYS: { id: DayOfWeek; label: string; full: string }[] = [
  { id: 'mon', label: 'M', full: 'Monday' },
  { id: 'tue', label: 'T', full: 'Tuesday' },
  { id: 'wed', label: 'W', full: 'Wednesday' },
  { id: 'thu', label: 'T', full: 'Thursday' },
  { id: 'fri', label: 'F', full: 'Friday' },
  { id: 'sat', label: 'S', full: 'Saturday' },
  { id: 'sun', label: 'S', full: 'Sunday' },
];

export const DailyScheduleScreen: React.FC<DailyScheduleScreenProps> = ({
  panda,
  settings,
  tasks,
  reminders,
  dailyReports,
  onToggleTask,
  onAddTask,
  onEditTask,
  onDuplicateTask,
  onSnoozeTask,
  onDeleteTask,
  onClearTasks,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onStartFocusForTask,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'reminders' | 'reports'>('schedule');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedWeekDay, setSelectedWeekDay] = useState<DayOfWeek>('mon');

  // Task Creation & Editing Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<DailyTask['category']>('study');
  const [formPriority, setFormPriority] = useState<DailyTask['priority']>('medium');
  const [formStartTime, setFormStartTime] = useState('18:00');
  const [formEndTime, setFormEndTime] = useState('19:00');
  const [formRecurring, setFormRecurring] = useState(true);
  const [formRepeatDays, setFormRepeatDays] = useState<DayOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [formNotes, setFormNotes] = useState('');

  // Confirmation modal before completing task
  const [confirmTask, setConfirmTask] = useState<DailyTask | null>(null);

  // Reminder Modal
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('In 15 mins');
  const [reminderCategory, setReminderCategory] = useState<ScheduleReminder['category']>('focus');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Overlap Detection
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const getOverlappingTasks = (currentTask: DailyTask): DailyTask[] => {
    const startA = timeToMinutes(currentTask.startTime);
    const endA = timeToMinutes(currentTask.endTime);

    return tasks.filter((other) => {
      if (other.id === currentTask.id) return false;
      // Check day intersection
      const sharesDay =
        currentTask.recurring && other.recurring
          ? currentTask.repeatDays?.some((d) => other.repeatDays?.includes(d))
          : true;
      if (!sharesDay) return false;

      const startB = timeToMinutes(other.startTime);
      const endB = timeToMinutes(other.endTime);
      return Math.max(startA, startB) < Math.min(endA, endB);
    });
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingTaskId(null);
    setFormTitle('');
    setFormCategory('study');
    setFormPriority('medium');
    setFormStartTime('18:00');
    setFormEndTime('19:00');
    setFormRecurring(true);
    setFormRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri']);
    setFormNotes('');
  };

  const openEditModal = (task: DailyTask) => {
    setModalMode('edit');
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormPriority(task.priority || 'medium');
    setFormStartTime(task.startTime);
    setFormEndTime(task.endTime);
    setFormRecurring(task.recurring);
    setFormRepeatDays(task.repeatDays || ['mon', 'tue', 'wed', 'thu', 'fri']);
    setFormNotes(task.notes || '');
  };

  const toggleDaySelection = (day: DayOfWeek) => {
    if (formRepeatDays.includes(day)) {
      setFormRepeatDays(formRepeatDays.filter((d) => d !== day));
    } else {
      setFormRepeatDays([...formRepeatDays, day]);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    playSound('pop', settings.soundVolume, settings.soundEnabled);

    if (modalMode === 'create') {
      onAddTask({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        startTime: formStartTime,
        endTime: formEndTime,
        recurring: formRecurring,
        repeatDays: formRepeatDays,
        rewardXp: formCategory === 'study' || formCategory === 'focus' ? 25 : 15,
        notes: formNotes.trim(),
      });
    } else if (modalMode === 'edit' && editingTaskId) {
      onEditTask(editingTaskId, {
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        startTime: formStartTime,
        endTime: formEndTime,
        recurring: formRecurring,
        repeatDays: formRepeatDays,
        notes: formNotes.trim(),
      });
    }

    setModalMode(null);
  };

  const handleConfirmComplete = () => {
    if (!confirmTask) return;
    playSound('victory', settings.soundVolume, settings.soundEnabled);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    onToggleTask(confirmTask.id);
    setConfirmTask(null);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onAddReminder({
      title: reminderTitle.trim(),
      time: reminderTime,
      category: reminderCategory,
    });
    setReminderTitle('');
    setShowReminderModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">My Daily Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full user control over study blocks, coding practice, breaks, and alarms with {panda.name}.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sanctuary</span>
        </button>
      </div>

      {/* Streak & Completion Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0">
            🔥
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Companion Streak</div>
            <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {panda.daysTogether} Days Active
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Consistent daily habits keep {panda.name} ecstatic!
            </div>
          </div>
        </div>

        <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Today's Progress</span>
            <span className="text-sm font-bold text-white tabular-nums">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full my-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{completedCount} of {tasks.length} tasks completed</span>
            {tasks.length > 0 && (
              <button
                onClick={onClearTasks}
                className="text-[11px] text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation & View Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 p-1 bg-[#130f28] border border-purple-900/40 rounded-2xl">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reminders</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </button>
        </div>

        {/* Day, Week, Month View Toggle */}
        {activeTab === 'schedule' && (
          <div className="flex items-center gap-1.5 bg-[#120f26] border border-purple-900/40 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                viewMode === 'day' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30' : 'text-slate-400'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                viewMode === 'week' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30' : 'text-slate-400'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                viewMode === 'month' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/30' : 'text-slate-400'
              }`}
            >
              Month View
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {viewMode === 'day' && "Today's Agenda"}
              {viewMode === 'week' && `Weekly View (${ALL_DAYS.find((d) => d.id === selectedWeekDay)?.full})`}
              {viewMode === 'month' && "Monthly Habit Calendar"}
            </h3>
            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Activity</span>
            </button>
          </div>

          {/* Week selector strip if in week view */}
          {viewMode === 'week' && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {ALL_DAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedWeekDay(d.id)}
                  className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedWeekDay === d.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#181434] border border-purple-900/30 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>{d.label}</div>
                  <div className="text-[10px] font-normal opacity-70">
                    {tasks.filter((t) => t.repeatDays?.includes(d.id)).length} tasks
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Month calendar preview if in month view */}
          {viewMode === 'month' && (
            <div className="bg-[#120f26] border border-purple-500/20 rounded-3xl p-5 mb-6">
              <div className="text-center text-sm font-bold text-white mb-3">October 2026</div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-slate-500 font-bold text-[11px] py-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isCurrent = dayNum === 18;
                  return (
                    <div
                      key={dayNum}
                      className={`p-2.5 rounded-xl text-xs flex flex-col items-center justify-between border ${
                        isCurrent
                          ? 'bg-purple-600/30 border-purple-400 text-white font-bold'
                          : 'bg-slate-900/40 border-purple-900/20 text-slate-300'
                      }`}
                    >
                      <span>{dayNum}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task cards list */}
          {tasks.length === 0 ? (
            <div className="bg-[#120f26] border border-purple-900/40 rounded-3xl p-8 text-center text-slate-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-purple-400 opacity-60" />
              <h4 className="text-sm font-bold text-white mb-1">Your Schedule is Empty</h4>
              <p className="text-xs max-w-sm mx-auto mb-4">
                You have complete freedom to structure your days. Tap below to create your first session block!
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Create First Activity
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {tasks.map((task) => {
                const overlaps = getOverlappingTasks(task);
                const hasOverlap = overlaps.length > 0;

                const categoryBadge = {
                  study: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                  focus: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  wellness: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  habit: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  pet: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                  work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  exercise: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                  meal: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                }[task.category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

                return (
                  <div
                    key={task.id}
                    className={`bg-[#120f26] border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                      task.completed
                        ? 'border-purple-950/40 opacity-70'
                        : hasOverlap
                        ? 'border-amber-500/50 shadow-lg'
                        : 'border-purple-500/20 hover:border-purple-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => {
                          if (task.completed) {
                            onToggleTask(task.id);
                          } else {
                            setConfirmTask(task);
                          }
                        }}
                        className="cursor-pointer text-purple-400 hover:text-purple-300 shrink-0 mt-0.5"
                        title={task.completed ? 'Mark uncompleted' : 'Complete task'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold truncate ${
                              task.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryBadge} uppercase font-bold`}>
                            {task.category}
                          </span>
                          {task.priority === 'high' && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                              High Priority
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-purple-200">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>{task.startTime} – {task.endTime}</span>
                          </span>

                          {task.recurring && (
                            <span className="text-[11px] text-slate-400">
                              · Repeats {task.repeatDays?.map((d) => d.toUpperCase()).join(', ')}
                            </span>
                          )}

                          <span className="text-purple-300 font-medium">+{task.rewardXp} XP</span>
                        </div>

                        {hasOverlap && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Time conflict with: {overlaps.map((o) => `"${o.title}"`).join(', ')}</span>
                          </div>
                        )}

                        {task.notes && (
                          <p className="text-xs text-slate-400 mt-1 italic leading-snug">{task.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Focus, Snooze, Duplicate, Edit, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {!task.completed && (
                        <button
                          onClick={() => onStartFocusForTask(task.title)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Start timer for this task"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSnoozeTask(task.id, 15)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer text-xs"
                        title="Snooze 15 minutes"
                      >
                        <AlarmClock className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDuplicateTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors cursor-pointer"
                        title="Duplicate activity"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REMINDERS */}
      {activeTab === 'reminders' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Reminders & Countdowns
            </h3>
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  reminder.completed
                    ? 'bg-[#120f26]/40 border-purple-950/40 opacity-60'
                    : 'bg-[#120f26] border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleReminder(reminder.id)}
                    className="cursor-pointer"
                  >
                    {reminder.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        reminder.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                      }`}
                    >
                      {reminder.title}
                    </div>
                    <div className="text-[11px] text-purple-300 font-mono mt-0.5">{reminder.time}</div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Historical Daily Reports
          </h3>
          {dailyReports.length === 0 ? (
            <div className="bg-[#120f26] border border-purple-900/40 rounded-2xl p-6 text-center text-xs text-slate-400">
              No historical reports yet. Tomorrow morning, your daily recap will automatically appear here!
            </div>
          ) : (
            dailyReports.map((report, idx) => (
              <div
                key={idx}
                className="bg-[#120f26] border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{report.date}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {report.tasksCompleted} completed · {report.tasksMissed} missed
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="text-purple-300 font-mono">
                    🧘 {report.totalFocusMinutes}m Focus
                  </div>
                  <div className="text-emerald-400">
                    🎋 {report.bambooEaten} Bamboo Fed
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TASK CONFIRMATION MODAL */}
      {confirmTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#120f26] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-2xl mx-auto mb-3">
              🎯
            </div>
            <h3 className="text-base font-bold text-white mb-1">Confirm Completion</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Did you finish <span className="font-semibold text-purple-200">"{confirmTask.title}"</span>? {panda.name} will award you <span className="text-amber-400 font-bold">+{confirmTask.rewardXp} XP</span>!
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setConfirmTask(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-900/40 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
              >
                Not yet
              </button>
              <button
                onClick={handleConfirmComplete}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-950/40"
              >
                Yes, Completed!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#120f26] border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {modalMode === 'create' ? 'Add Activity Block' : 'Edit Activity Block'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Python practice, Break, English study, Exercise"
                  className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DailyTask['category'])}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="study">Study / Coding</option>
                    <option value="focus">Deep Focus</option>
                    <option value="wellness">Break & Tea</option>
                    <option value="exercise">Exercise / Walk</option>
                    <option value="meal">Meal / Snack</option>
                    <option value="habit">Habit Routine</option>
                    <option value="pet">Pet Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as DailyTask['priority'])}
                    className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Recurring Weekdays Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-purple-300 uppercase">Repeat Days</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.checked)}
                      className="accent-purple-600"
                    />
                    <span>Recurring Schedule</span>
                  </label>
                </div>

                {formRecurring && (
                  <div className="flex items-center gap-1.5">
                    {ALL_DAYS.map((d) => {
                      const isSelected = formRepeatDays.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => toggleDaySelection(d.id)}
                          className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-900/60 border border-purple-900/30 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Chapter 4 arrays, review 10 idioms"
                  className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 py-2.5 rounded-xl border border-purple-900/40 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-950/40"
                >
                  {modalMode === 'create' ? 'Save Activity Block' : 'Update Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#120f26] border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Quick Reminder</h3>
            <form onSubmit={handleSaveReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g. Drink warm green tea, 5 min stretch"
                  className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase mb-1">
                  Time / Alert
                </label>
                <input
                  type="text"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  placeholder="e.g. In 15 mins, 07:30 PM"
                  className="w-full bg-[#181434] border border-purple-900/50 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-purple-900/40 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-950/40"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
