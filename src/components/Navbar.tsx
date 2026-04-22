"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Explore" },
  { href: "/videos", label: "Videos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — real wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-jn-color.png"
              alt="JN"
              width={36}
              height={36}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <Image
              src="/logo-wordmark.png"
              alt="Joshing Nature"
              width={130}
              height={32}
              className="object-contain invert brightness-90 transition-opacity duration-300 group-hover:opacity-100 opacity-85"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-primary/10 border border-primary/25"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
            <a
              href="https://www.youtube.com/@JoshingNature"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors"
            >
              Subscribe
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-md"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {links.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <a
                href="https://www.youtube.com/@JoshingNature"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/25 text-center"
              >
                Subscribe on YouTube
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
