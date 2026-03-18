'use client';

import { useState } from 'react';
import {
  Platform,
  PLATFORMS,
  ContentFormat,
  CONTENT_FORMATS,
  TONE_OPTIONS,
  BRIEF_TEMPLATES,
  ContentBrief,
} from '@/types';
import { FileText, Zap, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ContentBriefFormProps {
  currentPlatform: Platform;
  onSubmit: (brief: ContentBrief) => void;
  disabled?: boolean;
}

export default function ContentBriefForm({ currentPlatform, onSubmit, disabled }: ContentBriefFormProps) {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<ContentFormat>('post');
  const [platforms, setPlatforms] = useState<Platform[]>([currentPlatform]);
  const [tone, setTone] = useState('');
  const [expanded, setExpanded] = useState(false);

  const availableFormats = CONTENT_FORMATS.filter(f =>
    platforms.some(p => f.platforms.includes(p))
  );

  const togglePlatform = (id: Platform) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const applyTemplate = (template: typeof BRIEF_TEMPLATES[number]) => {
    setTopic(template.topic);
    setFormat(template.format);
    setTone(template.tone);
    setExpanded(true);
  };

  const handleSubmit = () => {
    if (!topic.trim()) return;
    onSubmit({
      topic: topic.trim(),
      format,
      platforms: platforms.length > 0 ? platforms : [currentPlatform],
      tone,
    });
    setTopic('');
    setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-950">
      {/* Template Quick-Select */}
      {!expanded && !topic && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Zap size={11} />
            Quick templates
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BRIEF_TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t)}
                disabled={disabled}
                className="px-2.5 py-1 rounded-full bg-gray-800/60 hover:bg-gray-800 text-xs text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-700 disabled:opacity-50"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Brief Options */}
      {expanded && (
        <div className="px-4 pt-3 space-y-3">
          {/* Content Format */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Content Format</label>
            <div className="flex flex-wrap gap-1.5">
              {availableFormats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    format === f.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Multi-Select */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Platforms</label>
            <div className="flex gap-1.5">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    platforms.includes(p.id)
                      ? 'text-white border'
                      : 'bg-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  style={platforms.includes(p.id) ? { backgroundColor: `${p.color}20`, borderColor: `${p.color}60` } : undefined}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Override */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Tone Override
              {tone && (
                <button onClick={() => setTone('')} className="ml-2 text-gray-600 hover:text-gray-400">
                  <X size={10} className="inline" /> clear
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(tone === t ? '' : t)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                    tone === t
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'bg-gray-800/60 text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Topic Input + Controls */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-purple-500 transition-colors">
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 p-1 rounded-md hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
              title={expanded ? 'Collapse brief' : 'Expand brief options'}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !expanded && topic && setExpanded(true)}
              placeholder={disabled ? 'Set up Brand DNA first' : 'Describe your topic or idea...'}
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none disabled:opacity-50 resize-none"
              style={{ minHeight: '24px', maxHeight: '100px' }}
            />
            {expanded && (
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500">
                <FileText size={11} />
                {CONTENT_FORMATS.find(f => f.id === format)?.label}
                {tone && <span className="text-purple-400">| {tone}</span>}
                {platforms.length > 1 && <span>| {platforms.length} platforms</span>}
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!topic.trim() || disabled}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-30 transition-all shrink-0"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
