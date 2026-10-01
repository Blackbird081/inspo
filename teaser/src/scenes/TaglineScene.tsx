import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
} from "remotion";
import { useAuthoredFrame } from "../timing";
import { colors, EXPO, fonts } from "../theme";

/* The one line the whole film has been arguing.

   Local timeline (the launch film starts this at global frame 395):
   6-24    "Your agent doesn’t have taste." rises in
   16-34   "Lend it some." follows, its period in accent
   48      the period is taken over by the traveller (it hops to the
           wordmark), and from 50 the words lift away without it */

const expo = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(...EXPO),
};

const line = (frame: number, from: number) => ({
  opacity: interpolate(frame, [from, from + 18], [0, 1], expo),
  translate: interpolate(frame, [from, from + 18], ["0px 28px", "0px 0px"], expo),
});

/* `periodLeavesAt`: the frame the accent period stops being drawn here
   because a traveller has taken it - it hops from "some." to "Inspo." */
export const TaglineScene: React.FC<{ periodLeavesAt?: number }> = ({
  periodLeavesAt = Infinity,
}) => {
  const frame = useAuthoredFrame();

  const out = interpolate(frame, [50, 60], [1, 0], expo);
  const one = line(frame, 6);
  const two = line(frame, 16);

  return (
    /* No wash: the gallery clears itself (its cards recede into the
       paper), so the line rises onto a clean page, not over a fog. */
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: out,
          translate: `0px ${(1 - out) * -18}px`,
        }}
      >
        <Interactive.Div
          name="Tagline"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            fontFamily: fonts.display,
            fontWeight: 400,
            fontSize: 96,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: colors.ink,
            textAlign: "center",
          }}
        >
          <div style={one}>Your agent doesn’t have taste.</div>
          <div style={two}>
            Lend it some
            <span
              style={{
                color: colors.accent,
                opacity: frame < periodLeavesAt ? 1 : 0,
              }}
            >
              .
            </span>
          </div>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
