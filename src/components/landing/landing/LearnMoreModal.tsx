'use client';

import { Button } from "@/components/ui/button";
import { X, CheckCircle, Users, Zap, Shield } from "lucide-react";

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LearnMoreModal({ isOpen, onClose }: LearnMoreModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {/* Content */}
            <div className="h-full overflow-y-auto p-6 md:p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-12">
                  <h1 className="text-3xl md:text-4xl font-black text-black mb-4">
                    The Truth About Your Bookmarking Habits
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    You save links thinking you&#39;ll read them later. You never do. Your browser is a digital graveyard of good intentions. Sound familiar?
                  </p>
                </div>

                {/* Problem Section */}
                <div className="mb-12 p-6 rounded-xl bg-gray-50">
                  <h2 className="text-2xl font-bold text-black mb-4">
                    The Problem With Your Brain
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    That &quot;read later&quot; folder in your bookmarks? It&#39;s a lie. Those 47 tabs you keep open &quot;for research&quot;? They&#39;re never getting read. Your digital life is a mess, and SavedSphere is here to clean it up.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6 text-center">
                    Why SavedSphere Actually Works
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: CheckCircle,
                        title: "Real Organization",
                        description: "Tags, folders, and search that actually work - unlike your chaotic bookmark system"
                      },
                      {
                        icon: Users,
                        title: "Human-Centered Design",
                        description: "Built for people who save links but never find them again"
                      },
                      {
                        icon: Zap,
                        title: "Lightning Fast",
                        description: "Find any saved link instantly, not after scrolling through 200 bookmarks"
                      },
                      {
                        icon: Shield,
                        title: "Privacy First",
                        description: "Your links stay on your device. We don't sell your browsing habits."
                      }
                    ].map((feature, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)'
                            }}>
                            <feature.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-black mb-1">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-black mb-6 text-center">
                    Real Talk from Real Users
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        quote: "I finally deleted my 300-bookmark folder called &#39;Important Stuff&#39;. Thanks SavedSphere!",
                        author: "Emma, Former Bookmark Hoarder"
                      },
                      {
                        quote: "My tabs used to number in the 50s. Now I can actually close my browser without anxiety.",
                        author: "David, Tab Addiction Survivor"
                      },
                      {
                        quote: "I found an article I saved 2 years ago. It was actually useful. Mind blown.",
                        author: "Lisa, Information Archaeologist"
                      }
                    ].map((testimonial, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-50 border-l-4 border-[#ECA400]">
                        <p className="text-gray-700 italic mb-2">&quot;{testimonial.quote}&quot;</p>
                        <p className="text-sm font-medium text-gray-600">- {testimonial.author}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-black mb-4">
                    Ready to Stop the Bookmark Madness?
                  </h2>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    Your browser bookmarks are a disaster. Your tabs are out of control. Your digital life needs saving. SavedSphere is waiting.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      className="px-8 py-3 text-white font-semibold rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)'
                      }}
                    >
                      Save My Digital Life
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 rounded-xl"
                      onClick={onClose}
                    >
                      Keep the Chaos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </>
    );
}