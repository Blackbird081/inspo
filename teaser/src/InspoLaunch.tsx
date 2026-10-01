import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { useAuthoredFrames } from "./timing";
import { LaunchSoundtrack } from "./LaunchSoundtrack";
import { ArchiveScene } from "./scenes/ArchiveScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { OutroScene } from "./scenes/OutroScene";
import { PeriodHop } from "./scenes/PeriodHop";
import { PromptScene } from "./scenes/PromptScene";
import { TaglineScene } from "./scenes/TaglineScene";
import { colors } from "./theme";

/* The launch film. 18.1 seconds. Written at 30fps and rendered at
   60 - see src/timing.ts. Every number below is an authored frame.
   0-56     Prompt: a real brief, typed from the very first frame,
            then held complete long enough to actually be read
   55-322   The pill becomes the search chip; Inspo searches the
            archive, keeps three, reads them, a render pass writes the
            page, and one human flick scrolls it to its next section
   321-412  The gallery: five more pages deal out from behind that
            one into a grid, then recede into the paper
   399-460  The line: your agent doesn't have taste, lend it some
   449-477  Its accent period hops up into the wordmark
   449-542  The mark, that it is free and open source, and where it
            lives - the address gets a long hold, it is the one thing
            a viewer has to leave with */
export const InspoLaunch: React.FC = () => {
  /* Scene bounds below are the authored 30fps numbers. */
  const t = useAuthoredFrames();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence durationInFrames={t(57)} layout="absolute-fill" name="Prompt">
        <PromptScene exit="hold" />
      </Sequence>
      <Sequence
        from={t(55)}
        durationInFrames={t(268)}
        layout="absolute-fill"
        name="Archive"
      >
        <ArchiveScene />
      </Sequence>
      <Sequence
        from={t(321)}
        durationInFrames={t(92)}
        layout="absolute-fill"
        name="Gallery"
      >
        <GalleryScene />
      </Sequence>
      <Sequence
        from={t(399)}
        durationInFrames={t(62)}
        layout="absolute-fill"
        name="Tagline"
      >
        <TaglineScene periodLeavesAt={50} />
      </Sequence>
      <Sequence from={t(449)} layout="absolute-fill" name="Outro">
        <OutroScene
          caption="MCP · Free and open source"
          url="inspomcp.dev"
          markAt={4}
          periodLandsAt={28}
        />
      </Sequence>
      <Sequence
        from={t(449)}
        durationInFrames={t(28)}
        layout="absolute-fill"
        name="Period hop"
      >
        <PeriodHop />
      </Sequence>
      <LaunchSoundtrack />
    </AbsoluteFill>
  );
};
