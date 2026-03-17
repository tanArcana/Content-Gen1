'use client';

import ContentLibrary from '@/components/ContentLibrary';

export default function LibraryView() {
  // Wrap existing ContentLibrary — onBack is a no-op since nav is in sidebar now
  return <ContentLibrary onBack={() => {}} />;
}
