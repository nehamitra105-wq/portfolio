import { useEffect, useRef, useState } from "react";
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
  MOBILE_NEST_HERO,
  MOBILE_NEST_LOGO,
  MOBILE_NEST_SCREEN,
  MOBILE_TRAIT_ROWS,
} from "../site/nestMobile";
import Disc from "../components/Disc";
import { CASE_STUDIES } from "../site/caseStudies";
import { FadeUp, Footer, currentZoom, useZoom } from "./MobileHome";

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

// A video that loops while it's on screen.
function ScreenVideo({ src, style }: { src: string; style: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <video className="absolute block max-w-none bg-white object-cover" loop muted playsInline preload="metadata" ref={ref} src={src} style={style} />;
}

// "ribbon cd cas" (149 x 132.5): the next project's CD sits down in its case,
// then rises out of it (after delay, smart animate 1.25s slow) once it's on
// screen. Stepped frame by frame, like the fade-ups, for iPhone Safari.
const RIBBON = CASE_STUDIES.find((study) => study.slug === "ribbon")!;
const CD_DOWN = 4.8;
const CD_UP = -31;
const slowCurve = (t: number) => 1 - (1 - t) ** 4;

function RibbonCd({ left, top }: { left: number; top: number }) {
  const box = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const begin = performance.now();
        const step = () => {
          const t = Math.min(1, (performance.now() - begin) / 1250);
          if (disc.current) disc.current.style.top = `${CD_DOWN + (CD_UP - CD_DOWN) * slowCurve(t)}px`;
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="absolute h-[132.5px] w-[149px]" ref={box} style={{ left, top }}>
      <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src="/assets/home/shelf-case.png" />
      <Disc className="absolute left-[16.5px] size-[123.5px]" disc={RIBBON.shelfDisc} ref={disc} style={{ top: CD_DOWN }} />
    </div>
  );
}

const USE_CASES = ["Shared office space", "Conference room", "Eco-friendly office"];

export default function MobileNest() {
  const navigate = useNavigate();
  const zoom = useZoom();
  // The first screen's height in design units, measured once on arrival (so
  // it holds as Safari's bars come and go). The logo sits at the bottom of
  // it; on screens taller than the design the page below moves down to match.
  const [screen] = useState(() => window.innerHeight / currentZoom());
  const logoTop = screen - MOBILE_NEST_LOGO.below - MOBILE_NEST_LOGO.height;
  // Everything above the logo's foot (the space over the art and the art)
  // shrinks to fit when the screen is shorter than the design.
  const heroScale = Math.min(1, (screen - MOBILE_NEST_LOGO.below) / (MOBILE_NEST_SCREEN - MOBILE_NEST_LOGO.below));
  const extra = screen - MOBILE_NEST_SCREEN;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full overflow-x-clip bg-white">
      <div className="relative" style={{ width: WIDTH, height: MOBILE_NEST_HEIGHT + extra, zoom }}>
        {/* the hero art, fitted to the width, and its logo at the foot of
            the first screen */}
        <FadeUp onLoad>
          <img
            alt=""
            className="absolute block max-w-none"
            src={MOBILE_NEST_HERO.src}
            style={{
              // held to the right edge as it shrinks
              left: WIDTH - (WIDTH - MOBILE_NEST_HERO.left) * heroScale,
              top: MOBILE_NEST_HERO.top * heroScale,
              width: MOBILE_NEST_HERO.width * heroScale,
              height: MOBILE_NEST_HERO.height * heroScale,
            }}
          />
          <img
            alt="nest"
            className="absolute block max-w-none"
            src={MOBILE_NEST_LOGO.src}
            style={{ left: MOBILE_NEST_LOGO.left, top: logoTop, width: MOBILE_NEST_LOGO.width, height: MOBILE_NEST_LOGO.height }}
          />
        </FadeUp>

        {/* Everything below follows the logo: down on a taller screen than the
            design, up on a shorter one. */}
        <div className="absolute inset-x-0 top-0" style={{ transform: extra ? `translateY(${extra}px)` : undefined }}>
        {MOBILE_NEST_BLOCKS.map((block, i) => (
          <FadeUp key={block.src}>
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

        {/* "A/B testing graphic — Mobile", exported from Figma as a video */}
        <FadeUp>
          <ScreenVideo src="/assets/nest/videos/ab-test-mobile.mp4" style={{ left: 7, top: 4995, width: 388, height: 788 }} />
        </FadeUp>

        {/* micro-interactions */}
        <FadeUp>
          <MicroInteractions scale={354 / 896} style={{ left: 24, top: 8307 }} />
        </FadeUp>

        {/* "design system preview" */}
        <FadeUp>
          <SwipeCarousel
            count={2}
            dots={{ left: 180.18 - 25, top: 8944.09 - 8698.56, width: 18.86, height: 3.14, step: 22.78, colors: ["#0278ff", "#ff5c6c"] }}
            gap={17.68}
            height={237.68}
            labels={["Components", "Type and colour"]}
            renderCard={(i) => (
              <div className="absolute inset-0 overflow-hidden rounded-[7.86px] bg-[#fafafa]">
                <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src={`/assets/nest/system-${i + 1}.jpg`} />
              </div>
            )}
            style={{ left: 25, top: 8698.56 }}
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

        {/* next project */}
        <FadeUp>
          <RibbonCd left={229} top={11738.4} />
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
      </div>
      <MobileNestOverlay lift={-extra} zoom={zoom} />
    </div>
  );
}
