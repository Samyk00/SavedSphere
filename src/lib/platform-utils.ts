import { Youtube, Instagram, Facebook, Linkedin, MessageSquare, Music, Pin, Github, BookOpen, Twitter, Globe, FileText } from 'lucide-react';
import type { Platform } from '@/lib/types';

// Helper function to get the appropriate Lucide React icon for each platform
export const getPlatformIcon = (platform: Platform) => {
  const iconMap = {
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    reddit: MessageSquare,
    tiktok: Music,
    pinterest: Pin,
    github: Github,
    medium: BookOpen,
    blog: FileText,
    twitter: Twitter,
    other: Globe
  };
  
  return iconMap[platform] || Globe;
};