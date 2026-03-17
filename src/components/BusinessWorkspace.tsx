'use client';

import { useState } from 'react';
import { useBusinessContext } from '@/context/BusinessContext';
import { Platform, PLATFORMS } from '@/types';
import BrandDNAPanel from './BrandDNAPanel';
import PlatformChat from './PlatformChat';
import { Dna, ArrowLeft, BookMarked, LayoutTemplate } from 'lucide-react';

export default function BusinessWorkspace({ onBack }: { onBack: () => void }) {
  const { selectedBusiness, savedContent, setCurrentView } = useBusinessContext();
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram');
  const [showDNA, setShowDNA] = useState(false);

  if (!selectedBusiness) return null;

  const hasBrandDNA = !!selectedBusiness.brandDNA;
  const bizSavedCount = savedContent.filter(c => c.businessId === selectedBusiness.id).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950">
      {/* Top bar */}
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
            {selectedBusiness.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{selectedBusiness.name}</h2>
            <p className="text-xs text-gray-500">{selectedBusiness.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { onBack(); setTimeout(() => setCurrentView('library'), 0); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            title="Content Library"
          >
            <BookMarked size={14} />
            {bizSavedCount > 0 && <span className="text-xs text-purple-300">{bizSavedCount}</span>}
          </button>
          <button
            onClick={() => { onBack(); setTimeout(() => setCurrentView('templates'), 0); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            title="Templates"
          >
            <LayoutTemplate size={14} />
          </button>
          <button
            onClick={() => setShowDNA(!showDNA)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showDNA
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : hasBrandDNA
                ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                : 'bg-purple-600 text-white hover:bg-purple-500 animate-pulse'
            }`}
          >
            <Dna size={14} />
            Brand DNA
            {!hasBrandDNA && <span className="text-xs ml-1">(Setup Required)</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Brand DNA side panel */}
        {showDNA && (
          <div className="w-96 border-r border-gray-800 overflow-y-auto bg-gray-950 shrink-0">
            <BrandDNAPanel />
          </div>
        )}

        {/* Platform area */}
        <div className="flex-1 flex flex-col">
          {/* Platform tabs */}
          <div className="flex border-b border-gray-800 px-2 bg-gray-950/50">
            {PLATFORMS.map(p => {
              const msgCount = selectedBusiness.chats[p.id]?.length || 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activePlatform === p.id
                      ? 'text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                  }`}
                  style={{
                    borderBottomColor: activePlatform === p.id ? p.color : undefined,
                  }}
                >
                  <span>{p.icon}</span>
                  <span className="hidden sm:inline">{p.label}</span>
                  {msgCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400">
                      {msgCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active chat */}
          <div className="flex-1 overflow-hidden">
            <PlatformChat platform={activePlatform} />
          </div>
        </div>
      </div>
    </div>
  );
}
