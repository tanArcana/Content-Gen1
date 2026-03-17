'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { ArrowLeft, Key, Trash2, Download, Upload, AlertCircle } from 'lucide-react';

export default function SettingsPanel({ onBack }: { onBack: () => void }) {
  const { businesses, savedContent } = useBusinessContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const data = {
      businesses: JSON.parse(localStorage.getItem('content-gen1-businesses') || '[]'),
      savedContent: JSON.parse(localStorage.getItem('content-gen1-saved-content') || '[]'),
      customTemplates: JSON.parse(localStorage.getItem('content-gen1-custom-templates') || '[]'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contentgen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.businesses) localStorage.setItem('content-gen1-businesses', JSON.stringify(data.businesses));
        if (data.savedContent) localStorage.setItem('content-gen1-saved-content', JSON.stringify(data.savedContent));
        if (data.customTemplates) localStorage.setItem('content-gen1-custom-templates', JSON.stringify(data.customTemplates));
        window.location.reload();
      } catch {
        alert('Invalid backup file');
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    localStorage.removeItem('content-gen1-businesses');
    localStorage.removeItem('content-gen1-selected');
    localStorage.removeItem('content-gen1-saved-content');
    localStorage.removeItem('content-gen1-custom-templates');
    window.location.reload();
  };

  const totalMessages = businesses.reduce((sum, b) => {
    return sum + Object.values(b.chats).reduce((s, msgs) => s + msgs.length, 0);
  }, 0);

  return (
    <div className="flex-1 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-sm text-gray-500">Manage your ContentGen preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* API Configuration */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Key size={14} />
            API Configuration
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                <Key size={18} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Anthropic API Key</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Set your API key in the <code className="px-1.5 py-0.5 rounded bg-gray-800 text-purple-300">.env.local</code> file as <code className="px-1.5 py-0.5 rounded bg-gray-800 text-purple-300">ANTHROPIC_API_KEY</code>.
                  Without it, the app runs in demo mode with template-based responses.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                    <AlertCircle size={10} />
                    Server-side only — never exposed to the client
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Storage & Data */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Storage & Data
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 divide-y divide-gray-800">
            {/* Stats */}
            <div className="p-5">
              <h3 className="text-sm font-medium text-white mb-3">Usage Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-800/50">
                  <div className="text-2xl font-bold text-white">{businesses.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Businesses</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-800/50">
                  <div className="text-2xl font-bold text-white">{totalMessages}</div>
                  <div className="text-xs text-gray-500 mt-1">Messages</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-800/50">
                  <div className="text-2xl font-bold text-white">{savedContent.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Saved Posts</div>
                </div>
              </div>
            </div>

            {/* Export/Import */}
            <div className="p-5">
              <h3 className="text-sm font-medium text-white mb-1">Backup & Restore</h3>
              <p className="text-xs text-gray-500 mb-3">Export your data or restore from a backup file.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                >
                  <Download size={14} />
                  Export Data
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                >
                  <Upload size={14} />
                  Import Backup
                </button>
              </div>
            </div>

            {/* Clear Data */}
            <div className="p-5">
              <h3 className="text-sm font-medium text-white mb-1">Clear All Data</h3>
              <p className="text-xs text-gray-500 mb-3">
                Permanently delete all businesses, chats, saved content, and templates.
              </p>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm border border-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear All Data
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">About</h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                ✦
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ContentGen</h3>
                <p className="text-xs text-gray-500">Multi-Business Brand Dashboard</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              AI-powered content generation across Instagram, X/Twitter, LinkedIn, and TikTok.
              Built with Next.js, React, and Claude AI.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
