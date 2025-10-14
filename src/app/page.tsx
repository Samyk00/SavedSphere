'use client';

import { useState } from 'react';
import LandingPage from '@/pages/landing';
import AppLayout from '@/components/layout/AppLayout';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'app'>('landing');

  const handleGetStarted = () => {
    setCurrentPage('app');
  };

  if (currentPage === 'app') {
    return <AppLayout />;
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}
