'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { PLATFORMS } from '@/types';
import BusinessWorkspace from './BusinessWorkspace';
import { Plus, Building2, Dna, MessageSquare, Trash2, Clock } from 'lucide-react';

export default function Dashboard() {
  const { businesses, selectedBusiness, selectBusiness, addBusiness, deleteBusiness } = useBusinessContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // If a business is selected, show its workspace
  if (selectedBusiness) {
    return <BusinessWorkspace onBack={() => selectBusiness(null)} />;
  }

  const handleAdd = () => {
    if (!newName.trim()) return;
    addBusiness(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div className="flex-1 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                  ✦
                </div>
                ContentGen
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Multi-Business Brand Dashboard — Generate on-brand content across platforms
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              <Plus size={18} />
              Add Business
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Business Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-semibold text-white mb-1">Add New Business</h2>
              <p className="text-sm text-gray-500 mb-4">Start creating on-brand content for a new business</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corp"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && newName.trim() && handleAdd()}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the business"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && newName.trim() && handleAdd()}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium transition-colors"
                >
                  Create Business
                </button>
                <button
                  onClick={() => { setShowAdd(false); setNewName(''); setNewDesc(''); }}
                  className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-gray-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No businesses yet</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Add your first business to start generating on-brand content optimized for Instagram, X/Twitter, LinkedIn, and TikTok.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all"
            >
              <Plus size={18} />
              Add Your First Business
            </button>
          </div>
        )}

        {/* Business Grid */}
        {businesses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Your Businesses
                <span className="text-gray-600 font-normal ml-2">({businesses.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map(biz => {
                const totalMessages = Object.values(biz.chats).reduce((sum, msgs) => sum + msgs.length, 0);
                const lastActivity = Math.max(
                  ...Object.values(biz.chats).flatMap(msgs => msgs.map(m => m.timestamp)),
                  biz.createdAt
                );
                const activePlatforms = PLATFORMS.filter(p => biz.chats[p.id]?.length > 0);

                return (
                  <div
                    key={biz.id}
                    onClick={() => selectBusiness(biz.id)}
                    className="group relative p-5 rounded-xl border border-gray-800 hover:border-purple-500/40 bg-gray-900/50 hover:bg-gray-900 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/5"
                  >
                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteBusiness(biz.id); }}
                      className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
                      title="Delete business"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Business logo/initial */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                        {biz.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{biz.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{biz.description || 'No description'}</p>
                      </div>
                    </div>

                    {/* Brand DNA status */}
                    <div className={`flex items-center gap-1.5 text-xs mb-3 ${
                      biz.brandDNA ? 'text-green-400' : 'text-yellow-500'
                    }`}>
                      <Dna size={12} />
                      {biz.brandDNA ? 'Brand DNA configured' : 'Brand DNA needed'}
                    </div>

                    {/* Platform status */}
                    <div className="flex items-center gap-2 mb-3">
                      {PLATFORMS.map(p => {
                        const count = biz.chats[p.id]?.length || 0;
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                              count > 0
                                ? 'bg-gray-800 text-gray-300'
                                : 'bg-gray-900 text-gray-600'
                            }`}
                            title={`${p.label}: ${count} messages`}
                          >
                            <span className="text-xs">{p.icon}</span>
                            {count > 0 && <span>{count}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-600 pt-3 border-t border-gray-800/50">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        {totalMessages} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeTime(lastActivity)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add Business Card */}
              <div
                onClick={() => setShowAdd(true)}
                className="p-5 rounded-xl border-2 border-dashed border-gray-800 hover:border-purple-500/40 bg-transparent hover:bg-gray-900/30 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-purple-600/20 flex items-center justify-center transition-colors mb-3">
                  <Plus className="text-gray-600 group-hover:text-purple-400 transition-colors" size={24} />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-400 font-medium transition-colors">
                  Add Business
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
