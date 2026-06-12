import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="relative border-t border-border/60 topo-bg">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center">
            <Image
              src="/logo-jn-line.png"
              alt="JN monogram"
              width={48}
              height={48}
              className="invert opacity-80"
            />
            <p className="text-sm tracking-widest uppercase text-muted-foreground">
              Fishing &middot; Foraging &middot; Cooking &middot; Backpacking
            </p>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-accent">Home</Link>
              <Link href="/map" className="transition-colors hover:text-accent">Explore</Link>
              <Link href="/videos" className="transition-colors hover:text-accent">Videos</Link>
              <a
                href="https://www.youtube.com/@JoshingNature"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                YouTube
              </a>
            </nav>
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} Joshing Nature. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
