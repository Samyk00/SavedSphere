'use client';

import { Button } from "@/components/ui/button";

interface HeroProps {
  onLearnMoreClick?: () => void;
  onGetStarted?: () => void;
}

export default function Hero({ onLearnMoreClick, onGetStarted }: HeroProps) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden pt-4" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffffff 100%)'
    }}>
      {/* Depth layering with color shades */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.9) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 30% 20%, rgba(236, 164, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(236, 164, 0, 0.03) 0%, transparent 50%)'
      }} />

      {/* Dual shadow system */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.05)]" />

      <div className="relative z-10 text-center max-w-5xl px-6">
        {/* Creative badge - Secondary color for subtle attention */}
        <div
          className="inline-flex items-center px-6 py-3 mb-6 text-sm font-semibold text-gray-700 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div className="w-2 h-2 rounded-full mr-3 animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.2)]" style={{ backgroundColor: '#ECA400' }}></div>
          Your Links, Forever Found
        </div>


        <h1 className="text-4xl md:text-6xl font-black mb-6 text-black leading-tight">
          <span className="inline-block">
            Never Lose
          </span>
          <br />
          <span style={{ color: '#ECA400' }}>
            Another Link
          </span>
          <br />
          Again
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl mx-auto italic">
          Everything you save exists within this sphere
        </p>

        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Stop losing links like you lose your keys. SavedSphere saves your YouTube finds, Instagram inspo, and blog gems—all without making you create another damn account.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="text-lg px-10 py-6 text-white font-semibold rounded-xl shadow-[0_8px_24px_rgba(236,164,0,0.3),0_4px_12px_rgba(236,164,0,0.2)] hover:shadow-[0_12px_32px_rgba(236,164,0,0.4),0_6px_16px_rgba(236,164,0,0.3)] transition-all duration-300 hover:scale-105 border-0"
            style={{
              background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)'
            }}
            onClick={onGetStarted}
          >
            Start Organizing Content
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="text-lg px-10 py-6 text-gray-700 rounded-xl font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.1)] transition-all duration-300 border-2 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              borderColor: 'rgba(0,0,0,0.1)'
            }}
            onClick={onLearnMoreClick}
          >
            Learn More
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ECA400] rounded-full"></div>
            No Sign-ups Required
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            Works Offline
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            Instant Search
          </div>
        </div>
      </div>
    </section>
  );
}