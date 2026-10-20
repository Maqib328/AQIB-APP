import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI SDK with required telemetry header
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache for downloaded video buffers to speed up replay and downloads
const videoCache = new Map<string, { buffer: Buffer; contentType: string }>();

// Health / Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'veo-3.1-fast-generate-preview',
  });
});

// 1. Generate Video endpoint using veo-3.1-fast-generate-preview
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio Secrets.',
      });
    }

    const { prompt, aspectRatio = '16:9', resolution = '720p' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A text prompt is required for video generation.' });
    }

    // Aspect ratio must be '16:9' or '9:16'
    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    const validResolution = resolution === '1080p' ? '1080p' : '720p';

    console.log(`[Veo] Starting generation with model: veo-3.1-fast-generate-preview`);
    console.log(`[Veo] Prompt: "${prompt.slice(0, 80)}..." | Ratio: ${validAspectRatio} | Res: ${validResolution}`);

    // Call veo-3.1-fast-generate-preview
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt.trim(),
      config: {
        numberOfVideos: 1,
        resolution: validResolution,
        aspectRatio: validAspectRatio,
      },
    });

    if (!operation || !operation.name) {
      throw new Error('Failed to initiate video generation operation.');
    }

    console.log(`[Veo] Operation created: ${operation.name}`);
    return res.json({
      operationName: operation.name,
      prompt: prompt.trim(),
      aspectRatio: validAspectRatio,
      resolution: validResolution,
    });
  } catch (error: any) {
    console.error('[Veo] Generate Error:', error);
    const errorMessage = error?.message || 'An error occurred while initiating video generation.';
    return res.status(500).json({ error: errorMessage });
  }
});

// 2. Poll Video Generation Status
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    // Reconstruct GenerateVideosOperation from operationName
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const isDone = Boolean(updated.done);
    const opError = updated.error ? (updated.error.message || JSON.stringify(updated.error)) : null;

    let hasVideo = false;
    if (isDone && !opError) {
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      hasVideo = Boolean(uri);
    }

    return res.json({
      done: isDone,
      error: opError,
      hasVideo,
    });
  } catch (error: any) {
    console.error('[Veo] Status Poll Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to poll video generation status.',
    });
  }
});

// 3. Download / Stream Video
app.get('/api/video-download', async (req: Request, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const operationName = (req.query.operationName as string) || (req.query.name as string);
    if (!operationName) {
      return res.status(400).json({ error: 'Missing operationName parameter.' });
    }

    // Check memory cache first
    if (videoCache.has(operationName)) {
      const cached = videoCache.get(operationName)!;
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Length', cached.buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached.buffer);
    }

    // Poll operation to obtain download uri
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return res.status(202).json({ error: 'Video is still processing. Please try again shortly.' });
    }

    if (updated.error) {
      return res.status(500).json({ error: updated.error.message || 'Operation failed.' });
    }

    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return res.status(404).json({ error: 'No video URI returned in operation response.' });
    }

    console.log(`[Veo] Fetching video from URI with API key: ${videoUri.slice(0, 60)}...`);
    const videoFetchRes = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoFetchRes.ok) {
      console.error(`[Veo] Fetch failed with status ${videoFetchRes.status}`);
      return res.status(videoFetchRes.status).json({
        error: `Failed to download video stream from provider (${videoFetchRes.statusText})`,
      });
    }

    const arrayBuffer = await videoFetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = videoFetchRes.headers.get('content-type') || 'video/mp4';

    // Store in cache
    videoCache.set(operationName, { buffer, contentType });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (error: any) {
    console.error('[Veo] Download Error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to download video.' });
  }
});

// Also support POST for /api/video-download
app.post('/api/video-download', async (req: Request, res: Response) => {
  const opName = req.body.operationName;
  if (!opName) {
    return res.status(400).json({ error: 'Missing operationName' });
  }
  req.query.operationName = opName;
  // Delegate to GET handler
  return (app as any)._router.handle(
    { ...req, method: 'GET', url: `/api/video-download?operationName=${encodeURIComponent(opName)}` },
    res,
    () => {}
  );
});

