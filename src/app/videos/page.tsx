import type { Metadata } from "next";
import { Film } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import VideoGrid, { type VideoItem } from "./VideoGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Videos | Joshing Nature",
  description:
    "Watch Josh catch and cook wild trout in Montana's remote alpine, solo brook trout adventures, cutthroat in bear territory, and backpacking through Washington's sublime high route.",
  keywords: [
    "catch and cook",
    "fly fishing",
    "brook trout",
    "alpine fishing",
    "backpacking",
    "Montana fishing",
    "Washington outdoors",
    "wild cooking",
    "cutthroat trout",
  ],
  openGraph: {
    title: "Videos | Joshing Nature",
    description:
      "Fishing. Foraging. Cooking. Backpacking. Real outdoor adventures from the backcountry.",
    type: "website",
  },
};

const VIDEOS: VideoItem[] = [
  {
    id: "OSzq1NG36OI",
    videoid: "OSzq1NG36OI",
    title: "S1E1: Catch & Cook in Montana's Remote Alpine",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "kpC8nvFLKFM",
    videoid: "kpC8nvFLKFM",
    title: "S1E2: CCC BASS + TROUT at the local lake",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "f43RzcraNAQ",
    videoid: "f43RzcraNAQ",
    title: "S1E3: Meandering Washington's Coast + Cooking Tastys",
    season: "S1",
    category: "Adventures",
  },
  {
    id: "DLtEvoPqSmI",
    videoid: "DLtEvoPqSmI",
    title: "S1E4: Solo Brook Trout Catch&Cook",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "TJ9Rf_86930",
    videoid: "TJ9Rf_86930",
    title: "S1E5: Fishing and Baking in the Mountains",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "SYEGYOGQlsQ",
    videoid: "SYEGYOGQlsQ",
    title: "S1E7: Catch&Cook Alpine Cutthroat in Bear Territory",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "P7t60OB9Uu0",
    videoid: "P7t60OB9Uu0",
    title: "S2E1: One Steak, Two Trout, Four Loaves",
    season: "S2",
    category: "Catch & Cook",
  },
  {
    id: "Vw87Yfd7qEc",
    videoid: "Vw87Yfd7qEc",
    title: "Washington's Sublime High Route",
    season: "S2",
    category: "Adventures",
  },
  {
    id: "OzrB4Pxa2XM",
    videoid: "OzrB4Pxa2XM",
    title: "S2E3: I Went Winter Camping w/ My Favorite Outdoor Influencer",
    season: "S2",
    category: "Adventures",
    featured: true,
  },
];

export default function VideosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-16">
      {/* Background texture */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Page Header */}
        <AnimatedSection direction="down" className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 glow-brand-sm">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-glow">
              Episodes
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Fishing. Foraging. Cooking. Backpacking.
            </p>
          </div>

          {/* Season strip */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
            {(["S1", "S2"] as const).map((season) => {
              const count = VIDEOS.filter((v) => v.season === season).length;
              return (
                <span key={season} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span>
                    Season {season.slice(1)} — {count} episode
                    {count !== 1 ? "s" : ""}
                  </span>
                </span>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* Interactive Video Grid (client component) */}
        <VideoGrid videos={VIDEOS} />
      </div>
    </div>
  );
}
