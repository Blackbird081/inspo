import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
} from "remotion";
import { useAuthoredFrame } from "../timing";
import { colors, EXPO, fonts } from "../theme";

export const PROMPT = "build a landing page for Tenner, pocket money for teens";

/* The film opens mid-keystroke on purpose. There is no fly-in and no
   wait: frame 0 is the pill with a caret in it, already typing.

   The line then has to be readable, which is a different problem from
   opening fast. It is solved by holding on the finished sentence, not
   by typing slowly: the reveal stays quick, and the prompt sits
   complete for 28 frames before the camera moves. Roughly a second of
   the whole line, on top of the read-along while it types.

   It does not leave by zooming through itself any more. The press
   releases at 54, the pill is back at rest, and from 55 the archive
   scene owns it: the pill shrinks and rises into the search chip and
   the send button becomes the chip's live dot. So nothing here may
   move after 54 - the handoff frame has to be identical on both sides.

   Frame math: typing 0-25, hold 25-48, send pulses 44-50, press dip
   48-54, at rest from 54. Scene is 57 frames long. */

/* Fast enough to read as a fast typist, not as a wipe. */
const CHARS_PER_FRAME = 2.2;
/* The launch film hands the pill to the archive scene to morph, so
   it holds at rest. The ten-second teaser has no morph and still
   leaves by pushing through the pill into its own search scene. */
export const PromptScene: React.FC<{ exit?: "hold" | "zoom" }> = ({
  exit = "zoom",
}) => {
  const frame = useAuthoredFrame();
  const zoomOut = exit === "zoom";

  const typed = PROMPT.slice(0, Math.floor(frame * CHARS_PER_FRAME));
  const doneTyping = typed.length >= PROMPT.length;

  /* Caret blinks only once typing is done; solid while typing; gone
     the moment send is pressed, as it is in any real input. */
  const caretOn =
    frame >= 48 ? false : doneTyping ? Math.floor(frame / 7) % 2 === 0 : true;

  /* The send press: a quick dip and release on the whole pill. */
  const press = interpolate(frame, [48, 51, 54], [1, 0.965, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.paper,
        justifyContent: "center",
        alignItems: "center",
        scale: zoomOut
          ? String(
              interpolate(frame, [54, 62], [1, 2.4], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.5, 0, 0.9, 0.4),
              }),
            )
          : undefined,
        opacity: zoomOut
          ? interpolate(frame, [56, 62], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.linear,
            })
          : undefined,
      }}
    >
      <Interactive.Div
        name="PromptPill"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          width: 1280,
          height: 104,
          paddingLeft: 44,
          paddingRight: 16,
          borderRadius: 9999,
          backgroundColor: colors.accentInk,
          border: `1.5px solid ${colors.rule}`,
          boxShadow: "0 24px 60px rgba(26, 26, 26, 0.07)",
          /* No entrance fade: the very first frame is already the
             pill with a caret in it. Just a hair of settle so it is
             not dead still while the line types. */
          scale: String(
            press *
              interpolate(frame, [0, 10], [0.985, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EXPO),
              }),
          ),
          translate: interpolate(frame, [0, 10], ["0px 6px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...EXPO),
          }),
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            fontFamily: fonts.sans,
            fontWeight: 400,
            fontSize: 34,
            letterSpacing: "-0.01em",
            color: colors.ink,
            whiteSpace: "pre",
          }}
        >
          {typed}
          <span
            style={{
              display: "inline-block",
              width: 3,
              height: 40,
              marginLeft: 6,
              backgroundColor: colors.ink,
              opacity: caretOn ? 1 : 0,
            }}
          />
        </div>

        {/* Send button - fills with accent the moment typing ends. */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: doneTyping ? colors.accent : colors.paper,
            color: doneTyping ? colors.accentInk : colors.inkMuted,
            fontFamily: fonts.sans,
            fontSize: 36,
            scale: String(
              interpolate(frame, [44, 47, 51], [1, 1.14, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...EXPO),
              }),
            ),
          }}
        >
          ↑
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
