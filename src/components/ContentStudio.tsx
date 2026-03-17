'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS, ContentType, CONTENT_TYPES, ContentPiece } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  PenLine,
} from 'lucide-react';

export default function ContentStudio() {
  const {
    selectedBusiness,
    contentPieces,
    addContentPiece,
    updateContentPiece,
    deleteContentPiece,
  } = useBusinessContext();

  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('post');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram']);
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedPieceId, setExpandedPieceId] = useState<string | null>(null);

  if (!selectedBusiness) return null;

  const hasBrandDNA = !!selectedBusiness.brandDNA;
  const businessPieces = contentPieces.filter(p => p.businessId === selectedBusiness.id);

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }

  async function createContent() {
    if (!topic.trim() || selectedPlatforms.length === 0 || !selectedBusiness?.brandDNA || creating) return;

    setCreating(true);

    const pieceId = uuidv4();
    const piece: ContentPiece = {
      id: pieceId,
      businessId: selectedBusiness.id,
      contentType,
      topic: topic.trim(),
      platforms: selectedPlatforms,
      generatedContent: {} as Record<Platform, string>,
      status: 'generating',
      createdAt: Date.now(),
    };

    addContentPiece(piece);
    setExpandedPieceId(pieceId);

    const generatedContent: Record<string, string> = {};

    try {
      const results = await Promise.allSettled(
        selectedPlatforms.map(async (platform) => {
          const contentTypeLabel = CONTENT_TYPES.find(ct => ct.id === contentType)?.label || contentType;
          const prompt = `Create a ${contentTypeLabel} about: ${topic.trim()}`;

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              platform,
              brandDNA: selectedBusiness.brandDNA,
              chatHistory: [],
            }),
          });

          const data = await res.json();
          return { platform, content: data.content || data.error || 'Failed to generate' };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          generatedContent[result.value.platform] = result.value.content;
        } else {
          const platform = selectedPlatforms[results.indexOf(result)];
          generatedContent[platform] = 'Generation failed. Please try again.';
        }
      }

      updateContentPiece(pieceId, {
        generatedContent: generatedContent as Record<Platform, string>,
        status: 'ready',
      });
    } catch {
      updateContentPiece(pieceId, {
        generatedContent: generatedContent as Record<Platform, string>,
        status: 'draft',
      });
    } finally {
      setCreating(false);
      setTopic('');
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !creating) {
      e.preventDefault();
      createContent();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <PenLine size={16} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Content Studio</h3>
        <span className="text-xs text-gray-500">Create content across platforms</span>
      </div>

      {/* Create Form */}
      <div className="p-4 border-b border-gray-800 space-y-4">
        {!hasBrandDNA && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">Set up your Brand DNA first to start creating content.</p>
          </div>
        )}

        {hasBrandDNA && (
          <>
            {/* Content Type */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => setContentType(ct.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      contentType === ct.id
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                    }`}
                    title={ct.description}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Platforms */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedPlatforms.includes(p.id)
                        ? 'text-white border-transparent'
                        : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: selectedPlatforms.includes(p.id) ? p.color + '30' : undefined,
                      borderColor: selectedPlatforms.includes(p.id) ? p.color + '50' : undefined,
                      color: selectedPlatforms.includes(p.id) ? p.color : undefined,
                    }}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
              {selectedPlatforms.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Select at least one platform</p>
              )}
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Topic / Brief</label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the content you want to create..."
                disabled={creating}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={createContent}
              disabled={!topic.trim() || selectedPlatforms.length === 0 || creating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating content for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Create Content
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Content Pieces List */}
      <div className="flex-1 overflow-y-auto">
        {businessPieces.length === 0 && hasBrandDNA && (
          <div className="text-center py-12 text-gray-600">
            <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content created yet</p>
            <p className="text-xs mt-1">Fill out the form above to generate your first piece</p>
          </div>
        )}

        {businessPieces.map(piece => {
          const isExpanded = expandedPieceId === piece.id;
          const contentTypeLabel = CONTENT_TYPES.find(ct => ct.id === piece.contentType)?.label || piece.contentType;

          return (
            <div key={piece.id} className="border-b border-gray-800">
              {/* Piece Header */}
              <button
                onClick={() => setExpandedPieceId(isExpanded ? null : piece.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-400">{contentTypeLabel}</span>
                    <span className="text-gray-700">|</span>
                    {piece.status === 'generating' ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Loader2 size={10} className="animate-spin" />
                        Generating
                      </span>
                    ) : (
                      <span className="text-xs text-green-400">Ready</span>
                    )}
                  </div>
                  <p className="text-sm text-white truncate">{piece.topic}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {piece.platforms.map(pid => {
                      const pInfo = PLATFORMS.find(p => p.id === pid);
                      return pInfo ? (
                        <span key={pid} className="text-xs" title={pInfo.label}>{pInfo.icon}</span>
                      ) : null;
                    })}
                    <span className="text-xs text-gray-600 ml-1">
                      {new Date(piece.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteContentPiece(piece.id); }}
                    className="p-1 rounded hover:bg-gray-800 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && piece.status === 'ready' && (
                <div className="px-4 pb-4 space-y-3">
                  {piece.platforms.map(pid => {
                    const pInfo = PLATFORMS.find(p => p.id === pid);
                    const content = piece.generatedContent[pid];
                    if (!pInfo || !content) return null;
                    const copyKey = `${piece.id}-${pid}`;

                    return (
                      <div key={pid} className="rounded-xl bg-gray-800/50 border border-gray-700 overflow-hidden">
                        <div
                          className="px-3 py-2 flex items-center justify-between border-b border-gray-700"
                          style={{ borderTopColor: pInfo.color, borderTopWidth: '2px' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pInfo.icon}</span>
                            <span className="text-xs font-medium text-white">{pInfo.label}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(content, copyKey)}
                            className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                            title="Copy content"
                          >
                            {copiedKey === copyKey ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="px-3 py-2.5 text-sm text-gray-300 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
