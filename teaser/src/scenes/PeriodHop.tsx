import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { arc } from "../motion";
import { useAuthoredFrame } from "../timing";
import { colors, EXPO, fonts } from "../theme";
import { PERIOD_DOT } from "./OutroScene";

/* The tagline's accent period hops into the wordmark.

   "Lend it some." and "Inspo." end on the same red dot, so the film
   carries one into the other: the words lift away and leave the period
   alone on the paper, it gathers itself, then swoops up into the gap
   after "Inspo" as the wordmark arrives around it.

   It is the real glyph the whole way (a Fraunces "." at 220px, scaled),
   not a circle standing in for it, so there is nothing to swap at either
   end. Both resting positions were measured off renders.

   Local timeline (the film starts this at global 445):
   0-4     alone on the paper while the words leave
   4-10    a small anticipation squash
   8-28    the hop, growing from 96px to 220px on an arc, arriving a
           touch large so the wordmark's own settle can take it home
   28      handed to the wordmark (OutroScene periodLandsAt) */

const FROM = { x: 1236.5, y: 628.5 }; /* tagline period, 96px glyph (a scaled 220px glyph rasterises 1px high, hence .5 below the measured 627.5) */
const TO = { x: 1227.5, y: 480.5 }; /* wordmark period, 220px glyph */
const VIA = { x: 1300, y: 420 }; /* the swoop's bow */
const START_SCALE = 96 / 220;

export const PeriodHop: React.FC = () => {
  const frame = useAuthoredFrame();

  const hop = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.5, 0, 0.25, 1),
  });
  const grow = interpolate(frame, [8, 28], [START_SCALE, 1.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...EXPO),
  });
  /* Anticipation: it crouches before it jumps. */
  const crouch = interpolate(frame, [4, 8, 12], [1, 0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const at = arc(hop, FROM, VIA, TO);
  const scale = grow * crouch;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <span
        style={{
          position: "absolute",
          left: at.x - PERIOD_DOT.x * scale,
          top: at.y - PERIOD_DOT.y * scale,
          fontFamily: fonts.display,
          fontWeight: 400,
          fontSize: 220,
          lineHeight: 1,
          color: colors.accent,
          scale: String(scale),
          transformOrigin: "0 0",
        }}
      >
        .
      </span>
    </AbsoluteFill>
  );
};
