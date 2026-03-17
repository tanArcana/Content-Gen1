'use client';

import { useState, useMemo } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS, SavedContent } from '@/types';
import { Star, Trash2, Copy, Check, Search, Filter, ArrowLeft, Tag, X } from 'lucide-react';

export default function ContentLibrary({ onBack }: { onBack: () => void }) {
  const { savedContent, businesses, toggleStarContent, deleteContent, updateContentTags } = useBusinessContext();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [businessFilter, setBusinessFilter] = useState<string | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const filtered = useMemo(() => {
    return savedContent.filter(item => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      if (starredOnly && !item.starred) return false;
      if (businessFilter !== 'all' && item.businessId !== businessFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.content.toLowerCase().includes(q) || item.prompt.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [savedContent, search, platformFilter, starredOnly, businessFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTag = (id: string) => {
    if (!tagInput.trim()) return;
    const item = savedContent.find(c => c.id === id);
    if (item && !item.tags.includes(tagInput.trim())) {
      updateContentTags(id, [...item.tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (id: string, tag: string) => {
    const item = savedContent.find(c => c.id === id);
    if (item) {
      updateContentTags(id, item.tags.filter(t => t !== tag));
    }
  };

  const getBusinessName = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.name || 'Unknown';
  };

  const getPlatformInfo = (platform: Platform) => {
    return PLATFORMS.find(p => p.id === platform)!;
  };

  const stats = useMemo(() => ({
    total: savedContent.length,
    starred: savedContent.filter(c => c.starred).length,
    byPlatform: PLATFORMS.map(p => ({
      platform: p,
      count: savedContent.filter(c => c.platform === p.id).length,
    })),
  }), [savedContent]);

  return (
    <div className="flex-1 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Content Library</h1>
              <p className="text-sm text-gray-500">Your saved generated content across all platforms</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">{stats.total} saved</span>
            <span className="text-yellow-400 flex items-center gap-1"><Star size={12} fill="currentColor" /> {stats.starred} starred</span>
            {stats.byPlatform.map(({ platform, count }) => count > 0 && (
              <span key={platform.id} className="flex items-center gap-1 text-gray-500">
                <span>{platform.icon}</span> {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search content, prompts, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
            ))}
          </select>

          <select
            value={businessFilter}
            onChange={e => setBusinessFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Businesses</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all ${
              starredOnly
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Star size={14} fill={starredOnly ? 'currentColor' : 'none'} />
            Starred
          </button>
        </div>

        {/* Empty State */}
        {savedContent.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <Filter className="text-gray-600" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No saved content yet</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Save generated content from your platform chats to build your content library. Look for the bookmark icon on assistant messages.
            </p>
          </div>
        )}

        {/* No results */}
        {savedContent.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No content matches your filters.</p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => {
            const pInfo = getPlatformInfo(item.platform);
            return (
              <div key={item.id} className="group rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-all overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: pInfo.color }}>{pInfo.icon}</span>
                    <span className="text-xs font-medium text-gray-400">{pInfo.label}</span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-gray-500">{getBusinessName(item.businessId)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStarContent(item.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.starred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star size={14} fill={item.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="p-1.5 rounded-md text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copiedId === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => deleteContent(item.id)}
                      className="p-1.5 rounded-md text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div className="px-4 pt-3">
                  <p className="text-xs text-gray-500 truncate">Prompt: {item.prompt}</p>
                </div>

                {/* Content preview */}
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-300 line-clamp-4 whitespace-pre-wrap">{item.content}</p>
                </div>

                {/* Tags & date */}
                <div className="px-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs">
                        {tag}
                        {editingTagsId === item.id && (
                          <button onClick={() => handleRemoveTag(item.id, tag)} className="hover:text-red-400">
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                    {editingTagsId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddTag(item.id)}
                          placeholder="Add tag..."
                          className="w-20 px-2 py-0.5 rounded bg-gray-800 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button onClick={() => { setEditingTagsId(null); setTagInput(''); }} className="text-gray-500 hover:text-white">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTagsId(item.id)}
                        className="p-0.5 rounded text-gray-600 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Add tag"
                      >
                        <Tag size={12} />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
