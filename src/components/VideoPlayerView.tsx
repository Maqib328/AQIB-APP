import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Tv,
  Smartphone,
  Share2,
  Film,
  Calendar,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoPlayerViewProps {
  video: GeneratedVideo;
  onNewGeneration: () => void;
  onRemixPrompt: (video: GeneratedVideo) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  onNewGeneration,
  onRemixPrompt,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleTimeUpdate = () => setCurrentTime(vid.currentTime);
    const handleLoadedMetadata = () => setDuration(vid.duration || 0);
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    vid.addEventListener('ended', handleEnded);

    // Auto play
    vid.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      vid.removeEventListener('ended', handleEnded);
    };
  }, [video.videoUrl, isLooping]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(video.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Fetch video as blob to ensure clean direct download
      const res = await fetch(video.videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanPromptSlug = video.prompt
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      a.download = `veo3_${video.aspectRatio.replace(':', 'x')}_${cleanPromptSlug}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      window.open(video.videoUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isPortrait = video.aspectRatio === '9:16';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            {isPortrait ? <Smartphone className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Veo 3 Video Generated</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {video.aspectRatio}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {video.resolution}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthesized by <span className="font-mono text-cyan-400">veo-3.1-fast-generate-preview</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRemixPrompt(video)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Remix & Tweak</span>
          </button>

          <button
            onClick={onNewGeneration}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
        </div>
      </div>

      {/* Main Player Display Area */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ambient Blur Backdrop for 9:16 videos */}
        {isPortrait && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover blur-3xl scale-125"
              muted
              loop
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 bg-slate-950/70" />
          </div>
        )}

        {/* Video Canvas Container */}
        <div className="relative z-10 flex items-center justify-center p-3 sm:p-6 min-h-[380px] sm:min-h-[480px]">
          <div
            className={`relative rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800 group ${
              isPortrait
                ? 'w-full max-w-[340px] aspect-[9/16]'
                : 'w-full max-w-4xl aspect-[16/9]'
            }`}
          >
            {/* The Video Element */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              loop={isLooping}
              playsInline
            />

            {/* Overlay play button on pause */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-950/80 hover:bg-violet-600/90 text-white flex items-center justify-center border border-white/20 shadow-2xl transition-all scale-100 hover:scale-110 active:scale-95 backdrop-blur-md"
              >
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </button>
            )}

            {/* Custom Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity space-y-2">
              {/* Scrubber timeline */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:h-2 transition-all"
                />
              </div>

              {/* Lower controls row */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="hover:text-cyan-400 transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="hover:text-cyan-400 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed toggle */}
                  <div className="flex items-center gap-1 font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                    {[1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`hover:text-cyan-300 ${playbackRate === s ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Loop toggle */}
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`hover:text-cyan-400 transition-colors ${isLooping ? 'text-violet-400' : 'text-slate-400'}`}
                    title="Toggle Loop"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="hover:text-cyan-400 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Actions & Prompt Details Panel */}
        <div className="border-t border-slate-800/90 bg-slate-900/60 p-5 sm:p-7 space-y-5">
          {/* Action buttons row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing MP4...' : 'Download Video (MP4)'}</span>
              </button>

              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Prompt Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(video.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Prompt card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-violet-400" />
                Input Prompt
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Model: veo-3.1-fast-generate-preview
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans select-all">
              "{video.prompt}"
            </p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Aspect Ratio</span>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                {isPortrait ? <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> : <Tv className="w-3.5 h-3.5 text-violet-400" />}
                {video.aspectRatio} ({isPortrait ? 'Portrait' : 'Landscape'})
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Resolution</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5 font-mono">
                {video.resolution}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">AI Model</span>
              <div className="text-xs font-bold text-violet-300 mt-0.5 truncate font-mono">
                veo-3.1-fast
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Video Format</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                H.264 / MP4
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
