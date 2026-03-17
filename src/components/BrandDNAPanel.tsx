'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { BrandDNA, DEFAULT_BRAND_DNA } from '@/types';
import { Globe, Sparkles, Loader2, Edit3, X, Check, ChevronRight, Pencil, RotateCcw, Mic, Target, Heart, Hash, Lightbulb, Palette, Users, MessageCircle, Megaphone, Plus, Link, Trash2 } from 'lucide-react';

export default function BrandDNAPanel() {
  const { selectedBusiness, updateBrandDNA } = useBusinessContext();
  const [mode, setMode] = useState<'view' | 'urls' | 'brainstorm' | 'edit' | 'manual'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Multi-URL fields
  const [urls, setUrls] = useState<string[]>(['']);
  const [urlInput, setUrlInput] = useState('');

  // Brainstorm fields
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [whatMakesUnique, setWhatMakesUnique] = useState('');

  // Edit fields
  const [editDNA, setEditDNA] = useState<BrandDNA | null>(null);

  // Manual setup step
  const [manualStep, setManualStep] = useState(0);
  const [manualDNA, setManualDNA] = useState<BrandDNA>({ ...DEFAULT_BRAND_DNA });

  if (!selectedBusiness) return null;

  const brandDNA = selectedBusiness.brandDNA;

  // ─── URL Handlers ────────────────────────────────────────────
  const addUrl = () => {
    if (!urlInput.trim()) return;
    let cleaned = urlInput.trim();
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    if (!urls.includes(cleaned)) {
      setUrls([...urls.filter(u => u), cleaned]);
    }
    setUrlInput('');
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleExtractFromUrls = async () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brand-dna/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: validUrls,
          businessName: selectedBusiness.name,
          businessDescription: selectedBusiness.description,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateBrandDNA(selectedBusiness.id, data.brandDNA);
      setMode('view');
      setUrls(['']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract brand DNA');
    } finally {
      setLoading(false);
    }
  };

  // ─── Brainstorm Handler ──────────────────────────────────────
  const handleBrainstorm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brand-dna/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: selectedBusiness.name,
          description: selectedBusiness.description,
          industry,
          audience,
          competitors,
          whatMakesUnique,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateBrandDNA(selectedBusiness.id, data.brandDNA);
      setMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to brainstorm brand DNA');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setEditDNA(brandDNA ? { ...brandDNA, values: [...(brandDNA.values || [])], keywords: [...(brandDNA.keywords || [])], uniqueSellingPoints: [...(brandDNA.uniqueSellingPoints || [])], contentThemes: [...(brandDNA.contentThemes || [])] } : null);
    setMode('edit');
  };

  const saveEdit = () => {
    if (editDNA) updateBrandDNA(selectedBusiness.id, editDNA);
    setMode('view');
  };

  const saveManual = () => {
    updateBrandDNA(selectedBusiness.id, manualDNA);
    setMode('view');
    setManualStep(0);
  };

  // ─── No Brand DNA - Setup Screen ────────────────────────────
  if (!brandDNA && mode === 'view') {
    return (
      <div className="p-5">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <Palette size={24} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Set Up Brand DNA</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your brand&apos;s DNA powers all content generation. Choose how to define it.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* URLs - Primary option */}
          <button
            onClick={() => { setUrls(['']); setMode('urls'); }}
            className="w-full p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-all group text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Link size={18} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">Add Your URLs</h4>
              <p className="text-xs text-gray-400">Website, socials, about page — AI analyzes everything</p>
            </div>
            <ChevronRight size={16} className="text-purple-400 shrink-0" />
          </button>

          <button
            onClick={() => setMode('brainstorm')}
            className="w-full p-4 rounded-xl border border-gray-800 hover:border-purple-500/40 bg-gray-900/50 hover:bg-gray-900 transition-all group text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">AI Brainstorm</h4>
              <p className="text-xs text-gray-500">Answer a few questions, AI builds your DNA</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
          </button>

          <button
            onClick={() => { setManualDNA({ ...DEFAULT_BRAND_DNA }); setManualStep(0); setMode('manual'); }}
            className="w-full p-4 rounded-xl border border-gray-800 hover:border-green-500/40 bg-gray-900/50 hover:bg-gray-900 transition-all group text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pencil size={18} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">Manual Setup</h4>
              <p className="text-xs text-gray-500">Step-by-step guided wizard</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-green-400 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Multi-URL Mode ──────────────────────────────────────────
  if (mode === 'urls') {
    const validUrls = urls.filter(u => u.trim());
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setMode('view')} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <Link size={16} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Add Business URLs</h3>
        </div>

        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Add all URLs connected to your business — website, Instagram, X/Twitter, LinkedIn, TikTok, about pages, etc. AI will analyze everything to build your complete Brand DNA.
        </p>

        {/* URL List */}
        <div className="space-y-2 mb-3">
          {validUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700/50 group">
              <Globe size={13} className="text-gray-500 shrink-0" />
              <span className="text-sm text-gray-300 truncate flex-1">{url}</span>
              <button
                onClick={() => removeUrl(i)}
                className="p-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Add URL input */}
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            placeholder="https://yourbusiness.com"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
            autoFocus
          />
          <button
            onClick={addUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Quick add suggestions */}
        <div className="mb-5">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Common sources</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Website', placeholder: 'yourbusiness.com', icon: '🌐' },
              { label: 'Instagram', placeholder: 'instagram.com/yourbrand', icon: '📸' },
              { label: 'X / Twitter', placeholder: 'x.com/yourbrand', icon: '𝕏' },
              { label: 'LinkedIn', placeholder: 'linkedin.com/company/you', icon: '💼' },
              { label: 'TikTok', placeholder: 'tiktok.com/@yourbrand', icon: '🎵' },
            ].map(s => (
              <button
                key={s.label}
                onClick={() => setUrlInput(s.placeholder)}
                className="px-2.5 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700 transition-all flex items-center gap-1"
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleExtractFromUrls}
          disabled={loading || validUrls.length === 0}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing {validUrls.length} source{validUrls.length !== 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Build Brand DNA from {validUrls.length} source{validUrls.length !== 1 ? 's' : ''}
            </>
          )}
        </button>

        {validUrls.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-2">Add at least one URL to get started</p>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ─── AI Brainstorm Mode ──────────────────────────────────────
  if (mode === 'brainstorm') {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setMode('view')} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white">AI Brainstorm</h3>
        </div>

        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Tell us about your business and our AI will craft a complete brand DNA profile.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Megaphone size={11} className="text-purple-400" />
              Industry / Niche
            </label>
            <input type="text" placeholder="e.g., SaaS, Fashion, Food & Beverage" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Users size={11} className="text-purple-400" />
              Target Audience
            </label>
            <input type="text" placeholder="e.g., Tech-savvy millennials, Small business owners" value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Target size={11} className="text-purple-400" />
              Key Competitors
            </label>
            <input type="text" placeholder="e.g., Competitor A, Competitor B" value={competitors} onChange={e => setCompetitors(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Lightbulb size={11} className="text-purple-400" />
              What Makes You Unique?
            </label>
            <textarea placeholder="Describe what sets your brand apart..." value={whatMakesUnique} onChange={e => setWhatMakesUnique(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 resize-none" />
          </div>

          <button onClick={handleBrainstorm} disabled={loading} className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all">
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Crafting your Brand DNA...</>
            ) : (
              <><Sparkles size={14} /> Generate Brand DNA</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Manual Step-by-Step Wizard ──────────────────────────────
  if (mode === 'manual') {
    const steps = [
      {
        title: 'Voice & Personality',
        icon: <Mic size={16} className="text-purple-400" />,
        fields: (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Brand Voice</label>
              <textarea value={manualDNA.voice} onChange={e => setManualDNA({ ...manualDNA, voice: e.target.value })} placeholder="e.g., Confident, friendly, and approachable" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 resize-none" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tone</label>
              <textarea value={manualDNA.tone} onChange={e => setManualDNA({ ...manualDNA, tone: e.target.value })} placeholder="e.g., Professional yet casual, witty" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Personality</label>
              <textarea value={manualDNA.personality} onChange={e => setManualDNA({ ...manualDNA, personality: e.target.value })} placeholder="e.g., Bold innovator, trusted advisor" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 resize-none" />
            </div>
          </div>
        ),
      },
      {
        title: 'Audience & Values',
        icon: <Heart size={16} className="text-pink-400" />,
        fields: (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Audience</label>
              <textarea value={manualDNA.targetAudience} onChange={e => setManualDNA({ ...manualDNA, targetAudience: e.target.value })} placeholder="Who are you speaking to?" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500 resize-none" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Core Values (comma-separated)</label>
              <textarea value={manualDNA.values.join(', ')} onChange={e => setManualDNA({ ...manualDNA, values: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g., Innovation, Transparency, Community" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-pink-500 resize-none" />
            </div>
          </div>
        ),
      },
      {
        title: 'Keywords & USPs',
        icon: <Hash size={16} className="text-blue-400" />,
        fields: (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Keywords (comma-separated)</label>
              <textarea value={manualDNA.keywords.join(', ')} onChange={e => setManualDNA({ ...manualDNA, keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g., AI, Productivity, Growth" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Unique Selling Points (comma-separated)</label>
              <textarea value={manualDNA.uniqueSellingPoints.join(', ')} onChange={e => setManualDNA({ ...manualDNA, uniqueSellingPoints: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="What makes you stand out?" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Content Themes (comma-separated)</label>
              <textarea value={manualDNA.contentThemes.join(', ')} onChange={e => setManualDNA({ ...manualDNA, contentThemes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g., Industry insights, Behind the scenes" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
        ),
      },
    ];

    const currentStep = steps[manualStep];

    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { if (manualStep > 0) setManualStep(manualStep - 1); else setMode('view'); }} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
          <h3 className="text-sm font-bold text-white">Manual Setup</h3>
        </div>

        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= manualStep ? 'bg-purple-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">{currentStep.icon}</div>
          <div>
            <p className="text-xs text-gray-500">Step {manualStep + 1} of {steps.length}</p>
            <h4 className="text-sm font-semibold text-white">{currentStep.title}</h4>
          </div>
        </div>

        {currentStep.fields}

        <div className="flex gap-2 mt-5">
          {manualStep > 0 && (
            <button onClick={() => setManualStep(manualStep - 1)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors">Back</button>
          )}
          {manualStep < steps.length - 1 ? (
            <button onClick={() => setManualStep(manualStep + 1)} className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">Continue</button>
          ) : (
            <button onClick={saveManual} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all">
              <Check size={14} /> Save Brand DNA
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Edit Mode ───────────────────────────────────────────────
  if (mode === 'edit' && editDNA) {
    const sections = [
      {
        title: 'Voice & Identity',
        icon: <Mic size={13} className="text-purple-400" />,
        fields: [
          { key: 'voice' as const, label: 'Brand Voice', placeholder: 'How does your brand speak?' },
          { key: 'tone' as const, label: 'Tone', placeholder: 'What feeling does your brand convey?' },
          { key: 'personality' as const, label: 'Personality', placeholder: 'What is your brand\'s character?' },
        ],
      },
      {
        title: 'Audience',
        icon: <Users size={13} className="text-pink-400" />,
        fields: [
          { key: 'targetAudience' as const, label: 'Target Audience', placeholder: 'Who are you speaking to?' },
        ],
      },
    ];

    const arraySections = [
      { key: 'values' as const, label: 'Core Values', icon: <Heart size={13} className="text-red-400" /> },
      { key: 'keywords' as const, label: 'Keywords', icon: <Hash size={13} className="text-blue-400" /> },
      { key: 'uniqueSellingPoints' as const, label: 'Unique Selling Points', icon: <Lightbulb size={13} className="text-yellow-400" /> },
      { key: 'contentThemes' as const, label: 'Content Themes', icon: <MessageCircle size={13} className="text-green-400" /> },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Edit3 size={14} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Edit Brand DNA</h3>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setMode('view')} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs transition-colors">Cancel</button>
            <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Check size={12} /> Save
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {sections.map(section => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-2.5">
                {section.icon}
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</span>
              </div>
              <div className="space-y-2.5">
                {section.fields.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <textarea value={editDNA[key]} onChange={e => setEditDNA({ ...editDNA, [key]: e.target.value })} placeholder={placeholder} rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 resize-none placeholder:text-gray-600" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {arraySections.map(({ key, label, icon }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2.5">
                {icon}
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <textarea value={editDNA[key]?.join(', ')} onChange={e => setEditDNA({ ...editDNA, [key]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder={`Enter ${label.toLowerCase()}, separated by commas`} rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 resize-none placeholder:text-gray-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── View Mode (has Brand DNA) ───────────────────────────────
  const completeness = brandDNA ? calculateCompleteness(brandDNA) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette size={14} className="text-purple-400" />
            Brand DNA
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={startEdit} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors" title="Edit">
              <Edit3 size={14} />
            </button>
            <button onClick={() => { setUrls(brandDNA?.sourceUrls || ['']); setMode('urls'); }} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-blue-400 transition-colors" title="Re-analyze URLs">
              <Globe size={14} />
            </button>
            <button onClick={() => setMode('brainstorm')} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-purple-400 transition-colors" title="Re-brainstorm with AI">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Completeness bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completeness}%`, background: completeness === 100 ? 'linear-gradient(90deg, #8B5CF6, #EC4899)' : '#8B5CF6' }} />
          </div>
          <span className="text-[10px] font-medium text-gray-500">{completeness}%</span>
        </div>
      </div>

      {/* Scrollable DNA cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Source URLs */}
        {brandDNA?.sourceUrls && brandDNA.sourceUrls.length > 0 && (
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Link size={11} className="text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Sources ({brandDNA.sourceUrls.length})</span>
            </div>
            <div className="space-y-1">
              {brandDNA.sourceUrls.map((url, i) => (
                <p key={i} className="text-xs text-blue-300/70 truncate">{url}</p>
              ))}
            </div>
          </div>
        )}
        {brandDNA?.sourceUrl && !brandDNA?.sourceUrls && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400">
            <Globe size={11} />
            <span className="truncate">Extracted from {brandDNA.sourceUrl}</span>
          </div>
        )}

        {/* Voice & Identity Card */}
        <DNACard icon={<Mic size={13} className="text-purple-400" />} title="Voice & Identity">
          {brandDNA?.voice && <DNAField label="Voice" value={brandDNA.voice} />}
          {brandDNA?.tone && <DNAField label="Tone" value={brandDNA.tone} />}
          {brandDNA?.personality && <DNAField label="Personality" value={brandDNA.personality} />}
        </DNACard>

        {brandDNA?.targetAudience && (
          <DNACard icon={<Users size={13} className="text-pink-400" />} title="Target Audience">
            <p className="text-sm text-gray-300 leading-relaxed">{brandDNA.targetAudience}</p>
          </DNACard>
        )}

        {brandDNA?.values && brandDNA.values.length > 0 && (
          <DNACard icon={<Heart size={13} className="text-red-400" />} title="Core Values">
            <div className="flex flex-wrap gap-1.5">
              {brandDNA.values.map((v, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/8 border border-red-500/10 text-red-300 text-xs font-medium">{v}</span>
              ))}
            </div>
          </DNACard>
        )}

        {brandDNA?.keywords && brandDNA.keywords.length > 0 && (
          <DNACard icon={<Hash size={13} className="text-blue-400" />} title="Keywords">
            <div className="flex flex-wrap gap-1.5">
              {brandDNA.keywords.map((k, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/8 border border-blue-500/10 text-blue-300 text-xs font-medium">{k}</span>
              ))}
            </div>
          </DNACard>
        )}

        {brandDNA?.uniqueSellingPoints && brandDNA.uniqueSellingPoints.length > 0 && (
          <DNACard icon={<Lightbulb size={13} className="text-yellow-400" />} title="Unique Selling Points">
            <ul className="space-y-1.5">
              {brandDNA.uniqueSellingPoints.map((u, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {u}
                </li>
              ))}
            </ul>
          </DNACard>
        )}

        {brandDNA?.contentThemes && brandDNA.contentThemes.length > 0 && (
          <DNACard icon={<MessageCircle size={13} className="text-green-400" />} title="Content Themes">
            <div className="flex flex-wrap gap-1.5">
              {brandDNA.contentThemes.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-green-500/8 border border-green-500/10 text-green-300 text-xs font-medium">{t}</span>
              ))}
            </div>
          </DNACard>
        )}
      </div>
    </div>
  );
}

function DNACard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-gray-900/30 overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-gray-800/50 flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-3.5 py-3">{children}</div>
    </div>
  );
}

function DNAField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{value}</p>
    </div>
  );
}

function calculateCompleteness(dna: BrandDNA): number {
  const fields = [
    dna.voice,
    dna.tone,
    dna.personality,
    dna.targetAudience,
    dna.values?.length > 0,
    dna.keywords?.length > 0,
    dna.uniqueSellingPoints?.length > 0,
    dna.contentThemes?.length > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
