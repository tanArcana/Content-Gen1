'use client';

import { useState, useRef, useEffect } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { ChatMessage, InstagramContentType, INSTAGRAM_CONTENT_TYPES } from '@/types';
import { Send, Loader2, Trash2, Copy, Check, Sparkles, RotateCcw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CONTENT_SUGGESTIONS: Record<InstagramContentType, string[]> = {
  post: [
    'Create a carousel about our top 5 tips',
    'Write a product launch announcement',
    'Make a motivational quote post',
    'Design a before/after transformation post',
  ],
  story: [
    'Create a poll about trending topics',
    'Build a "this or that" story series',
    'Make a behind-the-scenes story sequence',
    'Design a product teaser countdown',
  ],
  reel: [
    'Script a "day in the life" reel',
    'Create a trending tutorial reel',
    'Write a myth-busting reel script',
    'Make a quick tips reel under 15 seconds',
  ],
};

export default function InstagramAgent() {
  const { selectedBusiness, addChatMessage, clearChat } = useBusinessContext();
  const [contentType, setContentType] = useState<InstagramContentType>('post');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = selectedBusiness?.chats.instagram || [];
  const hasBrandDNA = !!selectedBusiness?.brandDNA;
  const activeConfig = INSTAGRAM_CONTENT_TYPES.find(t => t.id === contentType)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedBusiness?.brandDNA || loading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: `[${activeConfig.label}] ${input.trim()}`,
      timestamp: Date.now(),
    };

    addChatMessage(selectedBusiness.id, 'instagram', userMessage);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input.trim(),
          contentType,
          brandDNA: selectedBusiness.brandDNA,
          chatHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.content || data.error || 'Failed to generate content',
        timestamp: Date.now(),
      };

      addChatMessage(selectedBusiness.id, 'instagram', assistantMessage);
    } catch {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'An error occurred. Please try again.',
        timestamp: Date.now(),
      };
      addChatMessage(selectedBusiness.id, 'instagram', errorMessage);
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

  return (
    <div className="flex flex-col h-full">
      {/* Instagram Agent Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-[#833AB4]/10 via-[#E1306C]/10 to-[#F77737]/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Instagram AI Agent</h3>
              <p className="text-xs text-gray-500">Generate posts, stories & reels on-brand</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => clearChat(selectedBusiness.id, 'instagram')}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-800 text-gray-600 hover:text-red-400 transition-colors text-xs"
                title="Clear chat"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="flex gap-2">
          {INSTAGRAM_CONTENT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setContentType(type.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                contentType === type.id
                  ? 'border-white/20 text-white shadow-lg'
                  : 'border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
              style={{
                backgroundColor: contentType === type.id ? `${type.color}25` : 'transparent',
                boxShadow: contentType === type.id ? `0 0 20px ${type.color}15` : undefined,
              }}
            >
              <span className="text-base">{type.icon}</span>
              <div className="text-left hidden sm:block">
                <div>{type.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasBrandDNA && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Set up your Brand DNA first to start generating Instagram content.</p>
          </div>
        )}

        {hasBrandDNA && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
              <span className="text-2xl">{activeConfig.icon}</span>
            </div>
            <p className="text-sm font-medium text-gray-300 mb-1">
              Create {activeConfig.label} Content
            </p>
            <p className="text-xs text-gray-600 max-w-sm mx-auto mb-5">
              {activeConfig.description}. Describe your idea and the AI agent will generate
              optimized content tailored to your brand.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {CONTENT_SUGGESTIONS[contentType].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-full text-xs transition-colors border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
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
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'text-white'
                  : 'bg-gray-800/80 text-gray-200 border border-gray-700/50'
              }`}
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)'
                  : undefined,
              }}
            >
              <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {msg.content}
              </div>
              <div className="flex items-center justify-between mt-2 gap-4">
                <span className="text-xs opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="opacity-50 hover:opacity-100 transition-opacity p-1"
                      title="Copy content"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={() => {
                        const userMsg = messages.find(
                          (m, i) => m.role === 'user' && messages[i + 1]?.id === msg.id
                        );
                        if (userMsg) {
                          const originalPrompt = userMsg.content.replace(/^\[.*?\]\s*/, '');
                          setInput(originalPrompt);
                          inputRef.current?.focus();
                        }
                      }}
                      className="opacity-50 hover:opacity-100 transition-opacity p-1"
                      title="Regenerate"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-2xl px-4 py-3 border border-gray-700/50">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 size={14} className="animate-spin text-pink-400" />
                <span className="text-gray-400">
                  Generating {activeConfig.label.toLowerCase()} content...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/80">
        <div className="flex items-center gap-1 mb-2">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${activeConfig.color}20`, color: activeConfig.color }}
          >
            {activeConfig.icon} {activeConfig.label}
          </span>
          <span className="text-xs text-gray-600">
            — Describe your idea, topic, or trend
          </span>
        </div>

        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasBrandDNA
                ? `What ${activeConfig.label.toLowerCase()} do you want to create?`
                : 'Set up Brand DNA first'
            }
            disabled={!hasBrandDNA || loading}
            rows={2}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50 disabled:opacity-50 resize-none transition-colors"
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !hasBrandDNA || loading}
            className="px-4 py-2.5 rounded-xl text-white font-medium disabled:opacity-30 transition-all shrink-0 self-end"
            style={{
              background: loading
                ? '#4B5563'
                : 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
