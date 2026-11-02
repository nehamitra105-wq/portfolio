import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { NestText } from "../../site/nestText";

// Figma's "slow" curve, as elsewhere on the page.
const SLOW = "cubic-bezier(0.22, 1, 0.36, 1)";

// A line of the page's Neue Montreal copy, placed in its block.
export function TextItem({ item, top, style }: { item: NestText; top: number; style?: CSSProperties }) {
  return (
    <p
      className={`nm absolute whitespace-pre text-black ${item.upper ? "uppercase" : ""}`}
      style={{
        left: item.x,
        top,
        width: item.w,
        fontSize: item.size,
        lineHeight: item.lh ?? "normal",
        letterSpacing: item.ls,
        opacity: item.opacity,
        textAlign: item.center ? "center" : undefined,
        ...style,
      }}
    >
      {item.text}
    </p>
  );
}

// The coloured pills behind the teaser and final-product features, in frame
// coordinates, with the side their graphic sits on (the pill grows out from
// behind it). Where a graphic overlaps the pill, that part of the graphic is a
// transparent layer drawn above it (/assets/nest/pills/pill-<i>.webp, the
// pill's box plus 2px); the page render underneath has no pill.
export type Pill = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  // top-left, top-right, bottom-right, bottom-left
  radii: [number, number, number, number];
  from: "left" | "right";
  layer?: true;
};

export const PILLS: Pill[] = [
  { x: 495, y: 1817, w: 893, h: 239, color: "#c4e665", radii: [119.5, 119.5, 119.5, 119.5], from: "left", layer: true },
  { x: 362, y: 2324, w: 739, h: 239, color: "#ffc653", radii: [119.5, 20, 20, 119.5], from: "right", layer: true },
  { x: 600, y: 2861, w: 806, h: 239, color: "#ffadca", radii: [20, 119.5, 119.5, 20], from: "left", layer: true },
  { x: 362, y: 3413, w: 749, h: 239, color: "#edb5fd", radii: [119.5, 20, 20, 119.5], from: "right", layer: true },
  { x: 658, y: 3966, w: 748, h: 239, color: "#7ad7ff", radii: [20, 119.5, 119.5, 20], from: "left", layer: true },
  { x: 831, y: 14174, w: 575, h: 134, color: "#ffc653", radii: [67, 67, 67, 67], from: "left", layer: true },
  { x: 579, y: 14684, w: 484, h: 134, color: "#ffadca", radii: [67, 67, 67, 67], from: "right" },
  { x: 870, y: 14985, w: 536, h: 134, color: "#edafff", radii: [67, 67, 67, 67], from: "left" },
  { x: 817, y: 15458, w: 589, h: 134, color: "#b3c9ff", radii: [67, 67, 67, 67], from: "left", layer: true },
  { x: 542, y: 15956, w: 533, h: 134, color: "#c4e665", radii: [67, 67, 67, 67], from: "right" },
  { x: 738, y: 16455, w: 668, h: 134, color: "#7ad7ff", radii: [67, 67, 67, 67], from: "left", layer: true },
];

export const inPill = (item: NestText, pill: Pill) =>
  item.x >= pill.x && item.x < pill.x + pill.w && item.y >= pill.y && item.y < pill.y + pill.h;

const GROW_MS = 1250;
// Let the block's own fade-in get going first so the growth is visible.
const GROW_DELAY_MS = 300;
const TEXT_DELAY_MS = 750;
const TEXT_SHIFT = 40;

// As the pill scrolls into view it grows sideways out from behind its graphic,
// then its text fades in from the same side.
export function PillReveal({
  pill,
  index,
  top,
  texts,
}: {
  pill: Pill;
  index: number;
  top: number;
  texts: NestText[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const anchor = pill.from === "left" ? { left: pill.x } : { left: pill.x + pill.w - (shown ? pill.w : pill.h) };
  const shift = pill.from === "left" ? -TEXT_SHIFT : TEXT_SHIFT;

  return (
    <>
      <div
        className="absolute"
        ref={ref}
        style={{
          ...anchor,
          top,
          width: shown ? pill.w : pill.h,
          height: pill.h,
          background: pill.color,
          borderRadius: pill.radii.map((r) => `${r}px`).join(" "),
          opacity: shown ? 1 : 0,
          transition: `width ${GROW_MS}ms ${SLOW} ${GROW_DELAY_MS}ms, left ${GROW_MS}ms ${SLOW} ${GROW_DELAY_MS}ms, opacity 300ms ease-out ${GROW_DELAY_MS}ms`,
        }}
      />
      {pill.layer && (
        <img
          alt=""
          className="pointer-events-none absolute block max-w-none"
          src={`/assets/nest/pills/pill-${String(index).padStart(2, "0")}.webp`}
          style={{ left: pill.x - 2, top: top - 2, width: pill.w + 4, height: pill.h + 4 }}
        />
      )}
      {texts.map((item) => (
        <TextItem
          item={item}
          key={`${item.x},${item.y}`}
          style={{
            opacity: shown ? (item.opacity ?? 1) : 0,
            translate: shown ? "0 0" : `${shift}px 0`,
            transition: `opacity 900ms ${SLOW} ${TEXT_DELAY_MS}ms, translate 1100ms ${SLOW} ${TEXT_DELAY_MS}ms`,
          }}
          top={top + item.y - pill.y}
        />
      ))}
    </>
  );
}
