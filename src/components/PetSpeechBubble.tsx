import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface PetSpeechBubbleProps {
  text: string | null;
  petName: string;
  onDismiss?: () => void;
}

export const PetSpeechBubble: React.FC<PetSpeechBubbleProps> = ({ text, petName, onDismiss }) => {
  if (!text) return null;

  return (
    <div
      onClick={onDismiss}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%] sm:max-w-md w-max animate-float-gentle cursor-pointer group"
    >
      <div className="relative bg-slate-900/90 text-slate-100 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl shadow-purple-950/40 border border-purple-500/25 flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-purple-300" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold tracking-wide uppercase">
            <span>{petName}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-normal lowercase">just now</span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-snug mt-0.5 pr-2">
            {text}
          </p>
        </div>

        <Heart className="w-3.5 h-3.5 text-pink-400/80 shrink-0 self-center opacity-70 group-hover:scale-110 transition-transform" />

        {/* Speech Bubble Arrow pointing down */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/90 border-r border-b border-purple-500/25 transform rotate-45" />
      </div>
    </div>
  );
};
