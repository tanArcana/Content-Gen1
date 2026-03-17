'use client';

import { useBusinessContext } from '@/context/BusinessContext';
import BrandDNAPanel from '@/components/BrandDNAPanel';
import { Dna, Building2 } from 'lucide-react';

export default function BrandDNAView() {
  const { selectedBusiness } = useBusinessContext();

  if (!selectedBusiness) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-gray-600" size={28} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Select a Client</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Choose a client from the sidebar to configure their Brand DNA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {selectedBusiness.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Dna size={18} />
                Brand DNA
              </h1>
              <p className="text-sm text-gray-500">{selectedBusiness.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <BrandDNAPanel />
      </div>
    </div>
  );
}
