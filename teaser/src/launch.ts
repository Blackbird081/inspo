import { staticFile } from "remotion";

/* ── Launch cut geometry ─────────────────────────────────────
   Everything the launch film adds on top of the teaser: the row the
   references are read in, the slightly smaller page frame (a brief
   has to fit above it), and the montage of other pages Inspo built. */

/* The framed page. Same proportions as the teaser's, sat 60px lower
   and a touch smaller so the brief pill has room above it. */
export const FRAME = { x: 231, y: 160, w: 1458, h: 820, radius: 24 };

/* The brief pill that floats above a page in the montage. */
export const BRIEF = { top: 64, h: 64 };

/* The row the three references fan into to be read. */
export const ROW = { y: 320, w: 540, h: 338, gap: 54, radius: 20 };
const rowX0 = (1920 - (3 * ROW.w + 2 * ROW.gap)) / 2;
export const rowRect = (k: number) => ({
  x: rowX0 + k * (ROW.w + ROW.gap),
  y: ROW.y,
  w: ROW.w,
  h: ROW.h,
});

/* What Inspo read off each reference. Real archive data, lifted from
   packages/db/src/static-screens.json (palette + fonts per screen). */
export const REF_META: Record<
  string,
  { name: string; face: string; palette: string[] }
> = {
  "mercury-com": {
    name: "mercury.com",
    face: "Arcadia",
    palette: ["#3986c5", "#0c1c29", "#dcbeae", "#718095", "#cdb2aa"],
  },
  "bandcamp-com": {
    name: "bandcamp.com",
    face: "Helvetica Neue",
    palette: ["#e4505b", "#14449c", "#dca1e6", "#a35e7a", "#cac59d"],
  },
  "buildkite-com": {
    name: "buildkite.com",
    face: "Aeonik",
    palette: ["#7a21ed", "#1c044c", "#8c44e4", "#5c9f8d", "#bbbac6"],
  },
};

/* ── The pages Inspo made ────────────────────────────────────
   Six generations from apps/web/public/examples, shot at 2x. The
   first is the page the film just built; the other five are dealt out
   from behind it.

   Cast for range and for colour, because at grid size colour is most
   of what reads: a satellite service, a frame builder, a tattoo
   studio, a ramen shop, a terminal emulator and a pocket-money app.
   Three dark and three light, checkerboarded in the grid below so no
   two of a kind touch. */
export type GalleryPage = {
  slug: string;
  brief: string;
  img: { w: number; h: number };
};

export const GALLERY: GalleryPage[] = [
  {
    slug: "fieldsat-full",
    brief: "build a landing page for Overpass, crop maps for farmers",
    img: { w: 2560, h: 5600 },
  },
  {
    slug: "calder-frameworks-full",
    brief: "a site for my bike workshop",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "tattoo-studio-full",
    brief: "a booking page for our tattoo studio",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "ramen-shop-full",
    brief: "a menu site for my ramen shop",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "ferrite-terminal-full",
    brief: "a page for our open source terminal",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "teen-savings-full",
    brief: "a site for our pocket money app",
    img: { w: 2560, h: 1950 },
  },
];

export const pageSrc = (slug: string) => staticFile(`real/${slug}.jpg`);

/* ── The grid they land in ───────────────────────────────────
   Three across, two down, cards cut to the same aspect as FRAME so
   the built page keeps its shape on the way into its slot. */
export const GRID_COLS = 3;
export const GRID_GAP = 36;
const GRID_MARGIN_X = 90;

export const CARD_W =
  (1920 - 2 * GRID_MARGIN_X - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;
export const CARD_H = CARD_W * (FRAME.h / FRAME.w);
export const CARD_RADIUS = 14;

const gridRows = Math.ceil(GALLERY.length / GRID_COLS);
const gridH = gridRows * CARD_H + (gridRows - 1) * GRID_GAP;
const gridY = (1080 - gridH) / 2;

export const gridRect = (i: number) => ({
  x: GRID_MARGIN_X + (i % GRID_COLS) * (CARD_W + GRID_GAP),
  y: gridY + Math.floor(i / GRID_COLS) * (CARD_H + GRID_GAP),
  w: CARD_W,
  h: CARD_H,
});

/* How far a full-page shot has to travel inside the frame to reach
   its footer. */
export const pageScrollDist = (img: { w: number; h: number }) =>
  Math.max(0, img.h * (FRAME.w / img.w) - FRAME.h);

/* How far the built page scrolls before the rest are dealt out.

   Deliberately one frame-height and no more. An earlier cut ran this
   to 2270 - most of the page - and it was the slowest, least earned
   stretch of the film: a long trip down a page nobody asked to read.
   One screen is enough to prove the thing is a real page with depth
   under the fold, and then it is gone. The gallery scrolls it back up
   as it shrinks into its slot. */
export const HERO_SCROLL_MAX = 820;
export const heroScroll = (img: { w: number; h: number }) =>
  Math.min(pageScrollDist(img), HERO_SCROLL_MAX);
