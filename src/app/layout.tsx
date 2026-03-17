import type { Metadata } from "next";
import "./globals.css";
import { BusinessProvider } from "@/context/BusinessContext";

export const metadata: Metadata = {
  title: "ContentGen — AI Media Agency Platform",
  description: "AI-powered content creation studio for Instagram, X/Twitter, LinkedIn, and TikTok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gray-950 text-white">
        <BusinessProvider>
          {children}
        </BusinessProvider>
      </body>
    </html>
  );
}
