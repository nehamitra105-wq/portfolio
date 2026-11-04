import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import ABTest from "../components/nest/ABTest";
import MicroInteractions from "../components/nest/MicroInteractions";
import Moodboard, { MOODBOARD_HEIGHT } from "../components/nest/Moodboard";
import NestNav from "../components/nest/NestNav";
import { PILLS, PillReveal, TextItem, inPill } from "../components/nest/Pills";
import {
  CroppedVideo,
  DesignSystemPreview,
  FINAL_VIDEOS,
  KeyScreenScroll,
  LoFis,
  NextProject,
  SHUFFLES,
  Shuffle,
  SpecBullets,
  UseCase,
  VisualTraits,
} from "../components/nest/NestComponents";
import Reveal from "../components/Reveal";
import SiteFooter, { FOOTER_HEIGHT } from "../components/SiteFooter";
import { caseStudyBySlug } from "../site/caseStudies";
import { NEST_TEXT } from "../site/nestText";

// The frame is 18849 tall; its last 323px is the shared footer, which sits
// below the frame and spans the window.
const FOOTER_TOP = 18849 - FOOTER_HEIGHT;

// The page's top-level Figma blocks, cut halfway between neighbours (blocks
// that overlap are merged). Each block is a slice of the rendered page
// (mockups, photos, graphics) with its live text and components on top, and
// fades in as it scrolls into view.
const CUTS = [
  0, 1002, 1454, 4798, 5711, 7319, 8197, 8894, 9078, 9624, 9825, 10545, 11265, 12002, 12841, 13755, 13937, 14515,
  15280, 16814, 17412, 18065, FOOTER_TOP,
];
const BLOCKS = CUTS.slice(0, -1).map((top, i) => ({
  src: `/assets/nest/plate/block-${String(i).padStart(2, "0")}.webp`,
  top,
  height: CUTS[i + 1] - top,
}));

// Figma's "slow" curve over its 1.25s, slower than the home page's 900ms.
const FADE_MS = 1250;

// The hero (1466 x 942 at 20, 20 in the frame) is drawn outside the frame so it
// can fill the window: its box is the viewport less the page's 20px padding,
// and the artwork covers it. The frame then starts where the hero's padding
// ends in the design, at y 982 (block 0 is the hero).
const HERO_END = 982;
const PAD = "calc(20px * var(--frame-zoom, 1))";

// Layers that sit above the final-product videos in Figma, as transparent
// cut-outs: [file, x, y, w, h].
const ABOVE_VIDEO = [
  ["request-sheet.png", 557, 14306, 203.3, 165],
  ["meeting-block.png", 617, 15139.4, 104.7, 57],
  ["eco-leaf-cutout.png", 1103.3, 16098.1, 62.4, 44.7],
  ["rewards-popup.png", 520, 16568, 187.5, 201],
] as const;

// Live components, by their frame position; `top` is relative to the block.
type Placed = { y: number; render: (top: number) => ReactNode };

