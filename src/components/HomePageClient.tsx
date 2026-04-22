"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Fish, Mountain, Flame, ArrowRight, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AnimatedSection from "@/components/AnimatedSection";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */

const latestEpisodes = [
  {
    id: "OzrB4Pxa2XM",
    title: "S2E3: I Went Winter Camping w/ My Favorite Outdoor Influencer",
    season: "S2",
  },
  {
    id: "Vw87Yfd7qEc",
    title: "Washington's Sublime High Route",
    season: "S2",
  },
  {
    id: "P7t60OB9Uu0",
    title: "S2E1: One Steak, Two Trout, Four Loaves",
    season: "S2",
  },
];

const seasonOneSampler = [
  { id: "OSzq1NG36OI", title: "S1E1: Catch & Cook in Montana's Remote Alpine" },
  { id: "DLtEvoPqSmI", title: "S1E4: Solo Brook Trout Catch & Cook" },
  { id: "SYEGYOGQlsQ", title: "S1E7: Catch & Cook Alpine Cutthroat in Bear Territory" },
];

const pillars = [
  {
    icon: Fish,
    title: "Catch & Cook",
    description:
      "From alpine trout to coastal bass — Josh fishes, then fires up the camp stove. The signature of every season.",
  },
  {
    icon: Mountain,
    title: "Wild Adventures",
    description:
      "Multi-day routes through Washington's North Cascades, Olympic Peninsula, and beyond.",
  },
  {
    icon: Flame,
    title: "In the Field",
    description:
      "Baking bread in the mountains. Cooking steak on a Coleman. Foraging morels at 6,000 feet.",
  },
];

/* ─────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Full-bleed hero photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-winter-lookout.jpg"
          alt="Two hikers at a snowy fire lookout in the fog"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-background" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-6 max-w-3xl mx-auto">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <Image
            src="/logo-wordmark.png"
            alt="Joshing Nature"
            width={600}
            height={150}
            className="w-72 sm:w-[480px] mx-auto invert drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-base sm:text-lg font-medium tracking-widest uppercase text-accent/90"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          Fishing. Foraging. Cooking. Backpacking.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
        >
          <Link
            href="/videos"
            className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-105 glow-brand-sm"
          >
            <Play className="h-4 w-4" />
            Watch Latest
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/map"
            className="group inline-flex h-12 items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-6 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-accent/70 hover:bg-accent/20"
          >
            <Mountain className="h-4 w-4 text-accent" />
            Explore the Map
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade into site background */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   Latest Episodes
───────────────────────────────────────────── */
function EpisodeCard({ id, title, season, index }: { id: string; title: string; season: string; index: number }) {
  return (
    <AnimatedSection delay={index * 0.12} direction="up">
      <a
        href={`https://youtu.be/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] hover:glow-brand-sm"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="h-5 w-5 translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="mb-2">
            <Badge variant="default" className="text-xs font-semibold tracking-wide">
              {season}
            </Badge>
          </div>
          <p className="text-sm font-medium leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {title}
          </p>
        </div>
      </a>
    </AnimatedSection>
  );
}

function LatestEpisodesSection() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" direction="up">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              New Episodes
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Latest from the Channel
            </h2>
          </div>
          <Link
            href="/videos"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            All videos
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-3">
          {latestEpisodes.map((ep, i) => (
            <EpisodeCard key={ep.id} {...ep} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Content Pillars
───────────────────────────────────────────── */
function PillarsSection() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      {/* Subtle warm glow behind section */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 50%, oklch(0.56 0.19 25 / 5%) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <AnimatedSection className="mb-12 text-center" direction="up">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            What We Do
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built Around the Wild
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Every episode is a mission — fish it, cook it, hike it, eat it.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <AnimatedSection key={pillar.title} delay={i * 0.12} direction="up">
                <div className="group h-full rounded-xl border border-white/8 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:glow-brand-sm hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 transition-colors duration-300 group-hover:border-accent/50 group-hover:bg-accent/18">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Season Archive Teaser
───────────────────────────────────────────── */
function SeasonArchiveSection() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" direction="up">
          <div>
            <Badge variant="outline" className="mb-3 text-xs tracking-widest uppercase border-accent/40 text-accent">
              Season 1 — Now Complete
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Where It All Started
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              Seven episodes. Montana alpine, Washington coast, solo brook trout, and more.
            </p>
          </div>
          <Link
            href="/videos"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Full archive
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-3">
          {seasonOneSampler.map((ep, i) => (
            <AnimatedSection key={ep.id} delay={i * 0.1} direction="up">
              <a
                href={`https://youtu.be/${ep.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-300 hover:border-accent/40 hover:scale-[1.02]"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={`https://i.ytimg.com/vi/${ep.id}/maxresdefault.jpg`}
                    alt={ep.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                      <Play className="h-4 w-4 translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium leading-snug text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors duration-200">
                    {ep.title}
                  </p>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Subscribe CTA
───────────────────────────────────────────── */
function SubscribeSection() {
  return (
    <section className="relative px-4 py-24 sm:py-32 overflow-hidden">
      {/* Warm background band */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.56 0.19 25 / 8%) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 z-0 border-y border-white/6" />

      <AnimatedSection className="relative z-10 mx-auto max-w-xl text-center" direction="up">
        {/* JN monogram */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-jn-color.png"
            alt="JN monogram"
            width={96}
            height={96}
            className="w-20 sm:w-24 drop-shadow-[0_0_20px_oklch(0.56_0.19_25/30%)]"
          />
        </div>

        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          New Episodes on YouTube
        </h2>
        <p className="mb-8 text-muted-foreground leading-relaxed">
          Season 2 is underway. Subscribe so you never miss a catch, a summit, or a loaf of mountain bread.
        </p>

        <a
          href="https://www.youtube.com/@JoshingNature"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-13 items-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-105 glow-brand-sm"
        >
          Subscribe on YouTube
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </AnimatedSection>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Root export
───────────────────────────────────────────── */
export default function HomePageClient() {
  return (
    <>
      <HeroSection />
      <LatestEpisodesSection />
      <PillarsSection />
      <SeasonArchiveSection />
      <SubscribeSection />
    </>
  );
}
