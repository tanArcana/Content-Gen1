'use client';

import { useBusinessContext } from '@/context/BusinessContext';
import { Calendar, Building2 } from 'lucide-react';

export default function CalendarView() {
  const { selectedBusiness, calendarEvents } = useBusinessContext();

  if (!selectedBusiness) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-gray-600" size={28} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Select a Client</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Choose a client from the sidebar to view their content calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={18} />
            Content Calendar
          </h1>
          <p className="text-sm text-gray-500">Schedule and plan content for {selectedBusiness.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="p-8 rounded-xl border border-gray-800 bg-gray-900/50 text-center">
          <Calendar className="mx-auto mb-4 text-gray-600" size={40} />
          <h3 className="text-lg font-semibold text-white mb-2">Calendar Coming Soon</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            The content calendar with month/week views, drag-to-reschedule, and platform color-coding will be built in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
