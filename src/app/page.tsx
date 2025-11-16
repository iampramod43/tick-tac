'use client';

import { MainLayout } from '@/src/components/layout/MainLayout';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomeContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'inbox';
  
  return <MainLayout initialView={view} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

