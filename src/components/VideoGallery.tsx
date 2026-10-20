import React, { useState } from 'react';
import {
  Film,
  Play,
  Download,
  Trash2,
  Tv,
  Smartphone,
  Sparkles,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import { GeneratedVideo, AspectRatio } from '../types';

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  onSelectVideo: (video: GeneratedVideo) => void;
  onDeleteVideo: (id: string) => void;
  onClearAll: () => void;
  onNewGeneration: () => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onSelectVideo,
  onDeleteVideo,
  onClearAll,
  onNewGeneration,
}) => {
  const [filterRatio, setFilterRatio] = useState<'all' | AspectRatio>('all');

  const filteredVideos = videos.filter((v) => {
    if (filterRatio === 'all') return true;
    return v.aspectRatio === filterRatio;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Generated Video Archive</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {videos.length} videos
            </span>
          </div>
          <p className="text-xs text-slate-400">
            All videos synthesized using <span className="font-mono text-cyan-300">veo-3.1-fast-generate-preview</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ratio Filter pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterRatio('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterRatio === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRatio('16:9')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterRatio === '16:9'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 Landscape</span>
            </button>
            <button
              onClick={() => setFilterRatio('9:16')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterRatio === '9:16'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Portrait</span>
            </button>
          </div>

          {videos.length > 0 && (
            <button
              onClick={onClearAll}
              title="Clear all generated history"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition-all text-xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid or Empty State */}
      {filteredVideos.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto text-slate-600 border border-slate-700/50">
            <Film className="w-8 h-8 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              {videos.length === 0
                ? 'No generated videos yet'
                : `No ${filterRatio} videos found`}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Head over to the Studio, craft your prompt, select 16:9 or 9:16, and generate your first video with Veo 3!
            </p>
          </div>
          <button
            onClick={onNewGeneration}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Studio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((item) => {
            const isPortrait = item.aspectRatio === '9:16';
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 transition-all overflow-hidden flex flex-col shadow-xl"
              >
                {/* Media Preview Container */}
                <div
                  className={`relative bg-black flex items-center justify-center overflow-hidden cursor-pointer ${
                    isPortrait ? 'h-72' : 'h-48'
                  }`}
                  onClick={() => onSelectVideo(item)}
                >
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => {
                      const v = e.target as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />

                  {/* Play Overlay Badge */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-950/80 group-hover:bg-violet-600 text-white flex items-center justify-center border border-white/20 shadow-xl transition-all scale-90 group-hover:scale-100">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Ratio badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md">
                    {isPortrait ? <Smartphone className="w-3 h-3 text-indigo-400" /> : <Tv className="w-3 h-3 text-violet-400" />}
                    <span>{item.aspectRatio}</span>
                  </div>

                  {/* Resolution badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-cyan-300 border border-white/20 backdrop-blur-md">
                    {item.resolution}
                  </div>
                </div>

                {/* Info & Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/60">
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                      "{item.prompt}"
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onSelectVideo(item)}
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch in Player</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={item.videoUrl}
                        download={`veo_${item.id}.mp4`}
                        title="Download MP4"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeleteVideo(item.id)}
                        title="Delete from archive"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
