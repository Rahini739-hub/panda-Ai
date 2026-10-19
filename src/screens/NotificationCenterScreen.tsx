import React from 'react';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Clock,
  Moon,
  BatteryWarning,
  Sparkles,
  Timer,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { AppNotification, AppSettings } from '../types';
import { playSound } from '../utils/audio';

interface NotificationCenterScreenProps {
  notifications: AppNotification[];
  settings: AppSettings;
  onMarkAllAsRead: () => void;
  onClearAllNotifications: () => void;
  onDeleteNotification: (id: string) => void;
  onRequestBrowserPermission: () => void;
  onBack: () => void;
}

export const NotificationCenterScreen: React.FC<NotificationCenterScreenProps> = ({
  notifications,
  settings,
  onMarkAllAsRead,
  onClearAllNotifications,
  onDeleteNotification,
  onRequestBrowserPermission,
  onBack,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task':
        return <Clock className="w-4 h-4 text-purple-300" />;
      case 'sleep':
      case 'alarm':
        return <Moon className="w-4 h-4 text-indigo-300" />;
      case 'battery':
        return <BatteryWarning className="w-4 h-4 text-amber-400" />;
      case 'focus':
        return <Timer className="w-4 h-4 text-blue-300" />;
      case 'celebration':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-300" />;
    }
  };

  const hasBrowserPermission =
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Routine countdowns, focus pings, sleep warnings, and celebrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>

              <button
                onClick={onClearAllNotifications}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sanctuary</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      {!hasBrowserPermission && (
        <div className="mb-6 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Enable Browser Notifications</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Receive bedtime countdowns, task start chimes, and battery alerts while using your device.
              </p>
            </div>
          </div>

          <button
            onClick={onRequestBrowserPermission}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer whitespace-nowrap shrink-0"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-3 mb-6">
        {notifications.length === 0 ? (
          <div className="bg-[#120f26] border border-purple-900/40 rounded-3xl p-8 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/50 text-purple-300 flex items-center justify-center mx-auto mb-3">
              <BellOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">All Caught Up!</h4>
            <p className="text-xs max-w-xs mx-auto">
              No new alerts or unread reminders right now. BaoBao is watching over your schedule!
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3.5 ${
                notif.read
                  ? 'bg-[#120f26]/60 border-purple-950/40 opacity-75'
                  : 'bg-[#151130] border-purple-500/40 shadow-lg shadow-purple-950/30'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(notif.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] text-purple-300 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">{notif.body}</p>
                </div>
              </div>

              <button
                onClick={() => onDeleteNotification(notif.id)}
                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Honest Limitation Note */}
      <div className="text-[11px] text-slate-500 bg-slate-900/40 border border-purple-950/40 rounded-xl p-3">
        <strong>Note on Web Notifications:</strong> Web & PWA notifications require explicit user permission. If your browser is closed, in deep OS sleep, or in battery saver mode, web timers may pause until the application is reopened.
      </div>
    </div>
  );
};
