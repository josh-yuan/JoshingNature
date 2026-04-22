"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubeEmbed } from "@next/third-parties/google";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type VideoSeason = "S1" | "S2";
export type VideoCategory = "Catch & Cook" | "Adventures";

export interface VideoItem {
  id: string;
  videoid: string;
  title: string;
  season: VideoSeason;
  category: VideoCategory;
  featured?: boolean;
}

type FilterTab = "All" | "Season 1" | "Season 2" | "Catch & Cook" | "Adventures";

const TABS: FilterTab[] = ["All", "Season 1", "Season 2", "Catch & Cook", "Adventures"];

// ─── Motion Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {},
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97 },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function thumbnailUrl(videoid: string) {
  return `https://i.ytimg.com/vi/${videoid}/hqdefault.jpg`;
}

function youtubeUrl(videoid: string) {
  return `https://youtu.be/${videoid}`;
}

function matchesTab(video: VideoItem, tab: FilterTab): boolean {
  if (tab === "All") return true;
  if (tab === "Season 1") return video.season === "S1";
  if (tab === "Season 2") return video.season === "S2";
  if (tab === "Catch & Cook") return video.category === "Catch & Cook";
  if (tab === "Adventures") return video.category === "Adventures";
  return true;
}

// ─── Season Badge ────────────────────────────────────────────────────────────

function SeasonBadge({ season }: { season: VideoSeason }) {
  return (
    <Badge
      variant="outline"
      className="shrink-0 text-[11px] px-2 py-0.5 border bg-accent/15 text-accent border-accent/30"
    >
      {season}
    </Badge>
  );
}

// ─── Category Badge ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: VideoCategory }) {
  if (category === "Catch & Cook") {
    return (
      <Badge
        variant="outline"
        className="shrink-0 text-[11px] px-2 py-0.5 border bg-primary/15 text-primary border-primary/30"
      >
        Catch &amp; Cook
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="shrink-0 text-[11px] px-2 py-0.5 border bg-stone-500/15 text-stone-400 border-stone-500/30"
    >
      Adventures
    </Badge>
  );
}

// ─── Featured Card (YouTubeEmbed + meta) ─────────────────────────────────────

function FeaturedCard({ video }: { video: VideoItem }) {
  return (
    <article className="group relative flex flex-col rounded-xl bg-card border border-primary/30 overflow-hidden shadow-[0_0_30px_oklch(0.56_0.19_25_/_12%)]">
      {/* Featured label */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
          <Play className="h-3 w-3 fill-current" />
          Latest Episode
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Embed */}
      <div className="relative w-full aspect-video bg-muted">
        <YouTubeEmbed videoid={video.videoid} params="rel=0&modestbranding=1" />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 flex-1 min-w-0">
            {video.title}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <SeasonBadge season={video.season} />
            <CategoryBadge category={video.category} />
          </div>
        </div>
        <a
          href={youtubeUrl(video.videoid)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 w-fit"
        >
          Watch on YouTube
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

// ─── Grid Card (thumbnail + play overlay) ───────────────────────────────────

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <motion.article
      variants={itemVariants}
      layout
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative flex flex-col rounded-xl bg-card border border-border/40 overflow-hidden
        transition-all duration-300
        hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_28px_oklch(0.56_0.19_25_/_20%)]"
    >
      {/* Thumbnail + play overlay */}
      <a
        href={youtubeUrl(video.videoid)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${video.title} on YouTube`}
        className="relative block w-full aspect-video bg-muted overflow-hidden"
      >
        <Image
          src={thumbnailUrl(video.videoid)}
          alt={video.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-lg backdrop-blur-sm">
            <Play className="h-6 w-6 fill-current text-primary-foreground translate-x-0.5" />
          </div>
        </div>
      </a>

      {/* Meta */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 flex-1 min-w-0">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
            <SeasonBadge season={video.season} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <CategoryBadge category={video.category} />
          <a
            href={youtubeUrl(video.videoid)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            Watch
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main VideoGrid ──────────────────────────────────────────────────────────

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const featured = videos.find((v) => v.featured);
  const rest = videos.filter((v) => !v.featured);

  const showFeatured =
    featured !== undefined && matchesTab(featured, activeTab);

  const filteredRest = rest.filter((v) => matchesTab(v, activeTab));

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_oklch(0.56_0.19_25_/_35%)]"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Featured Video */}
      <AnimatePresence mode="wait">
        {showFeatured && (
          <motion.div
            key={`featured-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <FeaturedCard video={featured!} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid section label */}
      {filteredRest.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border/40" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground px-2">
            {activeTab === "All"
              ? "All Episodes"
              : activeTab === "Season 1"
              ? "Season 1"
              : activeTab === "Season 2"
              ? "Season 2"
              : activeTab}
          </span>
          <div className="h-px flex-1 bg-border/40" />
        </div>
      )}

      {/* Video Grid */}
      <AnimatePresence mode="wait">
        {filteredRest.length > 0 ? (
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.07, when: "beforeChildren" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRest.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3"
          >
            <Play className="h-10 w-10 opacity-20" />
            <p className="text-sm">No videos in this category yet.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
