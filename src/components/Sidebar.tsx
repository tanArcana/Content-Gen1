'use client';

import { useBusinessContext } from '@/context/BusinessContext';
import { Plus, Building2, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { businesses, selectedBusinessId, selectBusiness, addBusiness, deleteBusiness } = useBusinessContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addBusiness(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <aside className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
            ✦
          </div>
          ContentGen
        </h1>
        <p className="text-xs text-gray-500 mt-1">Multi-Business Brand Dashboard</p>
      </div>

      <div className="p-3">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Business
        </button>
      </div>

      {showAdd && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
            <input
              type="text"
              placeholder="Business name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Brief description"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setNewDesc(''); }}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {businesses.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">
            <Building2 className="mx-auto mb-2 opacity-50" size={24} />
            No businesses yet.
            <br />Add one to get started.
          </div>
        )}
        {businesses.map(biz => (
          <div
            key={biz.id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
              selectedBusinessId === biz.id
                ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                : 'hover:bg-gray-900 text-gray-400 hover:text-white border border-transparent'
            }`}
            onClick={() => selectBusiness(biz.id)}
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0 ${
              selectedBusinessId === biz.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'
            }`}>
              {biz.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{biz.name}</div>
              <div className="text-xs text-gray-600 truncate">{biz.description || 'No description'}</div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={e => { e.stopPropagation(); deleteBusiness(biz.id); }}
                className="p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
                title="Delete business"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight size={14} className="text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-800">
        <div className="text-xs text-gray-600 text-center">
          {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
        </div>
      </div>
    </aside>
  );
}
