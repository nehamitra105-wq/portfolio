import { useEffect, useRef, type CSSProperties } from "react";
import { MICRO_SCALE } from "../../site/nestLayout";

// "micro interactions" (896 x 619): the three prototype recordings, each in its
// card. The grid is drawn at the Figma's size and scaled up to the 1044-wide
// content column. Each video loops on its own as soon as it ends.
// `bleed` overscans the video past its card: the room-pref recording has black
// baked into rounded corners slightly larger than the card's, so it is drawn
// 3px bigger all round and the card's rounding clips those corners away.
const VIDEOS = [
  { name: "temp-slider", left: 0, top: 0, width: 510, height: 242, radius: 20, bleed: 0 },
  { name: "room-pref-delete", left: 0, top: 282, width: 510, height: 337, radius: 20, bleed: 3 },
  { name: "drag-to-see-preferences", left: 550, top: 0, width: 346, height: 619, radius: 22, bleed: 0 },
];

function LoopingVideo({ name, bleed, style }: { name: string; bleed: number; style: CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Play only while on screen.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="absolute overflow-hidden bg-[#fafafa]" style={style}>
      <video
        className="absolute block max-w-none object-fill"
        loop
        muted
        playsInline
        preload="auto"
        ref={ref}
        src={`/assets/nest/micro/${name}.mp4`}
        style={{ inset: -bleed, width: `calc(100% + ${2 * bleed}px)`, height: `calc(100% + ${2 * bleed}px)` }}
      />
    </div>
  );
}

// `scale` sizes the grid (the mobile page draws it 354 wide).
export default function MicroInteractions({ style, scale = MICRO_SCALE }: { style?: CSSProperties; scale?: number }) {
  return (
    <div className="absolute" style={{ ...style, width: 896 * scale, height: 619 * scale }}>
      <div className="absolute top-0 left-0 h-[619px] w-[896px] origin-top-left" style={{ scale }}>
        {VIDEOS.map(({ name, left, top, width, height, radius, bleed }) => (
          <LoopingVideo bleed={bleed} key={name} name={name} style={{ left, top, width, height, borderRadius: radius }} />
        ))}
      </div>
    </div>
  );
}
