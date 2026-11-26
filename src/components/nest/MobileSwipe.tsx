import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { moodboardLayout, type MoodTile } from "./Moodboard";

// Figma's "slow" easing.
const SLOW = "cubic-bezier(0.22, 1, 0.36, 1)";
const SLIDE = `1.25s ${SLOW}`;
const SWIPE_DISTANCE = 40;

// ---------------------------------------------------------------------------
// A swipe carousel for the mobile case study (use cases, design system). It
// goes round: swiping on from the last card brings the first back in (and
// back from the first, the last). The cards follow the finger while dragged.
// Copies of the last and first card sit either side so the loop never jumps.

type Dots = { left: number; top: number; width: number; height: number; step: number; colors: string[] };

export function SwipeCarousel({
  count,
  width,
  height,
  gap,
  style,
  dots,
  renderCard,
  labels,
}: {
  count: number;
  width: number;
  height: number;
  gap: number;
  style: CSSProperties;
  dots: Dots;
  renderCard: (index: number) => ReactNode;
  labels: string[];
}) {
  // Position along the strip: 0 is the copy of the last card, 1..count the
  // cards, count + 1 the copy of the first.
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [dragX, setDragX] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scale: number; moved: boolean } | null>(null);
  const stepWidth = width + gap;
  const index = (((pos - 1) % count) + count) % count;

  const go = (next: number) => {
    setAnimate(true);
    setPos(next);
  };

  // After sliding onto a copy, jump (without animating) to the real card.
  const onSettled = () => {
    if (pos === 0 || pos === count + 1) {
      setAnimate(false);
      setPos(pos === 0 ? count : 1);
    }
  };
  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const end = (clientX: number | null) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dx = clientX === null ? 0 : (clientX - d.x) / d.scale;
    setDragX(0);
    if (Math.abs(dx) > SWIPE_DISTANCE) go(Math.min(count + 1, Math.max(0, pos + (dx < 0 ? 1 : -1))));
    else if (clientX !== null && !d.moved) go(Math.min(count + 1, pos + 1));
  };

  const cards = [count - 1, ...Array.from({ length: count }, (_, i) => i), 0];

  return (
    <div className="absolute" style={{ ...style, width, height: dots.top + dots.height }}>
      <div
        className="absolute top-0 left-0 touch-pan-y select-none"
        onPointerCancel={() => end(null)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const rect = box.current?.getBoundingClientRect();
          drag.current = { x: event.clientX, scale: rect ? rect.width / width : 1, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d) return;
          const dx = (event.clientX - d.x) / d.scale;
          if (Math.abs(dx) > 6) d.moved = true;
          setDragX(dx);
        }}
        onPointerUp={(event) => end(event.clientX)}
        ref={box}
        style={{ width, height }}
      >
        <div
          className="absolute top-0 left-0 flex"
          onTransitionEnd={onSettled}
          style={{
            gap,
            height,
            translate: `${-stepWidth * pos + dragX}px 0`,
            transition: animate && dragX === 0 ? `translate ${SLIDE}` : "none",
          }}
        >
          {cards.map((card, i) => (
            <div aria-hidden={i === 0 || i === count + 1 || undefined} className="relative shrink-0" key={i} style={{ width, height }}>
              {renderCard(card)}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute" style={{ left: dots.left, top: dots.top, width: dots.step * (count - 1) + dots.width, height: dots.height }}>
        {labels.map((label, i) => (
          <button
            aria-label={label}
            className="absolute"
            key={label}
            onClick={() => go(i + 1)}
            style={{ left: dots.step * i - 2, top: -10, width: dots.width + 4, height: dots.height + 20 }}
            type="button"
          >
            <span
              className="absolute left-[2px] top-[10px] bg-black/20"
              style={{ width: dots.width, height: dots.height, borderRadius: dots.height }}
            />
          </button>
        ))}
        <div
          className="pointer-events-none absolute top-0"
          style={{
            left: dots.step * index,
            width: dots.width,
            height: dots.height,
            borderRadius: dots.height,
            background: dots.colors[index],
            transition: `left ${SLIDE}, background-color ${SLIDE}`,
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The mobile moodboard: the desktop hover, by touch. The image under the
// finger is enlarged (and the others pushed out of its way) as the finger
// moves round the board; one is already enlarged at the start so it's clear
// the board can be explored, and the last one touched stays enlarged.

const MOOD_SCALE = 3;
const MOOD_OPTIONS = { scale: MOOD_SCALE, gap: 4, margin: 44, push: 16 };

type Tile = MoodTile & { src: string };

// The tile under (or nearest to) a point.
function tileAt(tiles: Tile[], x: number, y: number) {
  let best = 0;
  let bestDistance = Infinity;
  tiles.forEach((tile, i) => {
    const dx = Math.max(tile.x - x, 0, x - tile.x - tile.w);
    const dy = Math.max(tile.y - y, 0, y - tile.y - tile.h);
    const toCentre = Math.hypot(tile.x + tile.w / 2 - x, tile.y + tile.h / 2 - y);
    const distance = Math.hypot(dx, dy) * 1000 + toCentre;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  return best;
}

export function MobileMoodboard({
  tiles: list,
  width,
  height,
  style,
}: {
  tiles: [number, number, number, number, number][];
  width: number;
  height: number;
  style: CSSProperties;
}) {
  const [tiles] = useState<Tile[]>(() =>
    list.map(([image, x, y, w, h]) => ({ src: `/assets/nest/moodboard/${String(image).padStart(3, "0")}.webp`, x, y, w, h })),
  );
  const [active, setActive] = useState(() => tileAt(tiles, width / 2, height / 2));
  const board = useRef<HTMLDivElement>(null);
  const offsets = moodboardLayout(tiles, width, height, active, MOOD_OPTIONS);

  const pick = (event: React.PointerEvent) => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = rect.width / width;
    const next = tileAt(tiles, (event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale);
    setActive((current) => (current === next ? current : next));
  };

  return (
    <div
      aria-label="Moodboard"
      className="absolute touch-none select-none"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => event.buttons && pick(event)}
      ref={board}
      style={{ ...style, width, height }}
    >
      {tiles.map((tile, i) => {
        const offset = offsets[i];
        const isActive = i === active;
        return (
          <div
            className="absolute overflow-hidden rounded-[1px] bg-[#f4f4f2]"
            key={tile.src}
            style={{
              left: tile.x,
              top: tile.y,
              width: tile.w,
              height: tile.h,
              zIndex: isActive ? 2 : undefined,
              boxShadow: isActive ? "0 6px 15px rgba(20, 20, 20, 0.16)" : "none",
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isActive ? MOOD_SCALE : 1})`,
              transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease",
              willChange: "transform",
            }}
          >
            <img alt="" className="block size-full max-w-none" draggable={false} src={tile.src} />
          </div>
        );
      })}
    </div>
  );
}
