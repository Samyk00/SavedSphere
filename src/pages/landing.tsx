'use client';

import { useState } from 'react';
import Nav from "@/components/landing/components/Nav";
import Hero from "@/components/landing/components/Hero";
import Features from "@/components/landing/components/Features";
import LearnMoreModal from "@/components/landing/components/LearnMoreModal";

export const dynamic = 'force-dynamic';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleGetStarted = () => {
    onGetStarted();
  };

  return (
    <div className="min-h-screen">
      <Nav onGetStarted={handleGetStarted} />
      <Hero onLearnMoreClick={openModal} onGetStarted={handleGetStarted} />
      <Features />
      <LearnMoreModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
