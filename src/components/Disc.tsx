import { forwardRef, type CSSProperties } from "react";
import type { DiscImage } from "../site/caseStudies";

// A disc laid out by its circle: the wrapper is the circle's box and the
// export (with its shadow) is placed around it, so it can be moved, scaled
// and rotated about the disc's centre.
const Disc = forwardRef<
  HTMLDivElement,
  { disc: DiscImage; className?: string; style?: CSSProperties }
>(function Disc({ disc, className = "", style }, ref) {
  const pct = (value: number) => `${(value / disc.size) * 100}%`;

  return (
    <div className={className} ref={ref} style={style}>
      <img
        alt=""
        className="absolute block max-w-none"
        draggable={false}
        src={disc.src}
        style={{ left: pct(disc.dx), top: pct(disc.dy), width: pct(disc.width), height: pct(disc.height) }}
      />
    </div>
  );
});

export default Disc;
