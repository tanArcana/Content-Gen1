'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { BrandDNA } from '@/types';
import { Globe, Sparkles, Save, Loader2, Edit3, X, Check } from 'lucide-react';

export default function BrandDNAPanel() {
  const { selectedBusiness, updateBrandDNA } = useBusinessContext();
  const [mode, setMode] = useState<'view' | 'url' | 'brainstorm' | 'edit'>('view');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Brainstorm fields
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');

  // Edit fields
  const [editDNA, setEditDNA] = useState<BrandDNA | null>(null);

  if (!selectedBusiness) return null;

  const brandDNA = selectedBusiness.brandDNA;

  const handleExtractFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brand-dna/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateBrandDNA(selectedBusiness.id, data.brandDNA);
      setMode('view');
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract brand DNA');
    } finally {
      setLoading(false);
    }
  };

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
    setEditDNA(brandDNA ? { ...brandDNA } : null);
    setMode('edit');
  };

  const saveEdit = () => {
    if (editDNA) {
      updateBrandDNA(selectedBusiness.id, editDNA);
    }
    setMode('view');
  };

  // No Brand DNA yet
  if (!brandDNA && mode === 'view') {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Brand DNA</h3>
        <p className="text-gray-400 text-sm mb-6">
          Define your brand&apos;s identity to generate on-brand content across all platforms.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('url')}
            className="p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 bg-gray-900/50 hover:bg-gray-900 transition-all group text-left"
          >
            <Globe className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
            <h4 className="font-medium text-white mb-1">Extract from URL</h4>
            <p className="text-xs text-gray-500">Analyze your website to auto-generate brand DNA</p>
          </button>
          <button
            onClick={() => setMode('brainstorm')}
            className="p-6 rounded-xl border border-gray-800 hover:border-pink-500/50 bg-gray-900/50 hover:bg-gray-900 transition-all group text-left"
          >
            <Sparkles className="text-pink-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
            <h4 className="font-medium text-white mb-1">AI Brainstorm</h4>
            <p className="text-xs text-gray-500">Build brand DNA through guided AI questions</p>
          </button>
        </div>
      </div>
    );
  }

  // URL extraction mode
  if (mode === 'url') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Extract Brand DNA from URL</h3>
          <button onClick={() => setMode('view')} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Enter your website URL and we&apos;ll analyze it to extract your brand&apos;s DNA.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://yourbusiness.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExtractFromUrl()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleExtractFromUrl}
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            Extract
          </button>
        </div>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  // Brainstorm mode
  if (mode === 'brainstorm') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Brand Brainstorm</h3>
          <button onClick={() => setMode('view')} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Tell us about your business and AI will craft your brand DNA.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Industry</label>
            <input
              type="text"
              placeholder="e.g., SaaS, Fashion, Food & Beverage"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
            <input
              type="text"
              placeholder="e.g., Tech-savvy millennials, Small business owners"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleBrainstorm}
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate Brand DNA
          </button>
        </div>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  // Edit mode
  if (mode === 'edit' && editDNA) {
    return (
      <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Edit Brand DNA</h3>
          <div className="flex gap-2">
            <button onClick={() => setMode('view')} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white">
              <X size={18} />
            </button>
            <button onClick={saveEdit} className="p-1.5 rounded-md hover:bg-green-500/20 text-green-400">
              <Check size={18} />
            </button>
          </div>
        </div>
        {([
          { key: 'voice', label: 'Brand Voice' },
          { key: 'tone', label: 'Tone' },
          { key: 'personality', label: 'Personality' },
          { key: 'targetAudience', label: 'Target Audience' },
        ] as const).map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <textarea
              value={editDNA[key]}
              onChange={e => setEditDNA({ ...editDNA, [key]: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        ))}
        {([
          { key: 'values', label: 'Core Values' },
          { key: 'keywords', label: 'Keywords' },
          { key: 'uniqueSellingPoints', label: 'Unique Selling Points' },
          { key: 'contentThemes', label: 'Content Themes' },
        ] as const).map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label} (comma-separated)</label>
            <textarea
              value={editDNA[key]?.join(', ')}
              onChange={e => setEditDNA({ ...editDNA, [key]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
        ))}
      </div>
    );
  }

  // View mode (has brand DNA)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Brand DNA</h3>
        <div className="flex gap-2">
          <button
            onClick={startEdit}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setMode('url')}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Re-extract from URL"
          >
            <Globe size={16} />
          </button>
          <button
            onClick={() => setMode('brainstorm')}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Re-brainstorm"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {brandDNA?.sourceUrl && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Globe size={12} /> Extracted from {brandDNA.sourceUrl}
          </div>
        )}

        <DNAField label="Voice" value={brandDNA?.voice || ''} />
        <DNAField label="Tone" value={brandDNA?.tone || ''} />
        <DNAField label="Personality" value={brandDNA?.personality || ''} />
        <DNAField label="Target Audience" value={brandDNA?.targetAudience || ''} />

        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Core Values</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {brandDNA?.values?.map((v, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs">{v}</span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {brandDNA?.keywords?.map((k, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-xs">{k}</span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Selling Points</span>
          <ul className="mt-1 space-y-1">
            {brandDNA?.uniqueSellingPoints?.map((u, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span> {u}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Content Themes</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {brandDNA?.contentThemes?.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 text-xs">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DNAField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <p className="text-sm text-gray-300 mt-0.5">{value}</p>
    </div>
  );
}
