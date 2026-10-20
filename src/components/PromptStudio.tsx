import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Dices,
  Trash2,
  Tv,
  Smartphone,
  Sliders,
  Layers,
  Camera,
  SunMedium,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  ArrowRight,
  Flame,
  Undo2,
  Clapperboard,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { AspectRatio, Resolution } from '../types';
import {
  STYLE_OPTIONS,
  CAMERA_OPTIONS,
  LIGHTING_OPTIONS,
  PROMPT_TEMPLATES,
} from '../constants/presets';

interface PromptStudioProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>> | ((p: string) => void);
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  selectedStyle: string;
  setSelectedStyle: (s: string) => void;
  selectedCamera: string;
  setSelectedCamera: (c: string) => void;
  selectedLighting: string;
  setSelectedLighting: (l: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onOpenTemplates: () => void;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  selectedStyle,
  setSelectedStyle,
  selectedCamera,
  setSelectedCamera,
  selectedLighting,
  setSelectedLighting,
  onGenerate,
  isGenerating,
  onOpenTemplates,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [enhancementDiff, setEnhancementDiff] = useState<string | null>(null);
  const [previousPrompt, setPreviousPrompt] = useState<string | null>(null);
  const [lastEnhancedTime, setLastEnhancedTime] = useState<number | null>(null);

  // Quick Random prompt
  const handleRandomPrompt = () => {
    const randomTemplate = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];
    setPrompt(randomTemplate.prompt);
    setAspectRatio(randomTemplate.recommendedAspectRatio);
    setSelectedStyle(randomTemplate.style);
    setSelectedCamera(randomTemplate.camera);
  };

  // AI Prompt Enhancer via Gemini Flash - Rewrites for cinematic detail, style adherence, and motion descriptions
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setEnhancementDiff(null);
    const originalText = prompt;

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          cameraMotion: selectedCamera,
          lighting: selectedLighting,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await res.json();
      if (data.enhancedPrompt) {
        setPreviousPrompt(originalText);
        setEnhancementDiff(data.enhancedPrompt);
        setLastEnhancedTime(Date.now());
      }
    } catch (err) {
      console.error('Enhance prompt error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancedPrompt = () => {
    if (enhancementDiff) {
      setPreviousPrompt(prompt);
      setPrompt(enhancementDiff);
      setEnhancementDiff(null);
    }
  };

  const handleRevertPrompt = () => {
    if (previousPrompt) {
      setPrompt(previousPrompt);
      setPreviousPrompt(null);
      setEnhancementDiff(null);
    }
  };

  const discardEnhancedPrompt = () => {
    setEnhancementDiff(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900/90 to-indigo-950/60 border border-violet-500/20 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Video Synthesis</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
              <span className="font-mono text-cyan-300">veo-3.1-fast-generate-preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Transform Ideas into Motion
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Generate breathtaking high-definition video clips with Google Veo 3. Select your aspect ratio, direct camera angles, and watch your vision come alive.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 border border-slate-700/80 hover:border-violet-500/50 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Inspire Me</span>
            </button>
            <button
              onClick={handleRandomPrompt}
              title="Surprise me with a random prompt"
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 shadow-md transition-all active:scale-95"
            >
              <Dices className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-5 sm:p-7 space-y-6">
        
        {/* Aspect Ratio & Resolution Selector - Primary Requirement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aspect Ratio & Format</span>
              <span className="text-slate-500 font-normal lowercase">(required: 16:9 or 9:16)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Selected: <strong className="text-cyan-300 font-mono">{aspectRatio}</strong> ({aspectRatio === '16:9' ? 'Landscape' : 'Portrait'})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 16:9 Landscape Option */}
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                aspectRatio === '16:9'
                  ? 'bg-gradient-to-br from-violet-950/60 to-slate-900/90 border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-950/50'
                  : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              {/* Visual 16:9 Icon Preview */}
              <div
                className={`w-14 h-9 rounded-md border-2 flex items-center justify-center transition-all ${
                  aspectRatio === '16:9'
                    ? 'border-violet-400 bg-violet-600/20 text-violet-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-500'
                }`}
              >
                <Tv className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${aspectRatio === '16:9' ? 'text-white' : 'text-slate-300'}`}>
                    16:9 Landscape
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Cinema
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Widescreen for YouTube, desktop monitors & film screens
                </p>
              </div>

              {aspectRatio === '16:9' && (
                <div className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* 9:16 Portrait Option */}
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                aspectRatio === '9:16'
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 text-slate-400 hover:bg-slate-900/60'
              }`}
            >
              {/* Visual 9:16 Icon Preview */}
              <div
                className={`w-9 h-14 rounded-md border-2 flex items-center justify-center transition-all ${
                  aspectRatio === '9:16'
                    ? 'border-indigo-400 bg-indigo-600/20 text-indigo-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${aspectRatio === '9:16' ? 'text-white' : 'text-slate-300'}`}>
                    9:16 Portrait
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Mobile
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Vertical format for TikTok, Reels, YouTube Shorts & smartphones
                </p>
              </div>

              {aspectRatio === '9:16' && (
                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Text Prompt Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="prompt-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Prompt Description</span>
            </label>
            <div className="flex items-center gap-2 text-xs">
              {previousPrompt && (
                <button
                  type="button"
                  onClick={handleRevertPrompt}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs transition-all active:scale-95 shadow-sm"
                  title="Revert to prompt before enhancement"
                >
                  <Undo2 className="w-3 h-3 text-amber-400" />
                  <span>Undo Rewrite</span>
                </button>
              )}

              {prompt.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  title="Clear prompt"
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative group">
            <textarea
              id="prompt-input"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene in detail: lighting, subject, motion, camera angle... e.g. 'Cinematic drone shot soaring through a dense misty redwood forest at golden hour with morning rays slicing through the canopy...'"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-y min-h-[115px] transition-all shadow-inner outline-none"
            />
            <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-500 pointer-events-none">
              {prompt.length} chars
            </div>
          </div>

          {/* Dedicated 'Enhance Prompt' Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {/* The Dedicated 'Enhance Prompt' Button */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className={`relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isEnhancing
                    ? 'bg-violet-900/60 text-violet-200 cursor-wait border border-violet-500/50'
                    : prompt.trim()
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500 text-white border border-white/20 shadow-indigo-600/20 hover:shadow-indigo-600/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                }`}
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Rewriting with Gemini API...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
                    <span>Enhance Prompt</span>
                    <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/20 text-white font-normal">
                      Gemini
                    </span>
                  </>
                )}
              </button>

              {previousPrompt && (
                <button
                  type="button"
                  onClick={handleRevertPrompt}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
                >
                  <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Revert to Original</span>
                </button>
              )}
            </div>

            {/* Visual indicators of what Enhance Prompt does */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
              <span className="hidden lg:inline text-slate-500">Gemini rewrites for:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                <span>Cinematic Detail</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Palette className="w-2.5 h-2.5 text-cyan-400" />
                <span>Style Adherence</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Clapperboard className="w-2.5 h-2.5 text-indigo-400" />
                <span>Motion Descriptions</span>
              </span>
            </div>
          </div>

          {/* AI Enhanced Suggestion Review Diff Box */}
          {enhancementDiff && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/70 via-slate-900/90 to-indigo-950/70 border border-violet-500/40 space-y-3 animate-in fade-in duration-200 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-violet-600/30 text-cyan-300 border border-violet-500/40">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Gemini Rewritten Cinematic Prompt</span>
                    <span className="ml-2 text-[11px] text-violet-300 font-mono">
                      Ready for Veo 3
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={applyEnhancedPrompt}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply to Prompt</span>
                  </button>
                  <button
                    onClick={discardEnhancedPrompt}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* What Gemini improved highlight badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5 text-slate-300">
                  <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0" />
                  <span className="truncate">Optics, Lighting & Depth</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5 text-slate-300">
                  <Palette className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">Style: {selectedStyle || 'Cinematic'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5 text-slate-300">
                  <Clapperboard className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">Motion: {selectedCamera || 'Dynamic Pan'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/90 border border-violet-500/30">
                <p className="text-xs text-slate-100 italic leading-relaxed font-sans">
                  "{enhancementDiff}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Style & Camera Presets Collapse */}
        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cinematography & Style Studio</span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {/* Resolution Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 px-1 font-mono">Res:</span>
              <button
                type="button"
                onClick={() => setResolution('720p')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                  resolution === '720p'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                720p Fast
              </button>
              <button
                type="button"
                onClick={() => setResolution('1080p')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                  resolution === '1080p'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1080p HD
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              {/* Visual Style Tags */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Layers className="w-3 h-3 text-violet-400" />
                  Visual Style
                </span>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => {
                    const isSelected = selectedStyle === style.label;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          const newStyle = isSelected ? '' : style.label;
                          setSelectedStyle(newStyle);
                          if (!isSelected && !prompt.includes(style.label)) {
                            setPrompt(prompt ? `${prompt}, ${style.tag}` : style.tag);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Movement Tags */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Camera className="w-3 h-3 text-cyan-400" />
                  Camera Movement
                </span>
                <div className="flex flex-wrap gap-2">
                  {CAMERA_OPTIONS.map((cam) => {
                    const isSelected = selectedCamera === cam.label;
                    return (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => {
                          const newCam = isSelected ? '' : cam.label;
                          setSelectedCamera(newCam);
                          if (!isSelected && !prompt.includes(cam.label)) {
                            setPrompt(prompt ? `${prompt}, ${cam.tag}` : cam.tag);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {cam.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting Tags */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <SunMedium className="w-3 h-3 text-amber-400" />
                  Lighting & Mood
                </span>
                <div className="flex flex-wrap gap-2">
                  {LIGHTING_OPTIONS.map((light) => {
                    const isSelected = selectedLighting === light.label;
                    return (
                      <button
                        key={light.id}
                        type="button"
                        onClick={() => {
                          const newLight = isSelected ? '' : light.label;
                          setSelectedLighting(newLight);
                          if (!isSelected && !prompt.includes(light.label)) {
                            setPrompt(prompt ? `${prompt}, ${light.tag}` : light.tag);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {light.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full group relative overflow-hidden py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 ${
              isGenerating || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.99] border border-white/20'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Veo 3 Synthesizing Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
                <span className="text-base">Generate Video with Veo 3</span>
                <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-white/20 text-xs font-mono text-cyan-200 font-normal">
                  <span>{aspectRatio}</span>
                  <span>•</span>
                  <span>{resolution}</span>
                </div>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-violet-400" />
            <span>Powered by</span>
            <code className="text-cyan-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              veo-3.1-fast-generate-preview
            </code>
            <span>• Generation takes ~30-75s</span>
          </div>
        </div>

      </div>
    </div>
  );
};
