import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ToastProvider } from "@/components/ui/toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SavedSphere - Never Lose Another Link",
  description: "Organize your favorite links from YouTube, Instagram, blogs, and more. No sign-ups required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
