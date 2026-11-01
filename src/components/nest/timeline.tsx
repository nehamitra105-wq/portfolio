import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Figma keyframe animations (the page timeline is one 12s loop). Each track
// lists values at fractional times of the loop, like motion.dev keyframes.
export type Ease = "linear" | "easeIn" | "easeOut" | "easeInOut" | [number, number, number, number];

export type Track = {
  values: (number | string)[];
  times: number[];
  ease?: Ease | Ease[];
};

export type Tracks = Partial<
  Record<"opacity" | "x" | "y" | "width" | "height" | "rotate" | "background" | "color", Track>
>;

export const TIMELINE_MS = 12000;

const easing = (ease: Ease) => {
  if (Array.isArray(ease)) return `cubic-bezier(${ease.join(",")})`;
  return { linear: "linear", easeIn: "ease-in", easeOut: "ease-out", easeInOut: "ease-in-out" }[ease];
};

const keyframe = (prop: keyof Tracks, value: number | string): Keyframe => {
  switch (prop) {
    case "x":
      return { translate: `${value}px 0px` };
    case "y":
      return { translate: `0px ${value}px` };
    case "width":
    case "height":
      return { [prop]: `${value}px` };
    case "rotate":
      return { rotate: `${value}deg` };
    case "background":
      return { backgroundColor: String(value) };
    case "opacity":
      return { opacity: Math.min(1, Number(value)) };
    default:
      return { [prop]: String(value) };
  }
};

// Runs the tracks on an element, all locked to the same loop so separate
// elements stay in sync. x and y add onto any translate the element already has.
export function playTracks(el: HTMLElement, tracks: Tracks, duration = TIMELINE_MS) {
  return (Object.keys(tracks) as (keyof Tracks)[]).map((prop) => {
    const { values, times, ease = "linear" } = tracks[prop]!;
    const count = Math.min(values.length, times.length);
    const frames: Keyframe[] = [];
    for (let i = 0; i < count; i += 1) {
      frames.push({
        ...keyframe(prop, values[i]),
        offset: times[i],
        easing: easing(Array.isArray(ease) && typeof ease[0] !== "number" ? (ease as Ease[])[i] ?? "linear" : (ease as Ease)),
      });
    }
    const animation = el.animate(frames, {
      duration,
      iterations: Infinity,
      composite: prop === "x" || prop === "y" ? "add" : "replace",
      fill: "both",
    });
    animation.startTime = 0;
    return animation;
  });
}

export function useTracks<T extends HTMLElement = HTMLDivElement>(tracks: Tracks) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const animations = playTracks(ref.current, tracks);
    return () => animations.forEach((animation) => animation.cancel());
    // Tracks are static data defined alongside each component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

// The symmetric ease-in-out curve Figma uses on most opacity/colour tracks.
export const IO: Ease = [0.5, 0, 0.5, 1];

// A div that plays its tracks on the shared loop.
export function Anim({
  tracks,
  className = "",
  style,
  children,
}: {
  tracks: Tracks;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useTracks(tracks);
  return (
    <div className={className} ref={ref} style={style}>
      {children}
    </div>
  );
}
