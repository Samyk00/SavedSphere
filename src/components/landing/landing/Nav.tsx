'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavProps {
  showHomeLink?: boolean;
  onGetStarted?: () => void;
}

export default function Nav({ showHomeLink = false, onGetStarted }: NavProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)'
    }}>
      <nav className="flex items-center justify-between px-8 py-6 mx-auto max-w-7xl relative">
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight text-black hover:text-[#ECA400] transition-colors duration-300 cursor-default select-none">
            SavedSphere
          </h1>
        </div>
        <div className="relative z-10 flex items-center space-x-6">
          {showHomeLink && (
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/50"
            >
              Home
            </Link>
          )}
          <Button
            onClick={onGetStarted}
            className="font-semibold px-6 py-2 rounded-lg shadow-[0_4px_12px_rgba(236,164,0,0.3),0_2px_4px_rgba(236,164,0,0.2)] hover:shadow-[0_6px_16px_rgba(236,164,0,0.4),0_3px_6px_rgba(236,164,0,0,0.3)] transition-all duration-300 hover:scale-105 border-0"
            style={{
              background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)'
            }}
          >
            Get Started
          </Button>
        </div>
      </nav>
    </div>
  );
}