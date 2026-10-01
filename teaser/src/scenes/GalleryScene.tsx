import React from "react";
import { AbsoluteFill, Easing, Img, Interactive, interpolate } from "remotion";
import {
  CARD_RADIUS,
  FRAME,
  GALLERY,
  gridRect,
  heroScroll,
  pageSrc,
} from "../launch";
import { useAuthoredFrame } from "../timing";
import { colors, EXPO } from "../theme";

/* The pages Inspo made, dealt out of the one it just made.

   Every card begins life stacked exactly on the built page, so the
   first beat is one page and nothing else. They then peel off the
   back of that stack, furthest slot first, and the built page itself
   goes last - it stays put while the others slide out from behind it,
   which is the whole point: this one, and these came too.

   Local timeline:
   0-8     the built page, still where the archive left it
   8-36    the six deal out, two frames apart, eighteen frames each
   36-64   the grid holds and the camera leans in very slightly
   64-88   the cards recede in reading order - they sink back into the
           paper rather than being washed over, so the line that
           follows arrives on a clean page instead of a muddy one */

const DEAL_AT = 8;
const STAGGER = 2;
const TRAVEL = 18;
const LAST_LANDS = DEAL_AT + (GALLERY.length - 1) * STAGGER + TRAVEL;
const EXIT_AT = 64;
const EXIT_STAGGER = 2;
const EXIT_LEN = 14;

const expo = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(...EXPO),
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const GalleryScene: React.FC = () => {
  const frame = useAuthoredFrame();

  /* The whole grid leans in once it has landed. Nothing is ever
     completely still, and it is slow enough to read as a camera
     rather than as a zoom. */
  const lean = interpolate(frame, [LAST_LANDS, 92], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Interactive.Div
        name="Grid"
        style={{
          position: "absolute",
          inset: 0,
          scale: String(lean),
        }}
      >
        {GALLERY.map((page, i) => {
          const slot = gridRect(i);

          /* Dealt from the back of the stack forward, so the built
             page (index 0) is the last to leave. */
          const start = DEAL_AT + (GALLERY.length - 1 - i) * STAGGER;
          const p = interpolate(frame, [start, start + TRAVEL], [0, 1], expo);

          const x = lerp(FRAME.x, slot.x, p);
          const y = lerp(FRAME.y, slot.y, p);
          const w = lerp(FRAME.w, slot.w, p);
          const h = lerp(FRAME.h, slot.h, p);
          const radius = lerp(FRAME.radius, CARD_RADIUS, p);

          /* A card thrown left leans left, and it is upright again by
             the time it lands - sin() is zero at both ends. */
          const swing =
            ((slot.x + slot.w / 2 - (FRAME.x + FRAME.w / 2)) / 1920) *
            7 *
            Math.sin(p * Math.PI);

          /* Lifted off the paper while it travels, set down on
             arrival. It starts on exactly the shadow the archive left
             the page wearing, or the scene cut shows a shadow pop. */
          const lift = Math.sin(p * Math.PI);
          const shadowY = lerp(30, 10, p) + 24 * lift;
          const shadowBlur = lerp(90, 30, p) + 40 * lift;
          const shadowA = lerp(0.22, 0.13, p) + 0.08 * lift;
          const pop = interpolate(
            frame,
            [start + TRAVEL - 3, start + TRAVEL + 3, start + TRAVEL + 11],
            [1, 1.035, 1],
            expo,
          );

          /* The five behind the built page are stacked exactly on it
             and invisible, but a hidden card still casts a shadow, and
             six of them compound into a bruise twice as dark as the
             one the archive left. They are held at zero until they
             actually start moving. */
          const hidden = i === 0 ? 1 : interpolate(p, [0, 0.08], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          /* The recede: accelerating away, like something set down
             being taken back, not a fade at constant speed. */
          const out = interpolate(
            frame,
            [EXIT_AT + i * EXIT_STAGGER, EXIT_AT + i * EXIT_STAGGER + EXIT_LEN],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.55, 0, 0.8, 0.4),
            },
          );

          /* Only the built page is scrolled - it was left a screen
             down, and it winds back to its masthead as it shrinks, so
             it matches the five it is landing beside. */
          const scroll =
            i === 0 ? lerp(heroScroll(page.img), 0, p) : 0;

          return (
            <div
              key={page.slug}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: w,
                height: h,
                zIndex: GALLERY.length - i,
                opacity: hidden * (1 - out),
                rotate: `${swing}deg`,
                scale: String(pop * lerp(1, 0.86, out)),
                translate: `0px ${36 * out}px`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius,
                  overflow: "hidden",
                  backgroundColor: colors.accentInk,
                  boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(26, 26, 26, ${shadowA})`,
                }}
              >
                <Img
                  src={pageSrc(page.slug)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    translate: `0px ${-scroll * (w / FRAME.w)}px`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
