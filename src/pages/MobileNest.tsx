import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MicroInteractions from "../components/nest/MicroInteractions";
import MobileNestOverlay from "../components/nest/MobileNestOverlay";
import { MobileMoodboard, SwipeCarousel } from "../components/nest/MobileSwipe";
import { CroppedVideo, KeyScreenScroll, SHUFFLES, Shuffle, VisualTraits } from "../components/nest/NestComponents";
import {
  MOBILE_ABOVE_VIDEO,
  MOBILE_FINAL_VIDEOS,
  MOBILE_MOODBOARD,
  MOBILE_MOOD_TILES,
  MOBILE_NEST_BLOCKS,
  MOBILE_NEST_FOOTER_TOP,
  MOBILE_NEST_HEIGHT,
  MOBILE_TRAIT_ROWS,
} from "../site/nestMobile";
import { FadeUp, Footer, useZoom } from "./MobileHome";

// "mobile - home" (2187:22119): the nest case study at 402 wide, scaled to the
// phone's width. The page is drawn from its Figma render, block by block, each
// fading in and up as it comes on screen; the moving parts are live on top.
const WIDTH = 402;

// A desktop component drawn smaller: `size` is its desktop size, `scale` how
// much smaller it is here.
function Scaled({ left, top, size: [w, h], scale, children }: { left: number; top: number; size: [number, number]; scale: number; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left, top, width: w * scale, height: h * scale }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: w, height: h, scale }}>
        {children}
      </div>
    </div>
  );
}

const USE_CASES = ["Shared office space", "Conference room", "Eco-friendly office"];

export default function MobileNest() {
  const navigate = useNavigate();
  const zoom = useZoom();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full overflow-x-clip bg-white">
      <div className="relative" style={{ width: WIDTH, height: MOBILE_NEST_HEIGHT, zoom }}>
        {MOBILE_NEST_BLOCKS.map((block, i) => (
          <FadeUp key={block.src} onLoad={i === 0}>
            <img
              alt=""
              className="absolute left-0 block max-w-none"
              decoding="async"
              loading={i < 2 ? "eager" : "lazy"}
              src={block.src}
              style={{ top: block.top, width: WIDTH, height: block.height }}
            />
          </FadeUp>
        ))}

        {/* concept: key screens, moodboard, visual traits, proposals */}
        <FadeUp>
          <Scaled left={151} scale={0.5} size={[200, 200]} top={2218}>
            <KeyScreenScroll style={{ left: 0, top: 0, width: 200, height: 200 }} />
          </Scaled>
        </FadeUp>
        <FadeUp>
          <MobileMoodboard
            height={MOBILE_MOODBOARD.height}
            style={{ left: MOBILE_MOODBOARD.left, top: MOBILE_MOODBOARD.top }}
            tiles={MOBILE_MOOD_TILES}
            width={MOBILE_MOODBOARD.width}
          />
        </FadeUp>
        <FadeUp>
          <VisualTraits border={0.5} fontSize={6} height={200} pillHeight={18} rows={MOBILE_TRAIT_ROWS} style={{ left: 24, top: 3094 }} width={354} />
        </FadeUp>
        <FadeUp>
          <Scaled left={37} scale={44 / 87.44} size={[87.44, 189.57]} top={3399}>
            <Shuffle frames={SHUFFLES.ps1} radius="11px" style={{ left: 0, top: 0, width: 87.44, height: 189.57 }} />
          </Scaled>
          <Scaled left={320} scale={44 / 87.44} size={[87.44, 189.57]} top={3399}>
            <Shuffle frames={SHUFFLES.ps3} radius="11px" style={{ left: 0, top: 0, width: 87.44, height: 189.57 }} />
          </Scaled>
          <Scaled left={40} scale={36 / 71.2} size={[71.2, 71.2]} top={3522}>
            <Shuffle frames={SHUFFLES.ts1} radius="50%" style={{ left: 0, top: 0, width: 71.2, height: 71.2 }} />
          </Scaled>
          <Scaled left={324} scale={36 / 71.2} size={[71.2, 71.2]} top={3521}>
            <Shuffle frames={SHUFFLES.ts3} radius="50%" style={{ left: 0, top: 0, width: 71.2, height: 71.2 }} />
          </Scaled>
        </FadeUp>

        {/* "use case swipe" */}
        <FadeUp>
          <SwipeCarousel
            count={3}
            dots={{ left: 160 - 24.5, top: 4072 - 3709, width: 24, height: 4, step: 29, colors: ["#2c83db", "#e5544d", "#90c94b"] }}
            gap={40}
            height={353}
            labels={USE_CASES}
            renderCard={(i) => (
              <div className="absolute inset-0 overflow-hidden rounded-[20px]">
                <img alt="" className="absolute top-0 left-0 block h-[367px] w-[353px] max-w-none" draggable={false} src={`/assets/nest/mobile/use-case-${i + 1}.webp`} />
              </div>
            )}
            style={{ left: 24.5, top: 3709 }}
            width={353}
          />
        </FadeUp>

        {/* micro-interactions */}
        <FadeUp>
          <MicroInteractions scale={354 / 896} style={{ left: 24, top: 8171 }} />
        </FadeUp>

        {/* "design system preview" */}
        <FadeUp>
          <SwipeCarousel
            count={2}
            dots={{ left: 180.18 - 25, top: 8808.09 - 8562.56, width: 18.86, height: 3.14, step: 22.78, colors: ["#0278ff", "#ff5c6c"] }}
            gap={17.68}
            height={237.68}
            labels={["Components", "Type and colour"]}
            renderCard={(i) => (
              <div className="absolute inset-0 overflow-hidden rounded-[7.86px] bg-[#fafafa]">
                <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src={`/assets/nest/system-${i + 1}.jpg`} />
              </div>
            )}
            style={{ left: 25, top: 8562.56 }}
            width={352}
          />
        </FadeUp>

        {/* final product videos, and what sits over them */}
        <FadeUp>
          {MOBILE_FINAL_VIDEOS.map((video) => (
            <CroppedVideo key={video.src} top={video.box[1]} video={video} />
          ))}
          {MOBILE_ABOVE_VIDEO.map(([file, left, top, width, height]) => (
            <img
              alt=""
              className="pointer-events-none absolute block max-w-none"
              key={file}
              src={`/assets/nest/mobile/${file}`}
              style={{ left, top, width, height }}
            />
          ))}
        </FadeUp>

        <FadeUp>
          <Footer
            onAbout={() => navigate("/", { state: { scrollTo: "about" } })}
            onHome={() => navigate("/")}
            onWork={() => navigate("/", { state: { scrollTo: "shelves" } })}
            top={MOBILE_NEST_FOOTER_TOP}
          />
        </FadeUp>
      </div>
      <MobileNestOverlay zoom={zoom} />
    </div>
  );
}
