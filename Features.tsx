'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Archive, CloudOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "Instant Search",
    description: "Find any link in seconds with powerful search across all your saved content."
  },
  {
    icon: Archive,
    title: "Organize Effortlessly",
    description: "Categorize and tag your links for easy access and better organization."
  },
  {
    icon: CloudOff,
    title: "Works Offline",
    description: "Access your links even without internet—perfect for on-the-go browsing."
  },
  {
    icon: ShieldCheck,
    title: "No Logins Required",
    description: "Start saving links immediately, no accounts or passwords needed."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Features() {
  return (
    <section id="features" className="py-24 px-8 relative" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffffff 100%)'
    }}>
      {/* Depth layering for section background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.9) 100%)'
      }} />
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.03)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-black mb-6">
            The Problem With Your Brain
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            You think you&#39;ll remember that amazing article. You won&#39;t. You think you&#39;ll organize your bookmarks. You won&#39;t. But SavedSphere doesn&#39;t care about your good intentions.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className="h-full rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 border border-gray-100/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.95) 100%)'
                }}>
                <CardHeader className="pb-4 p-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #ECA400 0%, #D48A00 100%)',
                      boxShadow: '0 4px 12px rgba(236, 164, 0, 0.2), 0 2px 4px rgba(236, 164, 0, 0.1)'
                    }}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-black mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <CardDescription className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Minimal stats section */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            { value: "10K+", label: "Links Saved Daily" },
            { value: "99.9%", label: "Uptime" },
            { value: "0", label: "Sign-ups" },
            { value: "∞", label: "Storage" }
          ].map((stat, index) => (
            <div key={index} className="flex flex-col items-center px-4 py-2">
              <div className="text-2xl font-bold text-black" style={{ color: '#ECA400' }}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-xs font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}