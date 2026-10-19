import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Heart, Bot, User, ArrowLeft } from 'lucide-react';
import { ChatMessage, PandaProfile, AppSettings, PandaAnimation } from '../types';
import { playSound } from '../utils/audio';

interface AiChatScreenProps {
  panda: PandaProfile;
  settings: AppSettings;
  messages: ChatMessage[];
  isThinking?: boolean;
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export const AiChatScreen: React.FC<AiChatScreenProps> = ({
  panda,
  settings,
  messages,
  isThinking = false,
  onSendMessage,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '🐍 Python Error Help', query: 'I have a Python IndexError: list index out of range. Can you explain why it happens and how to fix it step by step?' },
    { label: '✍️ English Practice', query: 'Can you check my English: "Yesterday I go to library and readed two book" and suggest the natural way to say it?' },
    { label: '🎋 Bamboo Riddle', query: 'Tell me a clever bamboo riddle!' },
    { label: '🧘 Mindful Breathing', query: 'Can we do a quick 2-minute mindful breathing exercise together?' },
    { label: '💪 Study Motivation', query: "I have a lot of work ahead, can you motivate me with some high-energy encouragement?" },
    { label: '🌙 Bedtime Thought', query: 'Share a gentle, cozy bedtime reflection with me.' },
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (query: string) => {
    playSound('pop', settings.soundVolume, settings.soundEnabled);
    onSendMessage(query);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 flex flex-col h-[calc(100vh-80px)] min-h-[550px]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-md">
            🐾
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{panda.name} Dialogue</h2>
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <span className="capitalize">{panda.personality.replace('_', ' ')}</span>
              <span>·</span>
              <span className="text-slate-400 capitalize">{panda.currentMood}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sanctuary</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePromptClick(p.query)}
            className="px-3 py-1.5 rounded-full bg-[#161230] hover:bg-purple-900/40 border border-purple-900/40 text-[11px] font-medium text-purple-200 hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 py-2">
        {messages.map((msg) => {
          const isPanda = msg.sender === 'panda';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isPanda ? 'justify-start' : 'justify-end'}`}
            >
              {isPanda && (
                <div className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm">
                  🐾
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isPanda
                    ? 'bg-[#15112e] text-slate-100 border border-purple-500/20 rounded-tl-sm shadow-md'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-purple-900/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                  <span className="font-semibold">{isPanda ? panda.name : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.triggerAnimation && isPanda && (
                  <div className="mt-2 text-[10px] text-purple-300 font-medium flex items-center gap-1">
                    <span>✨</span>
                    <span>{panda.name} triggered animation: {msg.triggerAnimation.replace('_', ' ')}</span>
                  </div>
                )}
              </div>

              {!isPanda && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm">
              🐾
            </div>
            <div className="p-3.5 rounded-2xl bg-[#15112e] text-purple-200 border border-purple-500/20 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>{panda.name} is thinking & reviewing...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="pt-3 shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Talk with ${panda.name}...`}
          className="flex-1 bg-[#15112e] border border-purple-900/50 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-purple-900/30 flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
