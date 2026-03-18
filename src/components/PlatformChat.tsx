'use client';

import { useState, useRef, useEffect } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS, ChatMessage, ContentBrief, CONTENT_FORMATS } from '@/types';
import { Loader2, Trash2, Copy, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ContentBriefForm from './ContentBriefForm';

interface PlatformChatProps {
  platform: Platform;
}

export default function PlatformChat({ platform }: PlatformChatProps) {
  const { selectedBusiness, addChatMessage, clearChat } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const platformInfo = PLATFORMS.find(p => p.id === platform)!;
  const messages = selectedBusiness?.chats[platform] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBriefSubmit = async (brief: ContentBrief) => {
    if (!selectedBusiness || !selectedBusiness.brandDNA || loading) return;

    const formatLabel = CONTENT_FORMATS.find(f => f.id === brief.format)?.label || brief.format;
    const platformLabels = brief.platforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label || p);
    const displayParts = [`**Topic:** ${brief.topic}`, `**Format:** ${formatLabel}`];
    if (brief.platforms.length > 1) displayParts.push(`**Platforms:** ${platformLabels.join(', ')}`);
    if (brief.tone) displayParts.push(`**Tone:** ${brief.tone}`);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: displayParts.join('\n'),
      timestamp: Date.now(),
    };

    addChatMessage(selectedBusiness.id, platform, userMessage);
    setLoading(true);

    // Generate for each selected platform
    const targetPlatforms = brief.platforms.length > 0 ? brief.platforms : [platform];

    for (const targetPlatform of targetPlatforms) {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: brief.topic,
            platform: targetPlatform,
            brandDNA: selectedBusiness.brandDNA,
            chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
            contentFormat: brief.format,
            toneOverride: brief.tone,
          }),
        });

        const data = await res.json();
        const targetLabel = targetPlatforms.length > 1
          ? `**${PLATFORMS.find(p => p.id === targetPlatform)?.label}:**\n\n`
          : '';

        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: targetLabel + (data.content || data.error || 'Failed to generate content'),
          timestamp: Date.now(),
        };

        addChatMessage(selectedBusiness.id, platform, assistantMessage);
      } catch {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `An error occurred generating ${PLATFORMS.find(p => p.id === targetPlatform)?.label} content. Please try again.`,
          timestamp: Date.now(),
        };
        addChatMessage(selectedBusiness.id, platform, errorMessage);
      }
    }

    setLoading(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!selectedBusiness) return null;

  const hasBrandDNA = !!selectedBusiness.brandDNA;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-800 flex items-center justify-between"
        style={{ borderTopColor: platformInfo.color, borderTopWidth: '2px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{platformInfo.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-white">{platformInfo.label}</h3>
            <p className="text-xs text-gray-500">{platformInfo.description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => clearChat(selectedBusiness.id, platform)}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-600 hover:text-red-400 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasBrandDNA && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Set up your Brand DNA first to start generating content.</p>
          </div>
        )}

        {hasBrandDNA && messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl mb-3 block">{platformInfo.icon}</span>
            <p className="text-sm font-medium text-gray-400 mb-1">Ready to create {platformInfo.label} content</p>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Describe a topic, trend, or idea and get optimized {platformInfo.label} content
              tailored to your brand&apos;s DNA.
            </p>
            <p className="text-xs text-gray-600 mt-3">Use the content brief form below to get started.</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-200'
            }`}>
              <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
              <div className="flex items-center justify-between mt-2 gap-4">
                <span className="text-xs opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    title="Copy content"
                  >
                    {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Generating {platformInfo.label} content...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Content Brief Form */}
      <ContentBriefForm
        currentPlatform={platform}
        onSubmit={handleBriefSubmit}
        disabled={!hasBrandDNA || loading}
      />
    </div>
  );
}
