/**
 * JoshingNature — Central content store
 * Edit this file to add/update videos, locations, and site content.
 * No need to touch component files for routine content updates.
 */

// ─── Videos ─────────────────────────────────────────────────────────────────

export type VideoSeason = "S1" | "S2";
export type VideoCategory = "Catch & Cook" | "Adventures";

export interface Video {
  id: string;           // YouTube video ID (also used as unique key)
  title: string;
  season: VideoSeason;
  category: VideoCategory;
  featured?: boolean;   // Shows as the hero embed on /videos
  location?: string;    // e.g. "Montana Alpine" — optional display label
}

export const VIDEOS: Video[] = [
  // ── Season 2 ──────────────────────────────────────────────────────────────
  {
    id: "OzrB4Pxa2XM",
    title: "S2E3: I Went Winter Camping w/ My Favorite Outdoor Influencer",
    season: "S2",
    category: "Adventures",
    featured: true,
    location: "Winchester Mountain, WA",
  },
  {
    id: "Vw87Yfd7qEc",
    title: "Washington's Sublime High Route",
    season: "S2",
    category: "Adventures",
    location: "Alpine Lakes Wilderness, WA",
  },
  {
    id: "P7t60OB9Uu0",
    title: "S2E1: One Steak, Two Trout, Four Loaves",
    season: "S2",
    category: "Catch & Cook",
    location: "North Cascades, WA",
  },
  // ── Season 1 ──────────────────────────────────────────────────────────────
  {
    id: "SYEGYOGQlsQ",
    title: "S1E7: Catch&Cook Alpine Cutthroat in Bear Territory",
    season: "S1",
    category: "Catch & Cook",
    location: "North Cascades, WA",
  },
  {
    id: "TJ9Rf_86930",
    title: "S1E5: Fishing and Baking in the Mountains",
    season: "S1",
    category: "Catch & Cook",
    location: "Cascade Mountains, WA",
  },
  {
    id: "DLtEvoPqSmI",
    title: "S1E4: Solo Brook Trout Catch&Cook",
    season: "S1",
    category: "Catch & Cook",
    location: "Alpine Lakes, WA",
  },
  {
    id: "f43RzcraNAQ",
    title: "S1E3: Meandering Washington's Coast + Cooking Tastys",
    season: "S1",
    category: "Adventures",
    location: "Olympic Peninsula, WA",
  },
  {
    id: "kpC8nvFLKFM",
    title: "S1E2: CCC BASS + TROUT at the local lake",
    season: "S1",
    category: "Catch & Cook",
  },
  {
    id: "OSzq1NG36OI",
    title: "S1E1: Catch & Cook in Montana's Remote Alpine",
    season: "S1",
    category: "Catch & Cook",
    location: "Montana Alpine",
  },
];

// ─── Locations (Map markers) ──────────────────────────────────────────────────

export type LocationType = "Fire Lookout" | "Alpine Lake" | "Backpacking" | "Coastal" | "Alpine";

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LocationType;
  description: string;
  videoId?: string;     // Links to a video in VIDEOS array
  videoTitle?: string;
}

export const LOCATIONS: Location[] = [
  {
    id: "winchester-mountain",
    name: "Winchester Mountain Lookout",
    lat: 48.9378,
    lng: -121.6392,
    type: "Fire Lookout",
    description: "Winter camping in a historic fire lookout. Fog, snow, and two hikers with a hot meal.",
    videoId: "OzrB4Pxa2XM",
    videoTitle: "S2E3: I Went Winter Camping w/ My Favorite Outdoor Influencer",
  },
  {
    id: "park-butte",
    name: "Park Butte Lookout",
    lat: 48.7278,
    lng: -121.8156,
    type: "Fire Lookout",
    description: "Mt. Baker views from a classic Washington fire lookout.",
    videoId: "OzrB4Pxa2XM",
  },
  {
    id: "alpine-lakes",
    name: "Alpine Lakes Wilderness",
    lat: 47.5104,
    lng: -121.1814,
    type: "Backpacking",
    description: "Washington's most iconic backcountry — 28 miles, four days, gourmet camp cooking.",
    videoId: "Vw87Yfd7qEc",
    videoTitle: "Washington's Sublime High Route",
  },
  {
    id: "monogram-lake",
    name: "Monogram Lake",
    lat: 48.5831,
    lng: -121.6831,
    type: "Alpine Lake",
    description: "North Cascades alpine lake with trout and dramatic ridgeline views.",
  },
  {
    id: "annette-lake",
    name: "Annette Lake",
    lat: 47.3926,
    lng: -121.5254,
    type: "Alpine Lake",
    description: "Solo overnight — alpine cutthroat on the line, bread baking by the fire.",
    videoId: "TJ9Rf_86930",
  },
  {
    id: "olympic-coast",
    name: "Olympic Peninsula Coast",
    lat: 47.9012,
    lng: -124.6588,
    type: "Coastal",
    description: "Tide pools, coastal camping, and cooking on the edge of the Pacific.",
    videoId: "f43RzcraNAQ",
    videoTitle: "S1E3: Meandering Washington's Coast + Cooking Tastys",
  },
  {
    id: "montana-alpine",
    name: "Montana Remote Alpine",
    lat: 47.0527,
    lng: -113.9813,
    type: "Alpine",
    description: "Where it all started — S1E1, remote alpine catch & cook in big sky country.",
    videoId: "OSzq1NG36OI",
    videoTitle: "S1E1: Catch & Cook in Montana's Remote Alpine",
  },
];

// ─── Social / Channel ─────────────────────────────────────────────────────────

export const CHANNEL = {
  youtube: "https://www.youtube.com/@JoshingNature",
  tiktok: "https://www.tiktok.com/@joshingnature",
  handle: "@JoshingNature",
  tagline: "Fishing. Foraging. Cooking. Backpacking.",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function thumbnailUrl(videoId: string, quality: "hq" | "maxres" = "hq") {
  return quality === "maxres"
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeUrl(videoId: string) {
  return `https://youtu.be/${videoId}`;
}
