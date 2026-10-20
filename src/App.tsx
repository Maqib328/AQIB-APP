/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PromptStudio } from './components/PromptStudio';
import { GeneratingView } from './components/GeneratingView';
import { VideoPlayerView } from './components/VideoPlayerView';
import { VideoGallery } from './components/VideoGallery';
import { PromptTemplatesModal } from './components/PromptTemplatesModal';
import { ErrorModal } from './components/ErrorModal';
import { AspectRatio, Resolution, GeneratedVideo, GenerationStatus, PromptTemplate } from './types';
import { PROMPT_TEMPLATES } from './constants/presets';

const STORAGE_KEY = 'veo_studio_video_history_v1';

export default function App() {
  // Studio form states
  const [prompt, setPrompt] = useState<string>(
    'Cinematic slow motion pan of a futuristic cybernetic explorer standing on a neon rain-slicked skyscraper balcony overlooking Neo-Tokyo, 35mm anamorphic lens, moody atmospheric fog, volumetric neon reflections, 4k detail.'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [selectedStyle, setSelectedStyle] = useState<string>('Cinematic Film');
  const [selectedCamera, setSelectedCamera] = useState<string>('Cinematic Pan');
  const [selectedLighting, setSelectedLighting] = useState<string>('Neon Cyberpunk');

  // Navigation & View states
  const [currentTab, setCurrentTab] = useState<'studio' | 'gallery'>('studio');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Generation execution states
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentOperationName, setCurrentOperationName] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideo[]>([]);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'ok') {
          setBackendHealthy(true);
        } else {
          setBackendHealthy(false);
        }
      })
      .catch(() => setBackendHealthy(false));
  }, []);

  // Load saved videos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setVideoHistory(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to load video history:', err);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (items: GeneratedVideo[]) => {
    setVideoHistory(items);
    try {
      // Store metadata without massive blob URLs to prevent localStorage quota overflows
      const toStore = items.map((item) => ({
        ...item,
        videoUrl: item.videoUrl.startsWith('blob:')
          ? `/api/video-download?operationName=${encodeURIComponent(item.operationName)}`
          : item.videoUrl,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  };

  // Start Generation
  const handleStartGeneration = async () => {
    if (!prompt.trim() || status === 'submitting' || status === 'generating') return;

    setStatus('submitting');
    setStatusMessage('Initiating video request with model veo-3.1-fast-generate-preview...');
    setCurrentOperationName(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          resolution,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to start video generation (${response.status})`);
      }

      const data = await response.json();
      if (!data.operationName) {
        throw new Error('Server returned invalid response with missing operation name.');
      }

      const opName = data.operationName;
      setCurrentOperationName(opName);
      setStatus('generating');
      setStatusMessage('Veo 3 is synthesizing spatial and temporal video latents...');

      // Start Polling loop
      await pollVideoStatus(opName, abortController.signal);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation cancelled by user.');
        setStatus('idle');
        return;
      }
      console.error('Generation Error:', err);
      setStatus('failed');
      setErrorModal({
        isOpen: true,
        message: err.message || 'An unexpected error occurred during generation.',
      });
    }
  };

  // Polling loop for Veo Operation
  const pollVideoStatus = async (operationName: string, signal: AbortSignal) => {
    const pollIntervalMs = 4000;
    let attempts = 0;
    const maxAttempts = 120; // up to 8 minutes

    while (attempts < maxAttempts) {
      if (signal.aborted) return;
      attempts++;

      // Wait between polls
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      if (signal.aborted) return;

      try {
        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
          signal,
        });

        if (!statusRes.ok) {
          console.warn(`Status poll attempt ${attempts} failed, continuing...`);
          continue;
        }

        const statusData = await statusRes.json();

        if (statusData.error) {
          throw new Error(statusData.error);
        }

        if (statusData.done) {
          // Video generation finished!
          setStatus('downloading');
          setStatusMessage('Retrieving completed video stream...');

          // Fetch video blob
          const videoRes = await fetch(
            `/api/video-download?operationName=${encodeURIComponent(operationName)}`,
            { signal }
          );

          if (!videoRes.ok) {
            throw new Error(`Failed to download completed video (${videoRes.statusText})`);
          }

          const blob = await videoRes.blob();
          const videoUrl = URL.createObjectURL(blob);

          const newVideoItem: GeneratedVideo = {
            id: 'veo_' + Date.now(),
            operationName,
            prompt: prompt.trim(),
            aspectRatio,
            resolution,
            videoUrl,
            createdAt: Date.now(),
            style: selectedStyle,
            cameraMotion: selectedCamera,
          };

          setCurrentVideo(newVideoItem);
          saveHistory([newVideoItem, ...videoHistory]);
          setStatus('completed');
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        throw err;
      }
    }

    throw new Error('Video generation timed out. Please try again with a refined prompt.');
  };

  // Cancel generation
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setCurrentOperationName(null);
  };

  // Select video from gallery
  const handleSelectFromGallery = (v: GeneratedVideo) => {
    setCurrentVideo(v);
    setStatus('completed');
    setCurrentTab('studio');
  };

  // Delete from gallery
  const handleDeleteVideo = (id: string) => {
    const updated = videoHistory.filter((v) => v.id !== id);
    saveHistory(updated);
    if (currentVideo && currentVideo.id === id) {
      setCurrentVideo(null);
      setStatus('idle');
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (confirm('Clear all generated videos from your session gallery?')) {
      saveHistory([]);
      if (status === 'completed') {
        setStatus('idle');
        setCurrentVideo(null);
      }
    }
  };

  // Remix Prompt from completed video
  const handleRemix = (v: GeneratedVideo) => {
    setPrompt(v.prompt);
    setAspectRatio(v.aspectRatio);
    setResolution(v.resolution);
    if (v.style) setSelectedStyle(v.style);
    if (v.cameraMotion) setSelectedCamera(v.cameraMotion);
    setStatus('idle');
  };

  // Apply Prompt Template
  const handleSelectTemplate = (t: PromptTemplate) => {
    setPrompt(t.prompt);
    setAspectRatio(t.recommendedAspectRatio);
    setSelectedStyle(t.style);
    setSelectedCamera(t.camera);
    if (status === 'completed') {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        galleryCount={videoHistory.length}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        isBackendHealthy={backendHealthy}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentTab === 'gallery' ? (
          <VideoGallery
            videos={videoHistory}
            onSelectVideo={handleSelectFromGallery}
            onDeleteVideo={handleDeleteVideo}
            onClearAll={handleClearAll}
            onNewGeneration={() => {
              setCurrentTab('studio');
              setStatus('idle');
            }}
          />
        ) : (
          <>
            {/* Studio Tab: 3 States: idle, generating, completed */}
            {(status === 'submitting' || status === 'generating' || status === 'downloading') && (
              <GeneratingView
                prompt={prompt}
                aspectRatio={aspectRatio}
                resolution={resolution}
                onCancel={handleCancelGeneration}
                statusText={statusMessage}
              />
            )}

            {status === 'completed' && currentVideo && (
              <VideoPlayerView
                video={currentVideo}
                onNewGeneration={() => setStatus('idle')}
                onRemixPrompt={handleRemix}
              />
            )}

            {(status === 'idle' || status === 'failed') && (
              <PromptStudio
                prompt={prompt}
                setPrompt={setPrompt}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                resolution={resolution}
                setResolution={setResolution}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                selectedCamera={selectedCamera}
                setSelectedCamera={setSelectedCamera}
                selectedLighting={selectedLighting}
                setSelectedLighting={setSelectedLighting}
                onGenerate={handleStartGeneration}
                isGenerating={false}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Veo Studio</span>
            <span>•</span>
            <span>Powered by Google Veo 3</span>
            <span className="font-mono text-cyan-400 text-[11px]">(veo-3.1-fast-generate-preview)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Aspect Ratios: 16:9 Landscape & 9:16 Portrait</span>
            <span>•</span>
            <span>H.264 Video Output</span>
          </div>
        </div>
      </footer>

      {/* Templates Modal */}
      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        errorMessage={errorModal.message}
        onRetry={handleStartGeneration}
      />
    </div>
  );
}
