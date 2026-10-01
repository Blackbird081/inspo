import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
} from "remotion";
import { useAuthoredFrame } from "../timing";
import {
  CARD,
  PICKS,
  pickSrc,
  SCREEN_COUNT,
  WALL,
  WALL_ORDER,
  WALL_REST_Y,
  WALL_START_Y,
  wallCell,
  wallH,
  wallTile,
  ZOOM_ANCHOR,
  ZOOM_MAX,
} from "../shots";
import {
  CHIP,
  FRAME,
  GALLERY,
  HERO_DOC_CSS,
  HERO_LAND_CSS,
  HERO_VIEW_CSS,
  heroScroll,
  pageSrc,
  PILL,
  REF_META,
  ROW,
  rowRect,
  SEND,
} from "../launch";
import { flick } from "../motion";
import { colors, EXPO, fonts } from "../theme";
import { PROMPT } from "./PromptScene";

/* The launch cut of the teaser's search scene. Same scan, same push-in,
   same three picks; then the picks fan into a row and Inspo reads them
   (site, type family, palette) before they gather into the page.

   Local timeline (the film starts this scene at global frame 55):
   0-16     the prompt pill becomes the search chip - it shrinks and
            rises, its send button shrinks into the chip's live dot,
            and the archive surges up from below behind it
   0-52     the archive scrolls past, hundreds of screens deep
   8-48     the chip counts the screens it has searched
   48-70    the camera pushes into the three it kept
   54/61/68 each pick takes a ring and a check
   72-104   the picks fly out into a row
   98-134   Inspo reads them: name and type fade up, the palette pops
   142-150  the reading clears
   146-178  the cards gather into a fanned stack
   172-182  the stack squares up
   184-200  it grows to the size of the page
   194-214  a render pass sweeps down it: above the line is the page
            Inspo made, below it the reference it was made from
   214-226  the finished page, held long enough to land
   226-254  one human flick down it, landing on the next section
   254-264  the scrollbar fades the way an overlay scrollbar does
   266-     the gallery takes over on an identical frame */

const SCROLL_END = 52;
const ZOOM = [48, 70] as const;
const SEL_AT = [54, 61, 68];
const FLY = 72;
const READ = 98;
const READ_OUT = [142, 150] as const;
const GATHER = 146;
const ALIGN = [172, 182] as const;
const GROW = [184, 200] as const;
const SWEEP = [194, 214] as const;
const FLICK = [226, 254] as const;
const BAR_OUT = [256, 264] as const;
const MORPH = [0, 16] as const;

/* Fanned offsets for the card stack: two behind, the last pick in front. */
const STACK = [
  { dx: -36, dy: 20, rot: -5 },
  { dx: 34, dy: -14, rot: 4 },
  { dx: 0, dy: 0, rot: 0 },
];

const expo = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(...EXPO),
};

const RESULT = GALLERY[0];
const scrollDist = heroScroll(RESULT.img);

