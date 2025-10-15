import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Linkedin, 
  MessageSquare, 
  Music, 
  Pin, 
  Github, 
  BookOpen, 
  FileText, 
  Twitter, 
  MessageCircle,
  Globe
} from 'lucide-react';
import type { Platform } from '@/lib/types';

export interface PlatformIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  name: string;
}

export const PLATFORM_ICONS: Record<Platform, PlatformIconConfig> = {
  youtube: {
    icon: Youtube,
    color: 'text-red-600',
    name: 'YouTube'
  },
  instagram: {
    icon: Instagram,
    color: 'text-pink-600',
    name: 'Instagram'
  },
  facebook: {
    icon: Facebook,
    color: 'text-blue-600',
    name: 'Facebook'
  },
  linkedin: {
    icon: Linkedin,
    color: 'text-blue-700',
    name: 'LinkedIn'
  },
  reddit: {
    icon: MessageSquare,
    color: 'text-orange-600',
    name: 'Reddit'
  },
  tiktok: {
    icon: Music,
    color: 'text-black',
    name: 'TikTok'
  },
  pinterest: {
    icon: Pin,
    color: 'text-red-600',
    name: 'Pinterest'
  },
  github: {
    icon: Github,
    color: 'text-gray-800',
    name: 'GitHub'
  },
  medium: {
    icon: BookOpen,
    color: 'text-black',
    name: 'Medium'
  },
  blog: {
    icon: FileText,
    color: 'text-gray-600',
    name: 'Blog'
  },
  twitter: {
    icon: Twitter,
    color: 'text-blue-400',
    name: 'Twitter'
  },
  other: {
    icon: Globe,
    color: 'text-gray-600',
    name: 'Other'
  }
};

// Extended platform icons for additional platforms
export const EXTENDED_PLATFORM_ICONS = {
  ...PLATFORM_ICONS,
  threads: {
    icon: MessageCircle,
    color: 'text-black',
    name: 'Threads'
  }
};

/**
 * Get platform icon component with styling
 */
export function getPlatformIcon(
  platform: Platform | string, 
  className: string = 'h-4 w-4'
): React.ReactNode {
  const config = EXTENDED_PLATFORM_ICONS[platform as keyof typeof EXTENDED_PLATFORM_ICONS] || PLATFORM_ICONS.other;
  const IconComponent = config.icon;
  
  return <IconComponent className={`${className} ${config.color}`} />;
}

/**
 * Get platform icon configuration
 */
export function getPlatformConfig(platform: Platform | string): PlatformIconConfig {
  return EXTENDED_PLATFORM_ICONS[platform as keyof typeof EXTENDED_PLATFORM_ICONS] || PLATFORM_ICONS.other;
}