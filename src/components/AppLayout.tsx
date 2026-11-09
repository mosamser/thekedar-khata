'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { AddSiteModal } from './AddSiteModal';
import { useRouter } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const router = useRouter();

  const handleSiteCreated = (site: any) => {
    router.push(`/sites/${site.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-24 md:pb-8">
      <Navbar onOpenNewSite={() => setIsSiteModalOpen(true)} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Global Add Site Modal */}
      <AddSiteModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onSiteCreated={handleSiteCreated}
      />
    </div>
  );
}

