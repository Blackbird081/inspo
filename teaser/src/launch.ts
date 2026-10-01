import { staticFile } from "remotion";

/* ── Launch cut geometry ─────────────────────────────────────
   Everything the launch film adds on top of the teaser: the row the
   references are read in, the slightly smaller page frame (a brief
   has to fit above it), and the montage of other pages Inspo built. */

/* The framed page. Same proportions as the teaser's, sat 60px lower
   and a touch smaller so the brief pill has room above it. */
export const FRAME = { x: 231, y: 160, w: 1458, h: 820, radius: 24 };

/* ── The opening morph ───────────────────────────────────────
   The prompt pill does not cut away: it becomes the search chip. These
   are the two rects it travels between. PILL must match PromptScene's
   pill exactly (it is centred on the frame at 1280 x 104), because the
   archive takes over from it on a frame where they are identical. */
export const PILL = { x: (1920 - 1280) / 2, y: (1080 - 104) / 2, w: 1280, h: 104 };
export const CHIP = { x: (1920 - 660) / 2, y: 58, w: 660, h: 78 };
/* PromptScene's send button: 72px, 16px in from the pill's right. */
export const SEND = { size: 72, right: 16 };

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

   The built page is Tenner, a pocket-money app: the most relatable
   brief in the gallery, the loudest hero, and a section under it that
   is a burst of colour cards, so the scroll has somewhere to arrive.

   The other five are cast for range and for colour, because at grid
   size colour is most of what reads: a tattoo studio, a frame builder,
   a climbing gym, a ramen shop and a terminal emulator. Three light
   and three dark, checkerboarded so no two of a kind touch. */
export type GalleryPage = {
  slug: string;
  brief: string;
  img: { w: number; h: number };
};

export const GALLERY: GalleryPage[] = [
  {
    slug: "teen-savings-full",
    brief: "build a landing page for Tenner, pocket money for teens",
    img: { w: 2560, h: 3600 },
  },
  {
    slug: "tattoo-studio-full",
    brief: "a booking page for our tattoo studio",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "calder-frameworks-full",
    brief: "a site for my bike workshop",
    img: { w: 2560, h: 1950 },
  },
  {
    slug: "chalkline-gym-full",
    brief: "a site for our climbing gym",
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

/* ── Where the built page's scroll lands ─────────────────────
   One human flick down Tenner, landing on the section under the hero:
   "Saving is easier when the money has somewhere to go", the coloured
   cards below it, and the titles of the second row of cards just
   peeking at the bottom edge - how a page actually sits after a
   flick, rather than a section snapped flush to the top.

   In CSS px of the 1280-wide page; the capture is 2x. The frame shows
   1280 x 720 CSS px of it. */
export const HERO_LAND_CSS = 1010;
export const HERO_DOC_CSS = 8205;
export const HERO_VIEW_CSS = 720;

/** The landing as a scroll offset in rendered px inside FRAME. */
export const heroScroll = (img: { w: number; h: number }) =>
  HERO_LAND_CSS * 2 * (FRAME.w / img.w);
