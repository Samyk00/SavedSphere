import { Youtube, Instagram, Facebook, Linkedin, MessageSquare, Music, Pin, Github, BookOpen, Twitter, Globe, Newspaper } from 'lucide-react';
import type { Platform } from '@/lib/types';
import { PLATFORM_METADATA } from '@/lib/types';

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
    blog: Newspaper,
    twitter: Twitter,
    other: Globe
  };

  return iconMap[platform] || Globe;
};

// Enhanced platform detection with better website categorization
export const detectPlatform = (url: string): Platform => {
  if (!url) return 'other';

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Check specific platforms first
    for (const [platform, metadata] of Object.entries(PLATFORM_METADATA) as [Platform, typeof PLATFORM_METADATA[Platform]][]) {
      if (metadata.domainRegex.test(hostname)) {
        return platform;
      }
    }

    // Enhanced website detection
    if (pathname.includes('/blog') || pathname.includes('/article') || pathname.includes('/news') ||
        pathname.includes('/post') || pathname.includes('/story') || hostname.includes('blog')) {
      return 'blog';
    }

    // If it's a valid URL but doesn't match any specific platform, classify as 'other'
    return 'other';

  } catch {
    // Invalid URL
    return 'other';
  }
};

// Function to fetch website metadata (title and thumbnail)
export const fetchWebsiteMetadata = async (url: string) => {
  try {
    // Use a CORS proxy or direct fetch - we'll try direct first
    const response = await fetch(url);
    if (!response.ok) return null;

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    let thumbnail = ogImageMatch ? ogImageMatch[1] : null;

    // Fallback to Twitter card image
    if (!thumbnail) {
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      thumbnail = twitterImageMatch ? twitterImageMatch[1] : null;
    }

    // Fallback to any image meta tag
    if (!thumbnail) {
      const imageMatch = html.match(/<meta[^>]*name=["']image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      thumbnail = imageMatch ? imageMatch[1] : null;
    }

    return {
      title: title || null,
      thumbnail: thumbnail || null
    };

  } catch (error) {
    console.warn('Failed to fetch website metadata:', error);
    return null;
  }
};