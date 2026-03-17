'use client';

import AppShell from '@/components/AppShell';
import { useBusinessContext } from '@/context/BusinessContext';
import DashboardView from '@/components/views/DashboardView';
import CreateView from '@/components/views/CreateView';
import CalendarView from '@/components/views/CalendarView';
import LibraryView from '@/components/views/LibraryView';
import BrandDNAView from '@/components/views/BrandDNAView';
import TemplatesView from '@/components/views/TemplatesView';
import SettingsView from '@/components/views/SettingsView';

function ViewRouter() {
  const { currentView } = useBusinessContext();

  switch (currentView) {
    case 'dashboard':
      return <DashboardView />;
    case 'create':
      return <CreateView />;
    case 'calendar':
      return <CalendarView />;
    case 'library':
      return <LibraryView />;
    case 'brand-dna':
      return <BrandDNAView />;
    case 'templates':
      return <TemplatesView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
}

export default function Home() {
  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  );
}
