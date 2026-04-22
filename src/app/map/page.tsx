"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Map, Mountain } from "lucide-react";

const MapExplorer = dynamic(() => import("@/components/MapExplorer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Mountain className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 64px)", marginTop: "64px" }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3 px-5 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md shrink-0"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <Map className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-none text-foreground">
            Trail Explorer
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Discover trails across the Pacific Northwest
          </p>
        </div>
      </motion.div>

      {/* Map fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        <MapExplorer />
      </div>
    </div>
  );
}
