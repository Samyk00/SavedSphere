'use client';

import { useState } from 'react';
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LearnMoreModal from "@/components/landing/LearnMoreModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen">
      <Nav />
      <Hero onLearnMoreClick={openModal} />
      <Features />
      <LearnMoreModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
