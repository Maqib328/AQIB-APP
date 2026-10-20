import React from 'react';
import { Video, Sparkles, Film, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'studio' | 'gallery';
  setCurrentTab: (tab: 'studio' | 'gallery') => void;
  galleryCount: number;
  onOpenTemplates: () => void;
  isBackendHealthy: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  galleryCount,
  onOpenTemplates,
  isBackendHealthy,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Model identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Video className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Veo Studio
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border border-violet-500/30 text-violet-300">
                Veo 3
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400">veo-3.1-fast-generate-preview</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 hidden sm:inline">Text-to-Video</span>
            </div>
          </div>
        </div>

        {/* Navigation & actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Inspiration templates button */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 transition-all hover:border-slate-600 active:scale-95 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Prompt</span> Presets
          </button>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'studio'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setCurrentTab('gallery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'gallery'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Gallery</span>
              {galleryCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {galleryCount}
                </span>
              )}
            </button>
          </div>

          {/* System status pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            {isBackendHealthy !== false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400/90 font-medium">Veo Ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400/90 font-medium">Checking API</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