export const ArchiveScene: React.FC = () => {
  const frame = useAuthoredFrame();

  /* The scan: already at speed when we arrive, then a long settle. */
  const wallY = interpolate(
    frame,
    [0, SCROLL_END],
    [WALL_START_Y, WALL_REST_Y],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.1, 0.72, 0.12, 1),
    },
  );

  /* The push-in. `zoom` scales, `pin` slides the anchor from the frame
     centre onto the picks, so at zoom 1 nothing has moved yet. */
  const zoom = interpolate(frame, [ZOOM[0], ZOOM[1]], [1, ZOOM_MAX], expo);
  const pin = interpolate(frame, [ZOOM[0], ZOOM[1]], [0, 1], expo);
  const anchor = {
    x: interpolate(pin, [0, 1], [960, ZOOM_ANCHOR.x]),
    y: interpolate(pin, [0, 1], [540, ZOOM_ANCHOR.y + wallY]),
  };
  const project = (x: number, y: number) => ({
    x: (x - anchor.x) * zoom + 960,
    y: (y - anchor.y) * zoom + 540,
  });

  /* Speed reads as blur while the wall is really moving. */
  const blur = interpolate(frame, [0, 34], [5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });

  /* Everything that was not picked recedes, then leaves. */
  const wallOpacity =
    interpolate(frame, [SEL_AT[0], ZOOM[1]], [1, 0.22], expo) *
    interpolate(frame, [76, 92], [1, 0], expo);

  const searched = Math.round(
    interpolate(frame, [10, 48], [0, SCREEN_COUNT], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.9, 0.2, 1),
    }),
  );

  const chipOut = interpolate(frame, [48, 58], [1, 0], expo);

  /* ── The morph: prompt pill into search chip ──
     Three beats, so nothing crosses anything else:
     0-4    the pill starts to shrink and rise, and the prompt shrinks
            with it and clears
     0-6    the send button shrinks where it is, riding the right end
     6-14   the dot zips along the now-empty pill to its slot
     11-19  the chip's line wipes in behind it, from the dot outward */
  const m = interpolate(frame, [MORPH[0], MORPH[1]], [0, 1], expo);
  const shell = {
    x: interpolate(m, [0, 1], [PILL.x, CHIP.x]),
    y: interpolate(m, [0, 1], [PILL.y, CHIP.y]),
    w: interpolate(m, [0, 1], [PILL.w, CHIP.w]),
    h: interpolate(m, [0, 1], [PILL.h, CHIP.h]),
  };
  const BORDER = 1.5;
  const travel = interpolate(frame, [6, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.6, 0, 0.2, 1),
  });
  const dotSize =
    interpolate(frame, [0, 6], [SEND.size, 15], expo) -
    interpolate(travel, [0, 1], [0, 4]);
  const rightPad = interpolate(m, [0, 1], [SEND.right, 30]);
  const dot = {
    x:
      shell.x +
      interpolate(
        travel,
        [0, 1],
        [shell.w - BORDER - rightPad - dotSize / 2, BORDER + 30 + 5.5],
      ),
    y: shell.y + shell.h / 2,
    size: dotSize,
  };
  /* How far the dot has settled into being the live light. */
  const md = interpolate(frame, [12, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promptOut = interpolate(frame, [0, 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promptScale = interpolate(m, [0, 1], [1, 0.62]);
  const reveal = interpolate(frame, [11, 19], [0, 1], expo);
  const chipContentIn = reveal;

  /* The archive surges up from below as the pill rises, rather than
     already being there when the morph begins. */
  const surge = interpolate(frame, [0, 18], [1080, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.25, 1),
  });
  const surgeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const align = interpolate(frame, [ALIGN[0], ALIGN[1]], [0, 1], expo);
  const grow = interpolate(frame, [GROW[0], GROW[1]], [0, 1], expo);

  /* The render pass: eases in and out, so it reads as a sweep with
     weight rather than a wipe at constant speed. */
  const sweep = interpolate(frame, [SWEEP[0], SWEEP[1]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const sweepLine =
    interpolate(frame, [SWEEP[0], SWEEP[0] + 2], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [SWEEP[1] - 3, SWEEP[1]], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  /* The human flick, and the overlay scrollbar that only shows while
     the page is moving - the detail that sells it as a real browser. */
  const f = flick(
    interpolate(frame, [FLICK[0], FLICK[1]], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const pageScroll = f * scrollDist;
  const scrollCss = f * HERO_LAND_CSS;
  const barIn =
    interpolate(frame, [FLICK[0], FLICK[0] + 3], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [BAR_OUT[0], BAR_OUT[1]], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 1, 1),
    });
  const track = { top: 6, h: FRAME.h - 12 };
  const thumbH = track.h * (HERO_VIEW_CSS / HERO_DOC_CSS);
  const thumbY =
    track.top +
    (scrollCss / (HERO_DOC_CSS - HERO_VIEW_CSS)) * (track.h - thumbH);

  const readOut = interpolate(frame, [READ_OUT[0], READ_OUT[1]], [1, 0], expo);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      {/* ── The archive, scrolling ──────────────────────────── */}
      {wallOpacity > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: wallOpacity * surgeIn,
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            translate: `0px ${surge}px`,
            /* A feathered leading edge while it surges, so it rises
               like a tide rather than a blind being pulled up. */
            maskImage:
              surge > 1
                ? `linear-gradient(to bottom, transparent 0px, black ${(380 * surge) / 1080}px)`
                : undefined,
          }}
        >
          {[0, 1].map((copy) =>
            WALL_ORDER.map((slug, i) => {
              if (slug === null) {
                return null;
              }
              const cell = wallCell(i);
              const top = cell.y - copy * wallH + wallY;
              const p = project(cell.x, top);
              const h = WALL.tileH * zoom;
              if (p.y > 1080 + h || p.y + h < -h) {
                return null;
              }
              return (
                <div
                  key={`${copy}-${slug}`}
                  style={{
                    position: "absolute",
                    left: p.x,
                    top: p.y,
                    width: WALL.tileW * zoom,
                    height: h,
                    borderRadius: WALL.radius * zoom,
                    overflow: "hidden",
                    backgroundColor: colors.accentInk,
                  }}
                >
                  <Img
                    src={wallTile(slug)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                </div>
              );
            }),
          )}
        </AbsoluteFill>
      )}

      {/* ── The prompt, becoming the search ──────────────────────
           The pill the film opened on does not cut away. It shrinks
           and rises into the status chip, closing over the prompt as
           it goes, and once it lands it is glass: the archive shows
           through it. The count is the point of the shot, so it is
           the loud thing in the chip and the label stays quiet. */}
      <div
        style={{
          position: "absolute",
          left: shell.x,
          top: shell.y,
          width: shell.w,
          height: shell.h,
          borderRadius: 9999,
          overflow: "hidden",
          backgroundColor: `rgba(253, 253, 251, ${interpolate(m, [0, 1], [1, 0.82])})`,
          backdropFilter: m > 0.01 ? `blur(${16 * m}px)` : undefined,
          border: `1.5px solid rgba(216, 211, 200, ${interpolate(m, [0, 1], [1, 0.85])})`,
          boxShadow: `0 ${interpolate(m, [0, 1], [24, 6])}px ${interpolate(m, [0, 1], [60, 22])}px rgba(26, 26, 26, ${interpolate(m, [0, 1], [0.07, 0.1])})`,
          opacity: chipOut,
        }}
      >
        {/* The prompt, exactly where PromptScene left it. */}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            fontFamily: fonts.sans,
            fontWeight: 400,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: colors.ink,
            whiteSpace: "pre",
            opacity: promptOut,
            scale: String(promptScale),
            transformOrigin: "0% 50%",
          }}
        >
          {PROMPT}
        </div>

        <Interactive.Div
          name="SearchChip"
          style={{
            position: "absolute",
            left: 30,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: 22,
            opacity: interpolate(reveal, [0, 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            clipPath: `inset(0 ${(1 - chipContentIn) * 100}% 0 0)`,
          }}
        >
          {/* Where the dot lands; the dot itself is drawn above. */}
          <span style={{ width: 11, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 25,
              letterSpacing: "-0.005em",
              color: colors.inkMuted,
              fontWeight: 400,
              whiteSpace: "pre",
            }}
          >
            <span style={{ fontWeight: 500, color: colors.ink }}>inspo</span>
            {" searching the archive"}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 9,
              marginLeft: 8,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontWeight: 500,
                fontSize: 36,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: colors.ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {searched.toLocaleString("en-US")}
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontWeight: 400,
                fontSize: 25,
                lineHeight: 1,
                color: colors.inkMuted,
              }}
            >
              screens
            </span>
          </span>
        </Interactive.Div>
      </div>

      {/* The send button, shrinking into the live dot: the button you
          pressed becomes the light that says the search is running.
          Drawn outside the shell so its clipping never bites it. */}
      <div
        style={{
          position: "absolute",
          left: dot.x - dot.size / 2,
          top: dot.y - dot.size / 2,
          width: dot.size,
          height: dot.size,
          borderRadius: 9999,
          backgroundColor: colors.accent,
          opacity: chipOut,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 0 ${5 + 2.5 * Math.sin(frame / 3.2)}px rgba(199, 64, 47, ${0.16 * md})`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 36 * (dot.size / SEND.size),
            /* "normal", as in PromptScene's button, or the arrow sits a
               few px off on the handoff frame. */
            color: colors.accentInk,
            opacity: interpolate(frame, [0, 3], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          ↑
        </span>
      </div>

      {/* ── The three it kept ───────────────────────────────── */}
      {frame < GROW[0] &&
        PICKS.map((pick, k) => {
          const cell = wallCell(pick.cell);
          const p = project(cell.x, cell.y + wallY);
          const s = SEL_AT[k];
          const row = rowRect(k);

          /* Fly from the wall into the row... */
          const conv = interpolate(
            frame,
            [FLY + k * 4, FLY + k * 4 + 24],
            [0, 1],
            expo,
          );
          /* ...later gather into the fanned stack... */
          const gath = interpolate(
            frame,
            [GATHER + k * 4, GATHER + k * 4 + 24],
            [0, 1],
            expo,
          );
          /* ...then square up before the build. */
          const fan = gath * (1 - align);
          const dx = STACK[k].dx * fan;
          const dy = STACK[k].dy * fan;
          const rot = STACK[k].rot * fan;

          const rx = interpolate(conv, [0, 1], [p.x, row.x]);
          const ry = interpolate(conv, [0, 1], [p.y, row.y]);
          const rw = interpolate(conv, [0, 1], [WALL.tileW * zoom, row.w]);
          const rh = interpolate(conv, [0, 1], [WALL.tileH * zoom, row.h]);
          const rr = interpolate(
            conv,
            [0, 1],
            [WALL.radius * zoom, ROW.radius],
          );

          const left = interpolate(gath, [0, 1], [rx, CARD.x + dx]);
          const top = interpolate(gath, [0, 1], [ry, CARD.y + dy]);
          const w = interpolate(gath, [0, 1], [rw, CARD.w]);
          const h = interpolate(gath, [0, 1], [rh, CARD.h]);
          const radius = interpolate(gath, [0, 1], [rr, CARD.radius]);

          /* Selection pulse, eased back out as the card starts to fly. */
          const pulse =
            interpolate(frame, [s, s + 6], [1, 1.05], expo) *
            interpolate(
              frame,
              [FLY + k * 4, FLY + k * 4 + 10],
              [1, 1 / 1.05],
              expo,
            );

          const trimOn = interpolate(frame, [s, s + 4], [0, 1], expo);
          const trimOff = interpolate(frame, [76, 88], [1, 0], expo);

          return (
            <div
              key={pick.slug}
              style={{
                position: "absolute",
                left,
                top,
                width: w,
                height: h,
                rotate: `${rot}deg`,
                scale: String(pulse),
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius,
                  overflow: "hidden",
                  /* Eased in as the card leaves the wall, not switched
                     on - a hard switch reads as a flicker. */
                  boxShadow: `0 ${30 * conv}px ${80 * conv}px rgba(26, 26, 26, ${0.28 * conv})`,
                }}
              >
                <Img
                  src={pickSrc(pick.slug)}
                  style={{
                    width: "100%",
                    /* The captures end on the page's own bottom edge -
                       Buildkite's is a white curve whose corners show on
                       a dark card - so the last few percent are cropped. */
                    height: "108%",
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                />
              </div>

              {/* Selection ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -9,
                  borderRadius: radius + 9,
                  border: `5px solid ${colors.accent}`,
                  opacity: trimOn * trimOff,
                  scale: String(interpolate(frame, [s, s + 9], [1.12, 1], expo)),
                }}
              />

              {/* Check badge */}
              <div
                style={{
                  position: "absolute",
                  top: -18,
                  right: -18,
                  width: 54,
                  height: 54,
                  borderRadius: 9999,
                  backgroundColor: colors.accent,
                  color: colors.accentInk,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.sans,
                  fontWeight: 600,
                  fontSize: 29,
                  opacity: trimOff * (frame >= s + 2 ? 1 : 0),
                  scale: String(
                    interpolate(
                      frame,
                      [s + 2, s + 7, s + 12],
                      [0, 1.2, 1],
                      expo,
                    ),
                  ),
                }}
              >
                ✓
              </div>
            </div>
          );
        })}

      {/* ── What it read off them ───────────────────────────── */}
      {frame >= READ && frame < GATHER + 8 && (
        <Interactive.Div name="Reading">
          {PICKS.map((pick, k) => {
            const row = rowRect(k);
            const meta = REF_META[pick.slug];
            const t0 = READ + k * 5;
            const textIn = interpolate(frame, [t0, t0 + 12], [0, 1], expo);

            return (
              <div
                key={pick.slug}
                style={{
                  position: "absolute",
                  left: row.x,
                  top: row.y + row.h + 22,
                  width: row.w,
                  opacity: readOut,
                  translate: `0px ${(1 - readOut) * 12}px`,
                }}
              >
                {/* Site and type family */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    opacity: textIn,
                    translate: `0px ${(1 - textIn) * 10}px`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontWeight: 500,
                      fontSize: 28,
                      letterSpacing: "-0.01em",
                      color: colors.ink,
                    }}
                  >
                    {meta.name}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontWeight: 400,
                      fontSize: 26,
                      letterSpacing: "0.005em",
                      color: colors.inkMuted,
                    }}
                  >
                    {meta.face}
                  </span>
                </div>

                {/* Palette, one swatch at a time */}
                <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                  {meta.palette.map((hex, i) => {
                    const at = t0 + 8 + i * 2;
                    return (
                      <div
                        key={hex}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9999,
                          backgroundColor: hex,
                          boxShadow: "inset 0 0 0 1px rgba(26, 26, 26, 0.1)",
                          opacity: frame >= at ? 1 : 0,
                          scale: String(
                            interpolate(
                              frame,
                              [at, at + 5, at + 10],
                              [0, 1.18, 1],
                              expo,
                            ),
                          ),
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Interactive.Div>
      )}

      {/* ── The page they become ────────────────────────────── */}
      {frame >= GROW[0] && (
        <div
          style={{
            position: "absolute",
            left: interpolate(grow, [0, 1], [CARD.x, FRAME.x]),
            top: interpolate(grow, [0, 1], [CARD.y, FRAME.y]),
            width: interpolate(grow, [0, 1], [CARD.w, FRAME.w]),
            height: interpolate(grow, [0, 1], [CARD.h, FRAME.h]),
            borderRadius: interpolate(grow, [0, 1], [CARD.radius, FRAME.radius]),
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(26, 26, 26, 0.22)",
            /* The gallery composites this same page inside a CSS
               scale, and a scale layer rasterises edges a hair
               differently. Matching it here, even at 1, keeps the cut
               between the two scenes clean. */
            scale: "1",
          }}
        >
          {/* The reference it was made from, until the pass reaches it. */}
          <Img
            src={pickSrc(PICKS[2].slug)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "108%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />

          {/* The page Inspo made, written in above the line. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath:
                sweep < 1 ? `inset(0 0 ${(1 - sweep) * 100}% 0)` : undefined,
            }}
          >
            <Img
              src={pageSrc(RESULT.slug)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                translate: `0px ${-pageScroll}px`,
              }}
            />
          </div>

          {/* The render pass itself: a hairline of accent with a warm
              wake behind it, like a page being written top to bottom. */}
          {sweepLine > 0.001 && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `calc(${sweep * 100}% - 90px)`,
                  height: 90,
                  background:
                    "linear-gradient(to bottom, rgba(199, 64, 47, 0), rgba(199, 64, 47, 0.16))",
                  opacity: sweepLine,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `calc(${sweep * 100}% - 1px)`,
                  height: 2,
                  backgroundColor: colors.accent,
                  boxShadow: "0 0 22px 5px rgba(199, 64, 47, 0.55)",
                  opacity: sweepLine,
                }}
              />
            </>
          )}

          {/* The overlay scrollbar, there only while the page moves. */}
          {barIn > 0.001 && (
            <div
              style={{
                position: "absolute",
                right: 5,
                top: thumbY,
                width: 8,
                height: thumbH,
                borderRadius: 9999,
                backgroundColor: "rgba(26, 26, 26, 0.42)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                opacity: barIn,
              }}
            />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
