import { useEffect, useRef, useState, type CSSProperties } from "react";
import { scaledSize, type NestText } from "../../site/nestText";

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
        fontSize: scaledSize(item.size),
        lineHeight: item.lh ?? "normal",
        letterSpacing: item.ls && (item.ls * scaledSize(item.size)) / item.size,
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
  layer?: [x: number, y: number, w: number, h: number];
};

// Sizes as in the Figma; `layer` is the box (frame coordinates) the graphic's
// cut-out layer was made for, the pill's earlier, larger size.
export const PILLS: Pill[] = [
  { x: 495, y: 1851, w: 893, h: 171, color: "#c4e665", radii: [119.5, 119.5, 119.5, 119.5], from: "left", layer: [495, 1817, 893, 239] },
  { x: 362, y: 2357, w: 739, h: 172, color: "#ffc653", radii: [119.5, 20, 20, 119.5], from: "right", layer: [362, 2324, 739, 239] },
  // Figma has it from x 590, but its first 10px sit behind the phone, past the
  // edge of the phone's cut-out; starting at 600 looks the same.
  { x: 600, y: 2894, w: 806, h: 172, color: "#ffadca", radii: [20, 119.5, 119.5, 20], from: "left", layer: [600, 2861, 806, 239] },
  { x: 362, y: 3447, w: 749, h: 172, color: "#edb5fd", radii: [119.5, 20, 20, 119.5], from: "right", layer: [362, 3413, 749, 239] },
  { x: 658, y: 3991, w: 748, h: 172, color: "#7ad7ff", radii: [20, 119.5, 119.5, 20], from: "left", layer: [658, 3966, 748, 239] },
  { x: 831, y: 14192, w: 575, h: 98, color: "#ffc653", radii: [67, 119.5, 119.5, 67], from: "left", layer: [831, 14174, 575, 134] },
  { x: 579, y: 14701, w: 484, h: 98, color: "#ffadca", radii: [67, 119.5, 119.5, 67], from: "right" },
  { x: 870, y: 15003, w: 536, h: 98, color: "#edafff", radii: [67, 119.5, 119.5, 67], from: "left" },
  { x: 817, y: 15477, w: 589, h: 96, color: "#b3c9ff", radii: [67, 119.5, 119.5, 67], from: "left", layer: [817, 15458, 589, 134] },
  { x: 542, y: 15977, w: 533, h: 98, color: "#c4e665", radii: [67, 119.5, 119.5, 67], from: "right" },
  { x: 738, y: 16474, w: 668, h: 96, color: "#7ad7ff", radii: [67, 119.5, 119.5, 67], from: "left", layer: [738, 16455, 668, 134] },
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
          // Figma caps each corner at half the short side; CSS would instead
          // shrink every corner in proportion.
          borderRadius: pill.radii.map((r) => `${Math.min(r, pill.h / 2)}px`).join(" "),
          opacity: shown ? 1 : 0,
          transition: `width ${GROW_MS}ms ${SLOW} ${GROW_DELAY_MS}ms, left ${GROW_MS}ms ${SLOW} ${GROW_DELAY_MS}ms, opacity 300ms ease-out ${GROW_DELAY_MS}ms`,
        }}
      />
      {pill.layer && (
        <img
          alt=""
          className="pointer-events-none absolute block max-w-none"
          src={`/assets/nest/pills/pill-${String(index).padStart(2, "0")}.webp`}
          style={{ left: pill.layer[0] - 2, top: top + pill.layer[1] - pill.y - 2, width: pill.layer[2] + 4, height: pill.layer[3] + 4 }}
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