// 4. Prompt Enhancement with Gemini 3.8 Flash
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const { prompt, style, cameraMotion, lighting, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are an elite cinematic director, cinematographer, and master prompt engineer specializing in Google Veo 3 text-to-video generation.
Your objective is to rewrite the user's video prompt to achieve maximum visual excellence:

1. CINEMATIC DETAIL:
   - Introduce rich visual textures, optical characteristics (e.g. 35mm anamorphic lens, shallow depth of field, bokeh, chromatic subtlety).
   - Describe precise lighting conditions (volumetric rays, rim lighting, atmospheric haze, specular reflections, golden hour, or high-contrast noir).
   - Enrich environmental realism and sensory elements (mist, drifting dust particles, wet asphalt reflections, micro-details).

2. STYLE ADHERENCE:
   - Strictly honor and amplify the chosen aesthetic: "${style || 'Cinematic Film'}".
   - Ensure color palettes, grading curves, and visual motifs rigorously align with this style.

3. MOTION DESCRIPTIONS:
   - Clearly choreograph both camera movement and subject movement.
   - Specify dynamic camera paths (${cameraMotion || 'smooth cinematic camera movement'} like smooth dolly-in, sweeping orbital rotation, high-speed tracking, or low-angle tilt).
   - Detail the subject's natural, fluid physical motion, pacing, speed, and momentum.

4. FRAMING & COMPOSITION:
   - Tailored specifically for ${aspectRatio === '9:16' ? '9:16 vertical portrait composition (Reels/Shorts/TikTok)' : '16:9 widescreen cinematic composition'}.

Output rules:
- Return ONLY the rewritten prompt as a single, coherent, evocative paragraph (60 to 90 words).
- Do NOT output any introductory text, quotation marks, bullet points, or markdown titles.`;

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Prompt enhancement timed out')), 7000)
      );

      const aiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User's current prompt to rewrite: "${prompt.trim()}"\nRequested Style: "${style || 'Cinematic Film'}"\nRequested Camera Motion: "${cameraMotion || 'Smooth Dynamic Movement'}"\nRequested Lighting: "${lighting || 'Atmospheric'}"\nAspect Ratio: "${aspectRatio || '16:9'}"`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const response = await Promise.race([aiCall, timeoutPromise]);
      const enhanced = response.text?.trim() || prompt;
      return res.json({
        enhancedPrompt: enhanced,
        originalPrompt: prompt,
        model: 'gemini-3.8-flash',
      });
    } catch (aiErr: any) {
      console.warn('[Gemini] Prompt enhancement AI call failed or timed out, using cinematic synthesis fallback:', aiErr?.message);
      // Fallback synthesis with cinematic tags
      const cameraDesc = cameraMotion || 'cinematic dynamic camera pan';
      const styleDesc = style || 'photorealistic 35mm film grain, 8k resolution';
      const lightingDesc = lighting || 'volumetric dramatic lighting with atmospheric depth';
      const ratioContext = aspectRatio === '9:16' ? 'vertical portrait composition' : 'wide cinematic composition';

      const fallbackEnhanced = `Cinematic ${cameraDesc} of ${prompt.trim()}, featuring ${styleDesc}, ${lightingDesc}, framed in ${ratioContext}, highly detailed physical motion, realistic depth of field, and masterclass color grading.`;
      return res.json({
        enhancedPrompt: fallbackEnhanced,
        originalPrompt: prompt,
        model: 'gemini-3.8-flash',
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error('[Gemini] Prompt Enhancement Error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to enhance prompt.' });
  }
});

// Mount Vite middleware for dev or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Veo Studio] Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Veo Studio] Startup failure:', err);
  process.exit(1);
});
