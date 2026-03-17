'use client';

import { useState, useMemo } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS, BUILT_IN_TEMPLATES, PromptTemplate } from '@/types';
import { ArrowLeft, Plus, Trash2, Zap, Layers, X } from 'lucide-react';

interface TemplatesPanelProps {
  onBack: () => void;
  onUseTemplate?: (template: PromptTemplate) => void;
}

export default function TemplatesPanel({ onBack, onUseTemplate }: TemplatesPanelProps) {
  const { customTemplates, addTemplate, deleteTemplate } = useBusinessContext();
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newPlatform, setNewPlatform] = useState<Platform | 'all'>('all');
  const [newCategory, setNewCategory] = useState('');

  const allTemplates = useMemo(() => {
    return [...BUILT_IN_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  const filtered = useMemo(() => {
    if (platformFilter === 'all') return allTemplates;
    return allTemplates.filter(t => t.platform === platformFilter || t.platform === 'all');
  }, [allTemplates, platformFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, PromptTemplate[]> = {};
    filtered.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filtered]);

  const handleAdd = () => {
    if (!newName.trim() || !newPrompt.trim()) return;
    addTemplate({
      name: newName.trim(),
      prompt: newPrompt.trim(),
      platform: newPlatform,
      category: newCategory.trim() || 'Custom',
    });
    setNewName('');
    setNewPrompt('');
    setNewPlatform('all');
    setNewCategory('');
    setShowAdd(false);
  };

  const getPlatformLabel = (platform: Platform | 'all') => {
    if (platform === 'all') return 'All Platforms';
    return PLATFORMS.find(p => p.id === platform)?.label || platform;
  };

  const getPlatformColor = (platform: Platform | 'all') => {
    if (platform === 'all') return '#8B5CF6';
    return PLATFORMS.find(p => p.id === platform)?.color || '#8B5CF6';
  };

  const getPlatformIcon = (platform: Platform | 'all') => {
    if (platform === 'all') return '🌐';
    return PLATFORMS.find(p => p.id === platform)?.icon || '📝';
  };

  return (
    <div className="flex-1 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Prompt Templates</h1>
                <p className="text-sm text-gray-500">{allTemplates.length} templates available</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create Template
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Platform filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              platformFilter === 'all' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            All
          </button>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatformFilter(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                platformFilter === p.id ? 'text-white border' : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
              style={{
                backgroundColor: platformFilter === p.id ? `${p.color}20` : undefined,
                borderColor: platformFilter === p.id ? `${p.color}50` : undefined,
                color: platformFilter === p.id ? p.color : undefined,
              }}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* Add Template Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Create Template</h2>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Template Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Weekly Product Feature"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prompt *</label>
                  <textarea
                    placeholder="The prompt that will be sent to generate content..."
                    value={newPrompt}
                    onChange={e => setNewPrompt(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Platform</label>
                    <select
                      value={newPlatform}
                      onChange={e => setNewPlatform(e.target.value as Platform | 'all')}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">All Platforms</option>
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g., Engagement"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newPrompt.trim()}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium transition-colors"
                >
                  Create Template
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grouped Templates */}
        {Object.entries(grouped).map(([category, templates]) => (
          <div key={category} className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers size={14} />
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="group p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-700 transition-all cursor-pointer"
                  onClick={() => onUseTemplate?.(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getPlatformIcon(template.platform)}</span>
                      <h4 className="text-sm font-medium text-white">{template.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.isBuiltIn ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">Built-in</span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); deleteTemplate(template.id); }}
                          className="p-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${getPlatformColor(template.platform)}15`, color: getPlatformColor(template.platform) }}
                    >
                      {getPlatformLabel(template.platform)}
                    </span>
                    {onUseTemplate && (
                      <span className="flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Zap size={10} /> Use
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
