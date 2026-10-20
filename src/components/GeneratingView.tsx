import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Clock, Tv, Smartphone, XCircle, Film, Cpu } from 'lucide-react';
import { AspectRatio, Resolution } from '../types';
import { REASSURING_MESSAGES } from '../constants/presets';

interface GeneratingViewProps {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  onCancel: () => void;
  statusText?: string;
}

export const GeneratingView: React.FC<GeneratingViewProps> = ({
  prompt,
  aspectRatio,
  resolution,
  onCancel,
  statusText,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle reassuring messages smoothly
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
    }, 6000);
    return () => clearInterval(messageInterval);
  }, []);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Estimated progress calculation (asymptotic curve reaching ~92% around 60s)
  const progressPercent = Math.min(
    95,
    Math.round(100 * (1 - Math.exp(-elapsedSeconds / 35)))
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-violet-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-8">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Veo 3 Engine Active</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs text-cyan-300">
            veo-3.1-fast-generate-preview
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
            {aspectRatio === '16:9' ? (
              <Tv className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{aspectRatio} ({aspectRatio === '16:9' ? 'Landscape' : 'Portrait'})</span>
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs text-slate-400">
            {resolution}
          </span>
        </div>

        {/* Central Visualizer Reel */}
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <div className="relative">
            {/* Aspect ratio frame simulation */}
            <div
              className={`rounded-2xl border-2 border-dashed border-violet-500/40 bg-slate-950/60 p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-2xl ${
                aspectRatio === '16:9' ? 'w-72 h-44 sm:w-96 sm:h-56' : 'w-44 h-72 sm:w-56 sm:h-96'
              }`}
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/10 to-transparent animate-pulse pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/40">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <Sparkles className="w-5 h-5 text-violet-300 absolute -top-1 -right-1 animate-bounce" />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-bold text-white tracking-wide">
                    {progressPercent}% Rendered
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Elapsed: {formatTime(elapsedSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing ring under */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
          </div>
        </div>

        {/* Stage Progress & Reassuring Messages */}
        <div className="relative z-10 space-y-3 max-w-lg mx-auto">
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50 shadow-inner">
            <div
              className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Dynamic Reassurance Text */}
          <div className="min-h-[28px] flex items-center justify-center">
            <p className="text-sm text-cyan-300 font-medium animate-in fade-in duration-300">
              {statusText || REASSURING_MESSAGES[messageIndex]}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Veo 3 synthesizes high-fidelity motion, fluid dynamics, and photorealistic lighting. This typically takes 30-75 seconds.
          </p>
        </div>

        {/* Prompt Card Preview */}
        <div className="relative z-10 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              Prompt in Generation:
            </span>
            <span className="font-mono text-cyan-400">{aspectRatio}</span>
          </div>
          <p className="text-xs text-slate-200 line-clamp-3 italic">
            "{prompt}"
          </p>
        </div>

        {/* Cancel Button */}
        <div className="relative z-10 pt-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-all active:scale-95"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Generation & Return</span>
          </button>
        </div>

      </div>
    </div>
  );
};
