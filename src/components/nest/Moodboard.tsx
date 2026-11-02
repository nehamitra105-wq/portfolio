import { useState, type CSSProperties } from "react";
import { MOODBOARD_HEIGHT, MOODBOARD_TILES, MOODBOARD_WIDTH } from "../../site/nestMoodboard";

export { MOODBOARD_HEIGHT, MOODBOARD_WIDTH };

// From the "Image Hover Interaction" Make: the hovered image doubles in size
// (kept inside the cluster) and the images near it are pushed out of its way.
const HOVER_SCALE = 2;
const GAP = 6;
const INFLUENCE_MARGIN = 78;
const MAX_RADIAL_PUSH = 28;

const TILES = MOODBOARD_TILES.map(([x, y, w, h], i) => ({
  src: `/assets/nest/moodboard/${String(i).padStart(3, "0")}.webp`,
  x,
  y,
  w,
  h,
}));

type Offset = { x: number; y: number };
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function layoutAround(activeIndex: number): Offset[] {
  const active = TILES[activeIndex];
  const enlargedWidth = active.w * HOVER_SCALE;
  const enlargedHeight = active.h * HOVER_SCALE;
  const intendedLeft = active.x - (enlargedWidth - active.w) / 2;
  const intendedTop = active.y - (enlargedHeight - active.h) / 2;
  const activeOffset = {
    x: clamp(intendedLeft, 0, Math.max(MOODBOARD_WIDTH - enlargedWidth, 0)) - intendedLeft,
    y: clamp(intendedTop, 0, Math.max(MOODBOARD_HEIGHT - enlargedHeight, 0)) - intendedTop,
  };
  const activeCenterX = active.x + active.w / 2 + activeOffset.x;
  const activeCenterY = active.y + active.h / 2 + activeOffset.y;
  const influence = Math.max(enlargedWidth, enlargedHeight) + INFLUENCE_MARGIN;

  return TILES.map((tile, i) => {
    if (i === activeIndex) return activeOffset;

    const deltaX = tile.x + tile.w / 2 - activeCenterX;
    const deltaY = tile.y + tile.h / 2 - activeCenterY;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance >= influence) return { x: 0, y: 0 };

    // A gentle push away from the enlarged image, stronger up close...
    const falloff = 1 - distance / influence;
    const push = MAX_RADIAL_PUSH * falloff * falloff;
    let x = distance === 0 ? push : (deltaX / distance) * push;
    let y = distance === 0 ? 0 : (deltaY / distance) * push;

    // ...plus whatever it takes to clear it along the shorter axis.
    const overlapX = enlargedWidth / 2 + tile.w / 2 + GAP - Math.abs(deltaX);
    const overlapY = enlargedHeight / 2 + tile.h / 2 + GAP - Math.abs(deltaY);
    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) x += Math.sign(deltaX || 1) * overlapX;
      else y += Math.sign(deltaY || 1) * overlapY;
    }

    return {
      x: clamp(x, -tile.x, MOODBOARD_WIDTH - tile.x - tile.w),
      y: clamp(y, -tile.y, MOODBOARD_HEIGHT - tile.y - tile.h),
    };
  });
}

export default function Moodboard({ style }: { style: CSSProperties }) {
  const [active, setActive] = useState<number | null>(null);
  const offsets = active === null ? null : layoutAround(active);

  return (
    <div
      aria-label="Moodboard"
      className="absolute"
      onPointerLeave={() => setActive(null)}
      style={{ ...style, width: MOODBOARD_WIDTH, height: MOODBOARD_HEIGHT }}
    >
      {TILES.map((tile, i) => {
        const offset = offsets?.[i] ?? { x: 0, y: 0 };
        const isActive = i === active;
        return (
          <button
            aria-label={`Enlarge moodboard image ${i + 1}`}
            className="absolute block overflow-hidden rounded-[1px] bg-[#f4f4f2] p-0"
            key={tile.src}
            onBlur={() => setActive(null)}
            onFocus={() => setActive(i)}
            onPointerEnter={() => setActive(i)}
            style={{
              left: tile.x,
              top: tile.y,
              width: tile.w,
              height: tile.h,
              zIndex: isActive ? 2 : undefined,
              boxShadow: isActive ? "0 12px 30px rgba(20, 20, 20, 0.16)" : "none",
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isActive ? HOVER_SCALE : 1})`,
              transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease",
              willChange: "transform",
            }}
            type="button"
          >
            <img alt="" className="block size-full max-w-none select-none" draggable={false} src={tile.src} />
          </button>
        );
      })}
    </div>
  );
}
