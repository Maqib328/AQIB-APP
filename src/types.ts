export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface GeneratedVideo {
  id: string;
  operationName: string;
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  videoUrl: string; // Blob URL or API endpoint URL
  createdAt: number;
  generationDurationSeconds?: number;
  style?: string;
  cameraMotion?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: 'Cinematic' | 'Sci-Fi' | 'Nature' | 'Action' | 'Animation' | 'Atmospheric';
  recommendedAspectRatio: AspectRatio;
  style: string;
  camera: string;
}

export type GenerationStatus = 'idle' | 'submitting' | 'generating' | 'downloading' | 'completed' | 'failed';
