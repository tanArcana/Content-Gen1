'use client';

import { useBusinessContext } from '@/context/BusinessContext';
import { PenSquare, Building2 } from 'lucide-react';

export default function CreateView() {
  const { selectedBusiness, setCurrentView } = useBusinessContext();

  if (!selectedBusiness) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-gray-600" size={28} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Select a Client</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Choose a client from the sidebar to start creating content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {selectedBusiness.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <PenSquare size={18} />
                Content Creation Studio
              </h1>
              <p className="text-sm text-gray-500">Creating for {selectedBusiness.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for Phase 2: Content Brief Form + Output */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-6">
          {/* Brief Panel (left) */}
          <div className="flex-1 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Content Brief</h3>
            <p className="text-gray-500 text-sm">
              The Content Brief form will be built in Phase 2. It will include topic input, content format selector, platform multi-select, tone override, and template quick-select.
            </p>
          </div>

          {/* Output Panel (right) */}
          <div className="flex-1 p-6 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Generated Content</h3>
            <p className="text-gray-500 text-sm">
              Platform-specific content previews will appear here after generation. Each platform gets a tabbed preview with device mockups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
