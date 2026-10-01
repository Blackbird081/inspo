import React from "react";
import { Audio } from "@remotion/media";
import {
  ding,
  mouseClick,
  pageTurn,
  shutterModern,
  uiSwitch,
  whoosh,
} from "@remotion/sfx";
import { Sequence } from "remotion";
import { useAuthoredFrames } from "./timing";

/* Global authored (30fps) frames for the launch cut. Each reference
   kept fires a shutter; each one read gets a soft switch as its palette
   lands; the render pass is a page turn; everything that travels gets a
   whoosh scaled to how far it goes. */
const SHUTTERS = [109, 116, 123];
const READS = [161, 166, 171];

const cues: { at: number; src: string; volume: number; name: string }[] = [
  { at: 49, src: mouseClick, volume: 0.7, name: "send" },
  { at: 55, src: whoosh, volume: 0.45, name: "pill to chip, archive surges" },
  ...SHUTTERS.map((at) => ({ at, src: shutterModern, volume: 0.4, name: "pick" })),
  { at: 127, src: whoosh, volume: 0.4, name: "fan out" },
  ...READS.map((at) => ({ at, src: uiSwitch, volume: 0.28, name: "read" })),
  { at: 201, src: whoosh, volume: 0.42, name: "gather" },
  { at: 239, src: whoosh, volume: 0.25, name: "grow" },
  { at: 249, src: pageTurn, volume: 0.5, name: "render pass" },
  { at: 281, src: whoosh, volume: 0.22, name: "flick" },
  { at: 329, src: whoosh, volume: 0.4, name: "deal" },
  { at: 385, src: whoosh, volume: 0.18, name: "recede" },
  { at: 457, src: whoosh, volume: 0.2, name: "period hop" },
  { at: 477, src: ding, volume: 0.25, name: "period lands" },
  { at: 487, src: uiSwitch, volume: 0.2, name: "address" },
];

export const LaunchSoundtrack: React.FC = () => {
  const t = useAuthoredFrames();

  return (
    <>
      {cues.map((c) => (
        <Sequence key={`${c.name}-${c.at}`} from={t(c.at)} name={`sfx: ${c.name}`}>
          <Audio src={c.src} volume={c.volume} />
        </Sequence>
      ))}
    </>
  );
};
