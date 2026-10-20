import React from 'react';
import { AlertTriangle, RefreshCw, X, Key, Info } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorTitle?: string;
  errorMessage: string;
  onRetry?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorTitle = 'Generation Encountered an Issue',
  errorMessage,
  onRetry,
}) => {
  if (!isOpen) return null;

  const isKeyError =
    errorMessage.toLowerCase().includes('api_key') ||
    errorMessage.toLowerCase().includes('apikey') ||
    errorMessage.toLowerCase().includes('credentials') ||
    errorMessage.toLowerCase().includes('unauthenticated');

  const isQuotaError =
    errorMessage.toLowerCase().includes('quota') ||
    errorMessage.toLowerCase().includes('rate limit') ||
    errorMessage.toLowerCase().includes('resource exhausted');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-white">{errorTitle}</h3>
            <p className="text-xs text-rose-300/90 leading-relaxed font-sans break-words">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative advice */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Troubleshooting Notes
          </div>
          {isKeyError && (
            <p className="text-slate-400">
              Veo 3 video generation requires a valid Gemini API key with Veo access. Check your key in the Settings &gt; Secrets panel.
            </p>
          )}
          {isQuotaError && (
            <p className="text-slate-400">
              Veo generation request limit reached. Please wait a moment and try again.
            </p>
          )}
          {!isKeyError && !isQuotaError && (
            <p className="text-slate-400">
              Try simplifying or rephrasing the text prompt, selecting 720p resolution, or verifying network connectivity.
            </p>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Dismiss
          </button>
          {onRetry && (
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
