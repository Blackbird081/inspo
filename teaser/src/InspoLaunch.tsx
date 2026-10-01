import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { useAuthoredFrames } from "./timing";
import { LaunchSoundtrack } from "./LaunchSoundtrack";
import { ArchiveScene } from "./scenes/ArchiveScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { OutroScene } from "./scenes/OutroScene";
import { PromptScene } from "./scenes/PromptScene";
import { TaglineScene } from "./scenes/TaglineScene";
import { colors } from "./theme";

/* The launch film. 17.3 seconds. Written at 30fps and rendered at
   60 - see src/timing.ts. Every number below is an authored frame.
   0-62     Prompt: a real brief, typed from the very first frame,
            then held complete long enough to actually be read
   59-300   Inspo searches the archive, keeps three, reads them,
            builds the page and gives it one screen of scroll
   297-388  The gallery: five more pages deal out from behind that
            one into a grid (it starts on the exact frame the archive
            leaves, and runs on under the tagline's wash)
   371-432  The line: your agent doesn't have taste, lend it some
   427-519  The mark, that it is free and open source, and where it
            lives - the address gets a long hold, it is the one thing
            a viewer has to leave with */
export const InspoLaunch: React.FC = () => {
  /* Scene bounds below are the authored 30fps numbers. */
  const t = useAuthoredFrames();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence durationInFrames={t(62)} layout="absolute-fill" name="Prompt">
        <PromptScene />
      </Sequence>
      <Sequence
        from={t(59)}
        durationInFrames={t(242)}
        layout="absolute-fill"
        name="Archive"
      >
        <ArchiveScene />
      </Sequence>
      <Sequence
        from={t(297)}
        durationInFrames={t(92)}
        layout="absolute-fill"
        name="Gallery"
      >
        <GalleryScene />
      </Sequence>
      <Sequence
        from={t(371)}
        durationInFrames={t(62)}
        layout="absolute-fill"
        name="Tagline"
      >
        <TaglineScene />
      </Sequence>
      <Sequence from={t(427)} layout="absolute-fill" name="Outro">
        <OutroScene caption="MCP · Free and open source" url="inspomcp.dev" />
      </Sequence>
      <LaunchSoundtrack />
    </AbsoluteFill>
  );
};
