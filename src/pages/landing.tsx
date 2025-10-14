'use client';

import { useState } from 'react';
import Nav from "@/components/landing/landing/Nav";
import Hero from "@/components/landing/landing/Hero";
import Features from "@/components/landing/landing/Features";
import LearnMoreModal from "@/components/landing/landing/LearnMoreModal";

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
