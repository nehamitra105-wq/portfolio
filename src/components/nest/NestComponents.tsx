import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Disc from "../Disc";
import type { CaseStudy } from "../../site/caseStudies";

const asset = (name: string) => `/assets/nest/${name}`;
// Figma's "slow" easing, as on the home shelf.
const SLOW = "cubic-bezier(0.22, 1, 0.36, 1)";

// Starts once the element has scrolled into view (prototype animations start
// when their frame is shown).
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView] as const;
}

// Swipe between slides: drag with a finger or the mouse, or swipe sideways on
// a trackpad. `dragX` is the live drag offset; `wasDrag` tells a click handler
// that the pointer just dragged rather than clicked.
const SWIPE_DISTANCE = 50;

function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const [dragX, setDragX] = useState(0);
  const start = useRef<number | null>(null);
  const dragged = useRef(false);
  const wheel = useRef({ total: 0, locked: false, timer: 0 });

  const end = (clientX: number | null) => {
    if (start.current === null) return;
    const dx = clientX === null ? 0 : clientX - start.current;
    start.current = null;
    setDragX(0);
    if (Math.abs(dx) > SWIPE_DISTANCE) onSwipe(dx < 0 ? 1 : -1);
  };

  const handlers = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      start.current = event.clientX;
      dragged.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (start.current === null) return;
      const dx = event.clientX - start.current;
      if (Math.abs(dx) > 6) dragged.current = true;
      setDragX(dx);
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => end(event.clientX),
    onPointerCancel: () => end(null),
    // A trackpad swipe arrives as a burst of horizontal wheel events: act once
    // per burst.
    onWheel: (event: React.WheelEvent<HTMLElement>) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const state = wheel.current;
      window.clearTimeout(state.timer);
      state.timer = window.setTimeout(() => {
        state.total = 0;
        state.locked = false;
      }, 250);
      if (state.locked) return;
      state.total += event.deltaX;
      if (Math.abs(state.total) > SWIPE_DISTANCE) {
        state.locked = true;
        onSwipe(state.total > 0 ? 1 : -1);
      }
    },
  };

  return { handlers, dragX, dragging: start.current !== null, wasDrag: () => dragged.current };
}

// ---------------------------------------------------------------------------
// "key screen scroll" (211 x 211, placed at 200 x 200): the thermostat's three
// key screens slide past, 1s apart (SMART_ANIMATE 2.08s), then loop.

const KEY_SCREEN_HOLD = 1;
const KEY_SCREEN_SLIDE = 2.0835;

