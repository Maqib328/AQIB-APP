import React, { useState } from 'react';
import { X, Sparkles, Tv, Smartphone, ArrowRight, Tag } from 'lucide-react';
import { PromptTemplate } from '../types';
import { PROMPT_TEMPLATES } from '../constants/presets';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PromptTemplate) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Sci-Fi', 'Nature', 'Cinematic', 'Action', 'Animation', 'Atmospheric'];

  const filteredTemplates = PROMPT_TEMPLATES.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Veo 3 Prompt Inspiration Library</h3>
              <p className="text-xs text-slate-400">
                Curated cinematic prompts tested and tuned for <span className="font-mono text-cyan-300">veo-3.1-fast-generate-preview</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredTemplates.map((template) => {
            const isPortrait = template.recommendedAspectRatio === '9:16';
            return (
              <div
                key={template.id}
                className="group p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-950 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-white">{template.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {template.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isPortrait
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {isPortrait ? <Smartphone className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                      <span>{template.recommendedAspectRatio}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    "{template.prompt}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-violet-400" />
                      Style: <strong className="text-slate-300">{template.style}</strong>
                    </span>
                    <span>•</span>
                    <span>Camera: <strong className="text-slate-300">{template.camera}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="self-end sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>Use Prompt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
