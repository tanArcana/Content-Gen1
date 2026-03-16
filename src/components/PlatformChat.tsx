'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS, ChatMessage } from '@/types';
import { Send, Loader2, Trash2, Copy, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PlatformChatProps {
  platform: Platform;
}

export default function PlatformChat({ platform }: PlatformChatProps) {
  const { selectedBusiness, addChatMessage, clearChat } = useBusinessContext();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const platformInfo = PLATFORMS.find(p => p.id === platform)!;
  const messages = useMemo(
    () => selectedBusiness?.chats[platform] || [],
    [selectedBusiness?.chats, platform]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedBusiness || !selectedBusiness.brandDNA || loading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    addChatMessage(selectedBusiness.id, platform, userMessage);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          platform,
          brandDNA: selectedBusiness.brandDNA,
          chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.content || data.error || 'Failed to generate content',
        timestamp: Date.now(),
      };

      addChatMessage(selectedBusiness.id, platform, assistantMessage);
    } catch {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'An error occurred. Please try again.',
        timestamp: Date.now(),
      };
      addChatMessage(selectedBusiness.id, platform, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Share a trending topic', 'Promote a new product', 'Engage our community', 'Share industry insight'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-800 text-xs text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
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

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasBrandDNA ? `Describe a topic or trend for ${platformInfo.label}...` : 'Set up Brand DNA first'}
            disabled={!hasBrandDNA || loading}
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasBrandDNA || loading}
            className="px-4 py-2.5 rounded-xl text-white font-medium disabled:opacity-30 transition-all shrink-0"
            style={{ backgroundColor: loading ? '#4B5563' : platformInfo.color }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        {platformInfo.maxLength && (
          <p className="text-xs text-gray-600 mt-1.5 text-right">
            Platform limit: {platformInfo.maxLength.toLocaleString()} chars
          </p>
        )}
      </div>
    </div>
  );
}