export function KeyScreenScroll({ style }: { style: CSSProperties }) {
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hold, slide one screen, three times; the last screen repeats the first
    // so the loop restarts without a jump.
    const step = KEY_SCREEN_HOLD + KEY_SCREEN_SLIDE;
    const total = step * 3;
    const frames: Keyframe[] = [];
    for (let i = 0; i < 3; i += 1) {
      frames.push({ translate: `${-200 * i}px 0px`, offset: (step * i) / total, easing: "linear" });
      frames.push({ translate: `${-200 * i}px 0px`, offset: (step * i + KEY_SCREEN_HOLD) / total, easing: SLOW });
    }
    frames.push({ translate: "-600px 0px", offset: 1 });
    const animation = strip.current?.animate(frames, { duration: total * 1000, iterations: Infinity });
    return () => animation?.cancel();
  }, []);

  return (
    <div className="absolute overflow-hidden rounded-full bg-white" style={style}>
      <div className="absolute top-0 left-0 flex h-[200px] w-[800px]" ref={strip}>
        {[1, 2, 3, 1].map((n, i) => (
          <img alt="" className="block size-[200px] max-w-none" key={i} src={asset(`key-screen-${n}.png`)} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "visual traits anim" (1024 x 174): the 30 traits fade away, slide back in
// row by row, then the 10 chosen ones turn black.

type Pill = [label: string, x: number, width: number, chosen?: true];

const TRAIT_ROWS: { y: number; from: number; pills: Pill[] }[] = [
  {
    y: 0,
    from: 1024,
    pills: [
      ["Warm vs Cool", 0, 95], ["Cards", 105, 54], ["Color Tint", 169, 75], ["Element Dimension", 254, 125, true],
      ["Casing for Headings", 389, 130], ["Graphic Elements", 529, 117], ["Information Density", 656, 126],
      ["Font Weight", 792, 86], ["Number of Typefaces", 888, 136],
    ],
  },
  {
    y: 46,
    from: -1017,
    pills: [
      ["Dark vs Light Theme", 0, 131, true], ["User Acknowledgement", 141, 149], ["Solid / Gradient", 300, 104, true],
      ["Grid System", 414, 88], ["UX Copywriting Tone", 512, 135], ["Icon Line Weight", 657, 111],
      ["Type of Navigation", 778, 121], ["Color Saturation", 909, 109, true],
    ],
  },
  {
    y: 92,
    from: 1025,
    pills: [
      ["Strength of Corner Radius", 0, 159, true], ["Character", 169, 76], ["Focal Point", 255, 81, true],
      ["Contrast", 346, 68], ["Transparency", 424, 95, true], ["Number of Items in Global Nav", 529, 182],
      ["Negative Space", 721, 106], ["Header to Body Text Ratio", 837, 161, true],
    ],
  },
  {
    y: 138,
    from: -912,
    pills: [
      ["Button Format", 112.5, 96, true], ["First Main Color", 218.5, 107], ["Second Main Color", 335.5, 124],
      ["Third Main Color", 469.5, 111], ["Type of Color Palette", 590.5, 133], ["Organic to Geometric Density", 733.5, 178, true],
    ],
  },
];

// Variant "3" (chosen) holds 6s, dissolves to "1" (rows off to the sides,
// hidden), then smart-animates to "2" (all traits) and back to "3".
type TraitPhase = "chosen" | "fading" | "away" | "all";
const TRAIT_TIMELINE: [TraitPhase, number][] = [
  ["chosen", 6000],
  ["fading", 1250],
  ["away", 100],
  ["all", 2083 + 100],
];

export function VisualTraits({ style }: { style: CSSProperties }) {
  const [phase, setPhase] = useState<TraitPhase>("chosen");
  const [ref, inView] = useInView<HTMLDivElement>();

  // The loop starts with the block on screen, holding the chosen traits first.
  useEffect(() => {
    if (!inView) return;
    const index = TRAIT_TIMELINE.findIndex(([name]) => name === phase);
    const timer = window.setTimeout(() => setPhase(TRAIT_TIMELINE[(index + 1) % TRAIT_TIMELINE.length][0]), TRAIT_TIMELINE[index][1]);
    return () => window.clearTimeout(timer);
  }, [phase, inView]);

  const rowTransition =
    phase === "fading" ? `opacity 1.25s ${SLOW}` : phase === "all" ? `opacity 2.083s ${SLOW}, translate 2.083s ${SLOW}` : "none";

  return (
    <div className="absolute h-[174px] w-[1024px]" ref={ref} style={style}>
      {TRAIT_ROWS.map((row) => (
        <div
          className="absolute left-0 h-[36px] w-[1024px]"
          key={row.y}
          style={{
            top: row.y,
            opacity: phase === "fading" || phase === "away" ? 0 : 1,
            translate: phase === "away" ? `${row.from}px 0` : "0 0",
            transition: rowTransition,
          }}
        >
          {row.pills.map(([label, x, width, chosen]) => {
            const black = chosen && (phase === "chosen" || phase === "fading");
            const faded = !chosen && (phase === "chosen" || phase === "fading");
            return (
              <div
                className="nm absolute top-0 flex h-[36px] items-center justify-center rounded-[56px] border border-solid border-black text-[12px] leading-normal tracking-[0.24px] whitespace-nowrap"
                key={label}
                style={{
                  left: x,
                  width,
                  background: black ? "#000" : chosen ? "#fff" : "transparent",
                  color: black ? "#fff" : "#000",
                  opacity: faded ? 0.2 : 1,
                  transition: phase === "chosen" ? `background-color 1.25s ${SLOW}, color 1.25s ${SLOW}, opacity 1.25s ${SLOW}` : "none",
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "TS/PS shuffle" instances: thermostat and phone proposals swap every 0.5s.

export type ShuffleFrame = { src: string; dx: number; dy: number; w: number; h: number };

const frames = (prefix: string, offsets: [number, number, number, number][]): ShuffleFrame[] =>
  offsets.map(([dx, dy, w, h], i) => ({ src: asset(`shuffle/${prefix}-${i + 1}.png`), dx, dy, w, h }));

export const SHUFFLES = {
  ts1: frames("ts1", [[0, 0, 71.2, 71.2], [-0.47, -0.48, 77.94, 72.14], [-7.13, 0, 91.18, 96.28], [-0.67, 0, 72.31, 72.31], [0, 0, 71.2, 71.2], [0, 0, 71.2, 71.2]]),
  ts3: frames("ts3", [[0, 0, 71.2, 71.2], [0, 0, 73, 72.52], [0, 0, 71, 71], [0, 0, 71.2, 71.2], [0, 0, 71.2, 71.2], [0, 0, 73, 73]]),
  ps1: frames("ps1", [[0, 0, 87.44, 189.57], [0, 0, 87.44, 189.57], [-15.58, -11.12, 118.59, 220.72], [-15.58, -11.12, 118.82, 220.94], [-16.69, -11.12, 120.6, 221.83], [0, 0, 87.44, 189.57]]),
  ps3: frames("ps3", [[0, 0, 87.44, 189.57], [0, 0, 86.78, 187.79], [0, 0, 87.44, 189.57], [0, 0, 87.44, 189.57], [0, 0, 87.44, 189.57], [0, 0, 86.78, 187.79]]),
};

export function Shuffle({ frames: list, style, radius }: { frames: ShuffleFrame[]; style: CSSProperties; radius: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 500);
    return () => window.clearInterval(timer);
  }, [list.length]);

  return (
    <div className="absolute overflow-hidden" style={{ ...style, borderRadius: radius }}>
      {list.map((frame, i) => (
        <img
          alt=""
          className="absolute block max-w-none"
          key={frame.src}
          src={frame.src}
          style={{ left: frame.dx, top: frame.dy, width: frame.w, height: frame.h, visibility: i === index ? "visible" : "hidden" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "use case" (1044 x 597): three office scenarios. They slide like the design
// system preview (Neha's review; the prototype dissolved): swipe either way,
// click the card for the next one, or pick one with the dots.

const USE_CASE_COLORS = ["#2c83db", "#e5544d", "#90c94b"];

// "number changer up": the 2 in the shared-office 72 rolls up to 6 on a
// spring (mass 1, stiffness 17.3, damping 8) after 0.1s.
function springFrames(distance: number, duration = 2.103) {
  const stiffness = 17.3;
  const damping = 8;
  const frames: Keyframe[] = [];
  let x = 0;
  let v = 0;
  const steps = 60;
  const dt = duration / steps;
  for (let i = 0; i <= steps; i += 1) {
    frames.push({ translate: `0px ${(-distance * x).toFixed(2)}px`, offset: i / steps });
    for (let k = 0; k < 10; k += 1) {
      const a = stiffness * (1 - x) - damping * v;
      v += a * (dt / 10);
      x += v * (dt / 10);
    }
  }
  frames[frames.length - 1].translate = `0px ${-distance}px`;
  return frames;
}

function NumberRoller({ play }: { play: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!play || !strip.current) return;
    const animation = strip.current.animate(springFrames(584), { duration: 2103, delay: 100, fill: "both" });
    return () => animation.cancel();
  }, [play]);

  return (
    <div className="absolute top-[245px] left-[522px] h-[110px] w-[66px] overflow-hidden">
      <div className="absolute top-0 left-0 flex w-[55px] flex-col gap-[36px] bg-white" ref={strip}>
        {["2", "3", "4", "5", "6"].map((digit) => (
          <p
            className="h-[110px] w-[55px] text-center text-[88px] leading-[110px] text-transparent [-webkit-text-stroke:1px_black]"
            key={digit}
            style={{ fontFamily: "'Rethink Sans', sans-serif", fontWeight: 500 }}
          >
            {digit}
          </p>
        ))}
      </div>
    </div>
  );
}

// A carousel dot (48 x 8, 10px apart) with a taller, gap-filling hit area so
// it's easy to click.
function CarouselDot({ index, label, onSelect }: { index: number; label: string; onSelect: () => void }) {
  return (
    <button
      aria-label={label}
      className="absolute top-[-10px] h-[28px] w-[58px]"
      onClick={onSelect}
      style={{ left: 58 * index - 5 }}
      type="button"
    >
      <span className="absolute top-[10px] left-[5px] h-[8px] w-[48px] rounded-[22px] bg-black/20" />
    </button>
  );
}

const USE_CASE_STEP = 1044 + 45;

export function UseCase({ style }: { style: CSSProperties }) {
  const [index, setIndex] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>();
  const swipe = useSwipe((direction) => setIndex((i) => Math.min(2, Math.max(0, i + direction))));
  const slide = `1.25s ${SLOW}`;
  // Slides like the design system preview: the strip follows the drag (with
  // resistance past the first and last scenario), then settles.
  const pastEnd = (index === 0 && swipe.dragX > 0) || (index === 2 && swipe.dragX < 0);
  const offset = -USE_CASE_STEP * index + (pastEnd ? swipe.dragX * 0.3 : swipe.dragX);

  return (
    <div className="absolute h-[597px] w-[1044px]" ref={ref} style={style}>
      <button
        aria-label="Next use case"
        className="absolute top-0 left-0 h-[569px] w-[1044px] touch-pan-y overflow-hidden rounded-[20px] select-none"
        onClick={() => !swipe.wasDrag() && setIndex((i) => (i + 1) % 3)}
        type="button"
        {...swipe.handlers}
      >
        <div
          className="absolute top-0 left-0 flex h-[569px] gap-[45px]"
          style={{ translate: `${offset}px 0`, transition: swipe.dragging ? "none" : `translate ${slide}` }}
        >
          {[0, 1, 2].map((i) => (
            <div className="relative h-[569px] w-[1044px] shrink-0 overflow-hidden rounded-[20px]" key={i}>
              <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src={asset(`use-case-${i + 1}.jpg`)} />
              {i === 0 && <NumberRoller play={inView && index === 0} />}
            </div>
          ))}
        </div>
      </button>
      <div className="absolute top-[589px] left-[440px] h-[8px] w-[164px]">
        {[0, 1, 2].map((i) => (
          <CarouselDot index={i} key={i} label={`Use case ${i + 1}`} onSelect={() => setIndex(i)} />
        ))}
        <div
          className="pointer-events-none absolute top-0 h-[8px] w-[48px] rounded-[22px]"
          style={{ left: 58 * index, background: USE_CASE_COLORS[index], transition: `left ${slide}, background-color ${slide}` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "lo fis" (1044 x 394): hovering a sketch enlarges it (SMART_ANIMATE 1.25s
// slow) and leaving returns to the even layout.

type Box = [left: number, top: number, width: number, height: number, radius: number];
type LoFiPanel = { frame: Box; art: Box; black?: boolean };
type LoFiKey = "mobile" | "thermostat1" | "thermostat2";

const LOFI_LAYOUTS: Record<"base" | LoFiKey, Record<LoFiKey, LoFiPanel>> = {
  base: {
    mobile: { frame: [0, 0, 709.75, 394.4, 20], art: [0, 0, 709.75, 394.4, 20] },
    thermostat1: { frame: [710, 0, 333, 197, 20], art: [18.79, 0, 314.49, 190.76, 20] },
    thermostat2: { frame: [710, 197, 334, 197, 20], art: [18.65, 7.04, 315.35, 190.76, 20] },
  },
  mobile: {
    mobile: { frame: [0, 0, 769, 394, 20], art: [0, -18, 772, 429, 20] },
    thermostat1: { frame: [769, 0, 274, 197, 20], art: [16, 0.4, 314.71, 190.76, 20], black: true },
    thermostat2: { frame: [769, 197, 275, 197, 20], art: [16, 7.4, 314.71, 190.76, 20], black: true },
  },
  thermostat1: {
    mobile: { frame: [0, 0, 616, 394, 20], art: [-115, 0, 709.75, 394.4, 20], black: true },
    thermostat1: { frame: [616.14, 0, 427, 259, 27.16], art: [0, 0, 427.15, 258.91, 27.16] },
    thermostat2: { frame: [616, 259, 428, 135, 20], art: [0, 17, 428, 274, 20], black: true },
  },
  thermostat2: {
    mobile: { frame: [0, 0, 616, 394, 20], art: [-115, 0, 709.75, 394.4, 20], black: true },
    thermostat1: { frame: [616, 0, 427, 135, 27.16], art: [0, -144, 427.15, 258.91, 27.16], black: true },
    thermostat2: { frame: [616, 135, 428, 259, 20], art: [0, 0, 428, 259, 20] },
  },
};

const LOFI_ART: Record<LoFiKey, string> = {
  mobile: asset("lofi/mobile.jpg"),
  thermostat1: asset("lofi/thermostat-1.jpg"),
  thermostat2: asset("lofi/thermostat-2.jpg"),
};

const boxStyle = ([left, top, width, height, radius]: Box): CSSProperties => ({ left, top, width, height, borderRadius: radius });
const LOFI_TRANSITION = ["left", "top", "width", "height", "border-radius"].map((p) => `${p} 1.25s ${SLOW}`).join(", ");

export function LoFis({ style }: { style: CSSProperties }) {
  const [hovered, setHovered] = useState<LoFiKey | null>(null);
  const layout = LOFI_LAYOUTS[hovered ?? "base"];

  return (
    <div className="absolute h-[394.4px] w-[1044px]" style={style}>
      {(Object.keys(LOFI_ART) as LoFiKey[]).map((key) => {
        const panel = layout[key];
        return (
          <div
            className="absolute overflow-hidden"
            key={key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            style={{ ...boxStyle(panel.frame), transition: LOFI_TRANSITION }}
          >
            <div
              className="absolute overflow-hidden"
              style={{ ...boxStyle(panel.art), background: panel.black ? "#000" : undefined, transition: `${LOFI_TRANSITION}, background-color 1.25s ${SLOW}` }}
            >
              <img
                alt=""
                className={`absolute top-0 left-0 block w-full max-w-none ${key === "mobile" ? "h-full" : "h-auto"}`}
                src={LOFI_ART[key]}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// "design system preview" (896 x 633): component sheet and type/colour sheet;
// the second dot slides to the type/colour sheet (SMART_ANIMATE 1.25s slow).
// The sheets can also be swiped, following the finger while dragged.

export function DesignSystemPreview({ style }: { style: CSSProperties }) {
  const [page, setPage] = useState(0);
  const swipe = useSwipe((direction) => setPage((p) => Math.min(1, Math.max(0, p + direction))));
  const slide = `1.25s ${SLOW}`;
  // Resist dragging past the first or last sheet.
  const pastEnd = (page === 0 && swipe.dragX > 0) || (page === 1 && swipe.dragX < 0);
  const offset = -941 * page + (pastEnd ? swipe.dragX * 0.3 : swipe.dragX);

  return (
    <div className="absolute h-[633px] w-[896px]" style={style}>
      <div className="absolute top-0 left-0 h-[605px] w-[896px] touch-pan-y overflow-hidden select-none" {...swipe.handlers}>
        <div
          className="absolute top-0 left-0 flex h-[605px] gap-[45px]"
          style={{ translate: `${offset}px 0`, transition: swipe.dragging ? "none" : `translate ${slide}` }}
        >
          {[1, 2].map((n) => (
            <img
              alt=""
              className="block h-[605px] w-[896px] max-w-none rounded-[20px]"
              draggable={false}
              key={n}
              src={asset(`system-${n}.jpg`)}
            />
          ))}
        </div>
      </div>
      <div className="absolute top-[625px] left-[395px] h-[8px] w-[106px]">
        {[0, 1].map((i) => (
          <CarouselDot index={i} key={i} label={i ? "Type and colour" : "Components"} onSelect={() => setPage(i)} />
        ))}
        <div
          className="pointer-events-none absolute top-0 h-[8px] w-[48px] rounded-[22px]"
          style={{ left: 58 * page, background: page ? "#ff5c6c" : "#0278ff", transition: `left ${slide}, background-color ${slide}` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "next proj" (1305.6 x 288): the next brief, with its CD. On hover the disc
// slides out of the case to the left and turns (SMART_ANIMATE 1.25s slow).

export function NextProject({ study, style }: { study: CaseStudy; style: CSSProperties }) {
  const navigate = useNavigate();
  const ease = `1.25s ${SLOW}`;

  return (
    <button
      aria-label={`Next project: ${study.brief.title}`}
      className="group absolute h-[288px] w-[1305.6px] text-left"
      onClick={() => navigate(`/brief/${study.slug}`)}
      style={style}
      type="button"
    >
      <p className="nm absolute top-0 left-0 w-[126px] text-[21px] leading-normal whitespace-nowrap text-black">Next Project</p>
      <span className="absolute top-[7.5px] left-[150px] h-px w-[88px] bg-black" />
      <p className="nm absolute top-0 left-[262px] h-[30.8px] w-[560px] text-[21px] leading-normal text-black">{study.brief.title}</p>
      <p className="nm absolute top-[38.8px] left-[262px] w-[560px] text-[35px] leading-[1.32] tracking-[-0.7px] text-black">{study.brief.headline}</p>
      <div className="absolute top-0 left-[982px] h-[287.9px] w-[323.6px]">
        <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src="/assets/home/shelf-case.png" />
        <Disc
          className="absolute top-[10.4px] left-[35.8px] size-[265.9px] group-hover:left-[-58px] group-hover:-rotate-90"
          disc={study.shelfDisc}
          style={{ transition: `left ${ease}, rotate ${ease}` }}
        />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Final-product videos. In Figma each is a VIDEO fill cropped into a phone mask
// or a thermostat's round screen (the rest of the device is still, so the page
// render already has it). `crop` is the fill's videoTransform: the part of the
// video, as fractions [x, y, width, height], that fills `box`; `clip` is the
// visible area (mask or rounded frame) in the same frame coordinates.

export type FinalVideo = {
  src: string;
  box: [x: number, y: number, w: number, h: number];
  crop: [x: number, y: number, w: number, h: number];
  clip: [x: number, y: number, w: number, h: number, radius: number];
};

export function CroppedVideo({ video, top }: { video: FinalVideo; top: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [x, y, w, h] = video.box;
  const [cx, cy, cw, ch] = video.crop;
  const [left, clipTop, width, height, radius] = video.clip;
  const videoWidth = w / cw;
  const videoHeight = h / ch;

  // Only play while on screen.
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

  return (
    <div className="absolute overflow-hidden" style={{ left, top: top + clipTop - y, width, height, borderRadius: radius }}>
      <video
        className="absolute block max-w-none object-fill"
        loop
        muted
        playsInline
        preload="metadata"
        ref={ref}
        src={video.src}
        style={{ left: x - left - cx * videoWidth, top: y - clipTop - cy * videoHeight, width: videoWidth, height: videoHeight }}
      />
    </div>
  );
}

const video = (name: string) => asset(`videos/${name}.mp4`);
const PHONE_RADIUS = 38;

export const FINAL_VIDEOS: FinalVideo[] = [
  {
    src: video("request-temp-phone"),
    box: [720, 13995, 279, 506],
    crop: [0.31025, 0.10881, 0.38247, 0.7677],
    clip: [734, 13996, 246, 505, PHONE_RADIUS],
  },
  {
    src: video("locked-therm"),
    box: [1098, 14591, 306, 306],
    crop: [0.13384, 0.14054, 0.70031, 0.6838],
    clip: [1098, 14591, 306, 306, 153],
  },
  {
    src: video("conference-therm"),
    box: [387, 14892, 307, 306],
    crop: [0.14684, 0.1414, 0.70127, 0.68257],
    clip: [387, 14892, 307, 306, 153],
  },
  {
    src: video("conference-pref-phone"),
    box: [720, 15294, 249, 505],
    crop: [0.23447, 0.05342, 0.499, 0.89315],
    clip: [722, 15293, 247, 505, PHONE_RADIUS],
  },
  {
    src: video("eco-friendly-therm"),
    box: [1101, 15872, 307, 306],
    crop: [0.1038, 0.07224, 0.76962, 0.80755],
    clip: [1101, 15872, 307, 306, 153],
  },
  {
    src: video("pref-leaderboard"),
    box: [682, 16269, 247, 505],
    crop: [0.24161, 0.03915, 0.5042, 0.91111],
    clip: [682, 16269, 246, 505, PHONE_RADIUS],
  },
];
