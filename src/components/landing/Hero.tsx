'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroProps {
  onLearnMoreClick?: () => void;
}

export default function Hero({ onLearnMoreClick }: HeroProps) {
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

      <motion.div
        className="relative z-10 text-center max-w-5xl px-6"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Creative badge - Secondary color for subtle attention */}
        <motion.div
          className="inline-flex items-center px-6 py-3 mb-6 text-sm font-semibold text-gray-700 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, duration: 0.7, type: "spring" }}
        >
          <div className="w-2 h-2 rounded-full mr-3 animate-pulse shadow-[0_2px_4px_rgba(0,0,0,0.2)]" style={{ backgroundColor: '#ECA400' }}></div>
          Your Links, Forever Found
        </motion.div>


        <motion.h1
          className="text-4xl md:text-6xl font-black mb-6 text-black leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 1 }}
            animate={{
              opacity: [1, 0.7, 1]
            }}
            transition={{
              delay: 2,
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          >
            Never Lose
          </motion.span>
          <br />
          <span style={{ color: '#ECA400' }}>
            Another Link
          </span>
          <br />
          Again
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-4 max-w-2xl mx-auto italic"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Everything you save exists within this sphere
        </motion.p>

        <motion.p
          className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Stop losing links like you lose your keys. SavedSphere saves your YouTube finds, Instagram inspo, and blog gems—all without making you create another damn account.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Button
            size="lg"
            className="text-lg px-10 py-6 text-white font-semibold rounded-xl shadow-[0_8px_24px_rgba(236,164,0,0.3),0_4px_12px_rgba(236,164,0,0.2)] hover:shadow-[0_12px_32px_rgba(236,164,0,0.4),0_6px_16px_rgba(236,164,0,0.3)] transition-all duration-300 hover:scale-105 border-0"
            style={{
              background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)'
            }}
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
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
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
        </motion.div>
      </motion.div>
    </section>
  );
}
