'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { ViewType } from '@/types';
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  BookMarked,
  Dna,
  LayoutTemplate,
  Settings,
  Plus,
  Building2,
  ChevronDown,
  Trash2,
} from 'lucide-react';

const NAV_ITEMS: { id: ViewType; label: string; icon: typeof LayoutDashboard; section: 'main' | 'system' }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { id: 'create', label: 'Create', icon: PenSquare, section: 'main' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, section: 'main' },
  { id: 'library', label: 'Content Library', icon: BookMarked, section: 'main' },
  { id: 'brand-dna', label: 'Brand DNA', icon: Dna, section: 'main' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, section: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'system' },
];

export default function AgencySidebar() {
  const {
    businesses,
    selectedBusiness,
    selectedBusinessId,
    selectBusiness,
    addBusiness,
    deleteBusiness,
    currentView,
    setCurrentView,
  } = useBusinessContext();

  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addBusiness(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowAddBusiness(false);
    setCurrentView('create');
  };

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setClientDropdownOpen(false);
  };

  const mainItems = NAV_ITEMS.filter(i => i.section === 'main');
  const systemItems = NAV_ITEMS.filter(i => i.section === 'system');

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
            ✦
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">ContentGen</h1>
            <p className="text-[10px] text-gray-500">AI Media Agency</p>
          </div>
        </div>
      </div>

      {/* Client Switcher */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <button
            onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors text-left"
          >
            {selectedBusiness ? (
              <>
                <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {selectedBusiness.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{selectedBusiness.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{selectedBusiness.description || 'No description'}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-md bg-gray-800 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-400">Select a client</span>
              </>
            )}
            <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform ${clientDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {clientDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {businesses.map(biz => (
                  <div
                    key={biz.id}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group ${
                      selectedBusinessId === biz.id
                        ? 'bg-purple-600/20 text-white'
                        : 'hover:bg-gray-800 text-gray-400'
                    }`}
                    onClick={() => { selectBusiness(biz.id); setClientDropdownOpen(false); }}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      selectedBusinessId === biz.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {biz.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm truncate flex-1">{biz.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteBusiness(biz.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {businesses.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-gray-600">No clients yet</div>
                )}
              </div>
              <div className="border-t border-gray-800">
                <button
                  onClick={() => { setClientDropdownOpen(false); setShowAddBusiness(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-gray-800 transition-colors"
                >
                  <Plus size={14} />
                  Add Client
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Business Modal (inline) */}
      {showAddBusiness && (
        <div className="p-3 border-b border-gray-800">
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 space-y-2">
            <input
              type="text"
              placeholder="Client name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Brief description"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="w-full px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowAddBusiness(false); setNewName(''); setNewDesc(''); }}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-0.5">
          {mainItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">System</p>
          <div className="space-y-0.5">
            {systemItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="text-[10px] text-gray-600 text-center">
          {businesses.length} client{businesses.length !== 1 ? 's' : ''} · ContentGen v2.0
        </div>
      </div>
    </aside>
  );
}
