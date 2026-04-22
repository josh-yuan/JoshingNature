import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joshing Nature",
  description: "Explore the wild. Maps, trails, and nature adventures.",
  keywords: ["nature", "outdoors", "hiking", "maps", "trails", "adventure"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Joshing Nature. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
