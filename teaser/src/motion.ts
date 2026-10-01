/* Motion primitives that an easing curve cannot fake. */

const smoothstep = (x: number) => x * x * (3 - 2 * x);

/* A lookup table of a velocity profile's running integral, so position
   can be read back for any progress u in [0, 1] and is exactly 1 at the
   end - the page lands on its target, not near it. */
const integrate = (velocity: (u: number) => number, samples = 600) => {
  const cum = new Float64Array(samples + 1);
  for (let i = 1; i <= samples; i++) {
    const a = velocity((i - 1) / samples);
    const b = velocity(i / samples);
    cum[i] = cum[i - 1] + (a + b) / 2 / samples;
  }
  const total = cum[samples];
  return (u: number) => {
    if (u <= 0) {
      return 0;
    }
    if (u >= 1) {
      return 1;
    }
    const x = u * samples;
    const i = Math.floor(x);
    return (cum[i] + (cum[i + 1] - cum[i]) * (x - i)) / total;
  };
};

/* A trackpad flick, the way macOS and iOS actually scroll: two fingers
   drag the page and it picks up speed for a few frames, the fingers lift,
   and momentum carries it on with an exponential decay until it stops.
   That shape - quick to start, a long soft tail, no ease-in at the far
   end - is what reads as a person scrolling. A bezier ease-in-out reads
   as a machine moving a viewport, which is what it was before.

   `drag` is the share of the move spent under the fingers; `tau` is the
   momentum's time constant, as a share of the whole move. */
export const makeFlick = (drag = 0.16, tau = 0.17) =>
  integrate((u) =>
    u < drag ? smoothstep(u / drag) : Math.exp(-(u - drag) / tau),
  );

export const flick = makeFlick();

/* A point on a quadratic bezier: from a to b, bowed towards c. */
export const arc = (
  t: number,
  a: { x: number; y: number },
  c: { x: number; y: number },
  b: { x: number; y: number },
) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