// "nest case study" frame (1506 x 18849).
export default function Nest() {
  const frameRef = useRef<HTMLDivElement>(null);
  const next = caseStudyBySlug("ribbon")!;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const components: Placed[] = [
    // Centred under the PHYSICAL SPECS dial (circle centre x 628.3).
    { y: 5508, render: (top) => <SpecBullets style={{ left: 628.3, top }} /> },
    { y: 5135, render: (top) => <KeyScreenScroll style={{ left: 1024, top, width: 200, height: 200, clipPath: "circle(98.9px)" }} /> },
    // In the content column, centred where the Figma cluster (1024 x 289 at
    // 362, 5983) was.
    { y: 5983, render: (top) => <Moodboard style={{ left: 362, top: top + 144.5 - MOODBOARD_HEIGHT / 2 }} /> },
    { y: 6514, render: (top) => <VisualTraits style={{ left: 362, top }} /> },
    { y: 7006, render: (top) => <Shuffle frames={SHUFFLES.ps1} radius="11px" style={{ left: 466, top, width: 87, height: 190 }} /> },
    { y: 7066, render: (top) => <Shuffle frames={SHUFFLES.ts1} radius="50%" style={{ left: 566, top, width: 71, height: 71 }} /> },
    { y: 7006, render: (top) => <Shuffle frames={SHUFFLES.ps3} radius="11px" style={{ left: 1113, top, width: 87, height: 190 }} /> },
    { y: 7066, render: (top) => <Shuffle frames={SHUFFLES.ts3} radius="50%" style={{ left: 1214, top, width: 71, height: 71 }} /> },
    { y: 7560, render: (top) => <UseCase style={{ left: 362, top }} /> },
    { y: 8458, render: (top) => <LoFis style={{ left: 362, top }} /> },
    { y: 9101, render: (top) => <ABTest style={{ left: 362, top }} /> },
    { y: 12182, render: (top) => <MicroInteractions style={{ left: 436, top }} /> },
    { y: 13082, render: (top) => <DesignSystemPreview style={{ left: 436, top }} /> },
    { y: 18105, render: (top) => <NextProject study={next} style={{ left: 100, top }} /> },
    ...FINAL_VIDEOS.map((video) => ({ y: video.box[1], render: (top: number) => <CroppedVideo top={top} video={video} /> })),
    ...ABOVE_VIDEO.map(([name, x, y, w, h]) => ({
      y,
      render: (top: number) => (
        <img alt="" className="absolute block max-w-none" src={`/assets/nest/videos/${name}`} style={{ left: x, top, width: w, height: h }} />
      ),
    })),
  ];
  const inBlock = (y: number, block: (typeof BLOCKS)[number]) => y >= block.top && y < block.top + block.height;

  return (
    <div className="page-clip">
      <Reveal className="h-svh" onLoad duration={FADE_MS} style={{ padding: PAD }}>
        <div className="relative size-full overflow-hidden bg-[#f7f7f7]" style={{ borderRadius: `calc(40px * var(--frame-zoom, 1))` }}>
          {/* Cropped from the bottom-left, so the nest logo keeps the cover's
              space below and beside it at any window shape. */}
          <img alt="" className="absolute inset-0 block size-full max-w-none object-cover object-left-bottom select-none" draggable={false} src="/assets/nest/hero.webp" />
        </div>
      </Reveal>
      {/* Zoom scales the frame's own margin too, so this stays in frame px. */}
      <div className="frame-page" ref={frameRef} style={{ height: FOOTER_TOP, marginTop: -HERO_END }}>
        {BLOCKS.slice(1).map((block, i) => (
          <Reveal
            className="absolute left-0 w-[1506px]"
            duration={FADE_MS}
            key={block.src}
            onLoad={i === 0}
            style={{ top: block.top, height: block.height }}
          >
            <img
              alt=""
              className="absolute top-0 left-0 block w-[1506px] max-w-none select-none"
              decoding="async"
              draggable={false}
              loading={i < 2 ? "eager" : "lazy"}
              src={block.src}
              style={{ height: block.height }}
            />

            {PILLS.map(
              (pill, index) =>
                inBlock(pill.y, block) && (
                  <PillReveal
                    index={index}
                    key={index}
                    pill={pill}
                    texts={NEST_TEXT.filter((item) => inPill(item, pill))}
                    top={pill.y - block.top}
                  />
                ),
            )}

            {NEST_TEXT.filter((item) => inBlock(item.y, block) && !PILLS.some((pill) => inPill(item, pill))).map((item) => (
              <TextItem item={item} key={`${item.x},${item.y}`} top={item.y - block.top} />
            ))}

            {components.map(
              (component, index) =>
                inBlock(component.y, block) && <Fragment key={index}>{component.render(component.y - block.top)}</Fragment>,
            )}
          </Reveal>
        ))}

        {/* Sticks from the metadata down to the end of the reflections. */}
        <NestNav frameRef={frameRef} height={18025 - 1007} />
      </div>
      <SiteFooter />
    </div>
  );
}
