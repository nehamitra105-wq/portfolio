import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Disc from "../components/Disc";
import CurrentlyPlaying from "../components/home/CurrentlyPlaying";
import { Card, REFERRALS } from "../components/home/Referrals";
import { BRAND_LINKS, BrandRecord, type Brand } from "../components/home/WorkSections";
import { CASE_STUDIES, type CaseStudy } from "../site/caseStudies";
import { EMAIL, LINKEDIN_URL, RESUME_URL, scrollToElement } from "../site/navigation";

// "mobile" (2174:9422): the home page at 402 wide, scaled to the phone's width.
const WIDTH = 402;
const HEIGHT = 6142;

// --- The CD cases ("swips", 1942:140384) ------------------------------------
// A case is 383 x 340.5 with its disc (315.5) in the tray near the top. The nest
// case stays put on screen while you scroll through four states, each played
// in full once the scroll crosses into it: the other cases come out from
// behind it into a stack ("normal") and fan out round it as its disc rises to
// show the description ("nest swipe"); then the fan turns to Reforma
// ("reforma swipe"), Milune and Ribbon. After Ribbon the page scrolls on to
// what's below. A swipe moves one state either way.
const CASE = { width: 383, height: 340.5 };
// The disc sits in the case's tray, which is a little right of the case's
// middle (same place as the desktop shelf: 52 / 467 across, 15 / 415 down).
const DISC = { left: 43, top: 12.5, size: 315.5 };
// The description and tags, centred under the disc.
const DESC_WIDTH = 212;
const START = { x: 201.5, y: 553.92 }; // nest case centre under the title
const END = { x: 201, y: 1274.25 }; // its centre in the swipe area
const TRAVEL = END.y - START.y;
// Opening plays the stack, then the fan.
const STACK_PART = 0.45;
// Every state change plays like the desktop hero landing: 1.4s, easing in
// and out.
const MOVE_MS = 1400;
// The nest disc turns like the desktop hero CD (12s a turn) until the first
// scroll, then winds back to upright as the cases come out.
const SPIN_DEGREES_PER_MS = 360 / 12000;
// The three turns of the fan; the scroll held for them all is shared evenly
// between the four states. A state starts as soon as the scroll crosses
// into it.
const TURNS = 3;
const STEP = 500;
const SHUFFLE = STEP * TURNS;

// The button sits this far below the middle case's centre.
const BUTTON_BELOW = 1514 - END.y;
// The button's middle across (the design's "view" button at 113, 184.75 wide).
const BUTTON_MIDDLE = 113 + 184.75 / 2;
// From the middle case's centre to the middle of everything shown when it's
// open (the raised disc's top down to the button's bottom).
const GROUP_MIDDLE = (BUTTON_BELOW + 40 - (CASE.height / 2 - DISC.top + 114)) / 2;
// The middle disc rises this far out of its case.
const RISE = 114;
// Around the fan, by place from the middle case: x, y (from the middle case's
// centre) and turn. Read off the "nest swipe" and "reforma swipe" variants.
const FAN: Record<number, [number, number, number]> = {
  [-3]: [-630, 300, -45],
  [-2]: [-501, 179, -32.5],
  [-1]: [-366, 75, -17],
  0: [0, 0, 0],
  1: [369, 67, 15],
  2: [511, 153, 35],
  3: [640, 260, 50],
};
// "normal": the stack behind the nest case, nearest first.
const STACK: Record<string, [number, number, number]> = {
  nest: [0, 0, 0],
  ribbon: [-96, 26.8, -8.5],
  reforma: [-214.9, 69.6, -17],
  milune: [-295.4, 120.7, -30],
};
// Round the fan: swiping left brings the next one in from the right.
const ORDER = ["nest", "ribbon", "milune", "reforma"].map((slug) => CASE_STUDIES.find((study) => study.slug === slug)!);
const SLOW = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);


const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function fanAt(k: number): [number, number, number] {
  const lo = Math.max(-3, Math.min(2, Math.floor(k)));
  const t = clamp01(k - lo);
  const a = FAN[lo];
  const b = FAN[lo + 1];
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

// Where each case sits in the fan, -2 up to (not including) 2.
const wrap = (k: number) => ((((k + 2) % 4) + 4) % 4) - 2;

// The page's scale; a hidden window can report no width, so never zero.
const currentZoom = () => (document.documentElement.clientWidth || WIDTH) / WIDTH;

export function useZoom() {
  const [zoom, setZoom] = useState(currentZoom);
  useEffect(() => {
    const update = () => setZoom(currentZoom());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return zoom;
}

function CdCase({
  study,
  style,
  rise,
  spin = 0,
  onClick,
}: {
  study: CaseStudy;
  style: CSSProperties;
  rise: number;
  spin?: number;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={study.brief.title}
      className="absolute"
      onClick={onClick}
      style={{ ...style, width: CASE.width, height: CASE.height, touchAction: "pan-y" }}
      type="button"
    >
      <img alt="" className="absolute inset-0 block size-full max-w-none" draggable={false} src="/assets/home/shelf-case.png" />
      {/* "<name> desc", behind the disc until it rises */}
      <div
        className="absolute top-[227px] flex flex-col items-center gap-[10px] text-black"
        style={{ left: DISC.left + DISC.size / 2 - DESC_WIDTH / 2, width: DESC_WIDTH, opacity: rise / RISE }}
      >
        <p className="nm w-full text-center text-[12px] leading-[1.32] tracking-[-0.24px]">{study.description}</p>
        <div className="flex items-center gap-[10px]">
          {study.shelfTags.map((tag) => (
            <span
              className="nm flex h-[24px] items-center rounded-[24px] border-[0.4px] border-solid border-black px-[10px] text-[12px] leading-[1.32] tracking-[-0.24px] whitespace-nowrap"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Disc
        className="absolute"
        disc={study.shelfDisc}
        style={{ left: DISC.left, top: DISC.top - rise, width: DISC.size, height: DISC.size, rotate: `${spin}deg` }}
      />
    </button>
  );
}

// The states: 0 closed under the title, 1 nest out, then 2-4 with the fan
// turned to Reforma, Milune and Ribbon. Like the desktop hero landing, one
// scroll or swipe plays a whole state: the page scrolls to the state's place
// on the same curve and time as the cases move, and nothing else is taken in
// until it's done. Past Ribbon the page scrolls normally.
const LAST = TURNS + 1;
const STATE_SCROLL = [0, TRAVEL, TRAVEL + STEP, TRAVEL + 2 * STEP, TRAVEL + 3 * STEP];
const nearestState = (scroll: number) =>
  STATE_SCROLL.reduce((best, y, i) => (Math.abs(y - scroll) < Math.abs(STATE_SCROLL[best] - scroll) ? i : best), 0);

// A scroll or swipe this long (screen px) moves one state.
const GESTURE = 24;

// Eases the shown state towards the target over a fixed time, so a state
// always plays through in full.
function useStateTween(target: number) {
  const [shown, setShown] = useState({ open: target > 0 ? 1 : 0, turn: target > 1 ? 1 - target : 0 });
  const shownRef = useRef(shown);
  useEffect(() => {
    const from = shownRef.current;
    const goal = { open: target > 0 ? 1 : 0, turn: target > 1 ? 1 - target : 0 };
    // Turn the short way round (Ribbon back to nest is one step).
    goal.turn += 4 * Math.round((from.turn - goal.turn) / 4);
    if (from.open === goal.open && from.turn === goal.turn) return;
    const started = performance.now();
    let frame = 0;
    const step = () => {
      const t = clamp01((performance.now() - started) / MOVE_MS);
      const eased = easeInOut(t);
      const next = { open: mix(from.open, goal.open, eased), turn: mix(from.turn, goal.turn, eased) };
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return shown;
}

// On a phone shorter than the design (874), the gaps above the title and
// between the tagline and the case close up so the whole case is on the first
// screen: the title gap gives up to 94, the case gap up to 34. Worked out
// once from the first screen, so it doesn't jump as Safari's bars hide.
const FIRST_SCREEN_NEEDS = 383.67 + 340.5 + 24;
function landingLift() {
  const short = Math.max(0, FIRST_SCREEN_NEEDS - window.innerHeight / currentZoom());
  const title = Math.min(short, 94);
  return { title, cases: title + Math.min(short - title, 34) };
}

// Where the open fan's middle case sits on screen: centred in the first
// screen's height (fixed, so it doesn't jump as Safari's bars hide).
const openCenter = () => window.innerHeight / currentZoom() / 2 - GROUP_MIDDLE;
// The record starts 40 below the button once the fan has let go, so
// everything below moves down by this much from the design.
const belowOffset = (center: number) => TRAVEL + SHUFFLE + center + BUTTON_BELOW + 40 + 40 - 1849;

// Degrees turned since the page opened, ticking while `running`.
function useSpin(running: boolean) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (!running) return;
    const started = performance.now() - angle / SPIN_DEGREES_PER_MS;
    let frame = 0;
    const tick = () => {
      setAngle((performance.now() - started) * SPIN_DEGREES_PER_MS);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Picks up from the current angle each time it starts again.
  }, [running]);
  return angle;
}

// The stage is held in place with position: sticky for the whole run of
// states, so the browser keeps it still while the page scrolls under it.
const STAGE_HEIGHT = 1200;

function CaseStack({ state, onGo, lift, openAt }: { state: number; onGo: (state: number) => void; lift: number; openAt: number }) {
  const navigate = useNavigate();
  const { open, turn } = useStateTween(state);
  const spin = useSpin(open < 1);
  // Wound back to upright over the stack, the shortest way round.
  const spinAngle = ((((spin % 360) + 540) % 360) - 180) * (1 - clamp01(open / STACK_PART));
  const stack = clamp01(open / STACK_PART);
  const fan = clamp01((open - STACK_PART) / (1 - STACK_PART));
  // Closed, the case sits under the title; opening, it glides to the middle
  // of the window so the raised disc, description and button all fit.
  const center = { x: END.x, y: mix(START.y - lift, openAt, open) };
  const ready = fan > 0.98;

  const active = ORDER[((Math.round(turn) % 4) + 4) % 4];

  // Each case, plus a second copy where the fan wraps round, so a case leaving
  // one side is already coming in on the other.
  const placed: { study: CaseStudy; i: number; k: number; copy: boolean }[] = [];
  ORDER.forEach((study, i) => {
    const k = wrap(i - turn);
    placed.push({ study, i, k, copy: false });
    for (const other of [k + 4, k - 4]) if (Math.abs(other) < 3) placed.push({ study, i, k: other, copy: true });
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: TRAVEL + SHUFFLE + STAGE_HEIGHT }}>
      <div className="sticky top-0" style={{ height: STAGE_HEIGHT }}>
        {placed
          .filter(({ k, copy }) => !copy || fan > 0)
          .map(({ study, i, k, copy }) => {
            const [sx, sy, sr] = STACK[study.slug];
            const [fx, fy, fr] = fanAt(k);
            const x = mix(sx * stack, fx, fan);
            const y = mix(sy * stack, fy, fan);
            const r = mix(sr * stack, fr, fan);
            const away = Math.abs(k);
            const fade = fan > 0 ? clamp01(3 - away) : 1;
            const order = fan > 0.5 ? 100 - Math.round(away * 10) : 100 - i * 10;
            return (
              <CdCase
                key={`${study.slug}-${copy ? "copy" : "main"}`}
                onClick={() => {
                  if (!ready) return;
                  const offset = Math.round(k);
                  // Cases on the left come next, on the right went before.
                  if (offset !== 0) onGo(Math.max(1, Math.min(LAST, state - offset)));
                  else if (study.caseStudyPath) navigate(study.caseStudyPath);
                }}
                rise={copy ? 0 : RISE * fan * clamp01(1 - away)}
                spin={study.slug === "nest" && !copy ? spinAngle : 0}
                study={study}
                style={{
                  left: center.x - CASE.width / 2,
                  top: center.y - CASE.height / 2,
                  transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
                  opacity: fade,
                  zIndex: order,
                  pointerEvents: ready ? "auto" : "none",
                }}
              />
            );
          })}

      {/* "view case study button" (2180:27351), for whichever case is in the
          middle: "view" (black, View Case Study and an arrow) when its case
          study is open, "locked" (white, In progress! and a lock) when not.
          Both are centred on the same line. */}
      {active.caseStudyPath ? (
        <button
          className="nm absolute flex h-[40px] w-[184.75px] items-center justify-center gap-[13px] rounded-[40px] bg-black text-[16px] leading-[1.32] tracking-[-0.32px] text-white antialiased"
          onClick={() => active.caseStudyPath && navigate(active.caseStudyPath)}
          style={{ left: BUTTON_MIDDLE - 184.75 / 2, top: center.y + BUTTON_BELOW, opacity: fan, pointerEvents: fan > 0.9 ? "auto" : "none", zIndex: 101 }}
          type="button"
        >
          View Case Study
          <svg fill="none" height={12} viewBox="0 0 14 12" width={14}>
            <path d="M0.75 6H13M8 1L13 6L8 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
          </svg>
        </button>
      ) : (
        <div
          aria-label={`${active.brief.title}: case study in progress`}
          className="nm absolute flex h-[40px] w-[150.15px] items-center gap-[10px] rounded-[40px] border-[0.4px] border-solid border-black bg-white pl-[24.375px] text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-nowrap text-black antialiased"
          style={{ left: BUTTON_MIDDLE - 150.15 / 2, top: center.y + BUTTON_BELOW, opacity: fan, zIndex: 101 }}
        >
          In progress!
          <svg className="shrink-0" fill="none" height={14.4} viewBox="-1 -0.5 12.25 12.25" width={14.4}>
            <path
              d="M1.625 5.125H8.625C9.17729 5.125 9.625 5.57272 9.625 6.125V9.625C9.625 10.1773 9.17729 10.625 8.625 10.625H1.625C1.07272 10.625 0.625 10.1773 0.625 9.625V6.125C0.625 5.57272 1.07272 5.125 1.625 5.125Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.1}
            />
            <path
              d="M2.625 5.125V3.125C2.625 2.46196 2.88839 1.82607 3.35723 1.35723C3.82607 0.888392 4.46196 0.625 5.125 0.625C5.78804 0.625 6.42393 0.888392 6.89277 1.35723C7.36161 1.82607 7.625 2.46196 7.625 3.125V5.125"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.1}
            />
          </svg>
        </div>
      )}
      </div>
    </div>
  );
}

// Fades its content in from nothing and up 40px over 1.25s on the desktop
// "fade-up" curve, on load or once it comes into the window. The fade is
// stepped frame by frame here rather than left to a CSS animation, which
// iPhone Safari can skip inside the page's zoom (the content then just pops
// in when the animation ends). It checks where it is on every scroll, so it
// starts as soon as it's on screen.
const FADE_MS = 1250;
const FADE_RISE = 40;
// Close to cubic-bezier(0.22, 1, 0.36, 1): quick to start, long settle.
const fadeCurve = (t: number) => 1 - (1 - t) ** 4;

export function FadeUp({ children, delay = 0, onLoad = false }: { children: ReactNode; delay?: number; onLoad?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let started = false;
    const set = (t: number) => {
      element.style.opacity = String(t);
      element.style.transform = t >= 1 ? "" : `translateY(${(1 - t) * FADE_RISE}px)`;
    };
    set(0);
    const play = () => {
      started = true;
      const begin = performance.now() + delay;
      const step = () => {
        const t = clamp01((performance.now() - begin) / FADE_MS);
        set(fadeCurve(t));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const check = () => {
      if (started) return;
      const target = element.firstElementChild ?? element;
      const { top, bottom } = target.getBoundingClientRect();
      if (top < window.innerHeight * 0.92 && bottom > 0) {
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
        play();
      }
    };
    if (onLoad) play();
    else {
      check();
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [delay, onLoad]);

  return <div ref={ref}>{children}</div>;
}

// --- Sections ---------------------------------------------------------------

const sectionTitle = "nm absolute top-0 left-0 text-[32px] leading-[1.32] tracking-[-0.64px] text-black";

function Row({ top, org, lines, dates }: { top: number; org: string; lines: [number, string][]; dates: string }) {
  return (
    <div className="absolute left-0 w-[354px] text-black" style={{ top }}>
      <p className="nm-medium absolute top-0 left-0 text-[20px] leading-[1.32] tracking-[-0.4px] whitespace-nowrap">{org}</p>
      {lines.map(([lineTop, text]) => (
        <p className="nm absolute left-0 text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-pre" key={text} style={{ top: lineTop }}>
          {`/   ${text}`}
        </p>
      ))}
      <p className="nm absolute top-0 right-0 text-right text-[16px] leading-[26px] tracking-[-0.32px] whitespace-nowrap">{dates}</p>
    </div>
  );
}

function Work() {
  const navigate = useNavigate();
  const records: [Brand, number][] = [
    ["adobe", 0],
    ["kohler", 94.65],
    ["finra", 189.31],
    ["reforma", 283.96],
  ];
  return (
    <section className="absolute top-[2702px] left-[24px] h-[519px] w-[354px]">
      <p className={sectionTitle}>WORK</p>
      {records.map(([brand, left]) => (
        <button
          aria-label={`See ${brand} work`}
          className="absolute top-[78px] size-[70.04px]"
          key={brand}
          onClick={() => {
            const link = BRAND_LINKS[brand];
            if (link) navigate(link);
          }}
          style={{ left }}
          type="button"
        >
          {/* The desktop record (83.456) scaled down to 70.04. */}
          <div className="relative size-[83.456px] origin-top-left" style={{ zoom: 70.04 / 83.456 }}>
            <BrandRecord brand={brand} />
          </div>
        </button>
      ))}
      <Row dates="June - Sept 2026" lines={[[33, "Experience Design Intern"]]} org="Adobe" top={184.04} />
      <Row dates="March - May 2026" lines={[[35, "UX Designer"]]} org="Kohler x SCADpro" top={279.04} />
      <Row dates="Jan - March 2026" lines={[[35, "UX Design Lead"]]} org="FINRA x SCADpro" top={371.04} />
      <Row dates="Jun- Dec 2025" lines={[[35, "UX Design Intern"]]} org="Reforma AI" top={463.04} />
    </section>
  );
}

function Education() {
  return (
    <section className="absolute top-[3301px] left-[24px] h-[264px] w-[354px]">
      <p className={sectionTitle}>EDUCATION</p>
      <Row
        dates="June 2027"
        lines={[
          [33, "BFA in User Experience Design"],
          [68, "Minor in Graphic Design"],
        ]}
        org="SCAD"
        top={78}
      />
      <Row dates="May 2024" lines={[[35, "BFA in Graphic Arts"]]} org="University of South Florida" top={208} />
    </section>
  );
}

function Involvement() {
  return (
    <section className="absolute top-[3645px] left-[24px] h-[229px] w-[354px]">
      <p className={sectionTitle}>INVOLVEMENT</p>
      <Row dates="Aug 2025 - Present" lines={[[33, "Figma Campus Leader"]]} org="Figma" top={78} />
      <Row dates="March 2025 - Present" lines={[[35, "Podcast Officer"]]} org="Future Leaders of UX" top={173} />
    </section>
  );
}

// "A little bit about me" with its objects around it. Objects that run off the
// frame are cut at its edge, like the design.
function AboutMe() {
  const M = "/assets/mobile";
  const objects: [string, number, number, number, number][] = [
    ["keychain", 0, 3889.9, 286.5, 300.5],
    ["adobe-badge", 137.5, 4095.7, 62.5, 62.5],
    ["flux-badge", 319, 4431.4, 83, 115.3],
    ["airpods", 279.5, 4573.6, 122.5, 263],
    ["rings", 277, 4090.5, 125, 232.5],
    ["glasses", 0, 4496.2, 265, 389],
  ];
  return (
    <>
      <div aria-hidden className="absolute" id="about" style={{ top: 4036, left: 0 }} />
      {objects.map(([name, left, top, width, height]) => (
        <FadeUp key={name}>
          <img alt="" className="pointer-events-none absolute block max-w-none" src={`${M}/${name}.webp`} style={{ left, top, width, height }} />
        </FadeUp>
      ))}
      <FadeUp>
      <p className="nm absolute top-[4266px] left-[36px] w-[354px] text-[28px] leading-[1.32] tracking-[-0.56px] text-black">A little bit about me</p>
      <p className="nm absolute top-[4325px] left-[36px] w-[330px] text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-pre-wrap text-black">
        {`I’m an intentional, curious, and playful product designer with a background in graphic design. I’m a sucker for trying new ways to express the numerous ideas I have in my head, I ask a lot of questions and I love using motion graphics to bring things to life. I like to write books on the side, so there’s a huge storytelling element to a lot of my work. `}
        <br aria-hidden />
        <br aria-hidden />
        When I’m not hunched over my computer, I’m probably getting my butt kicked in a pilates class, making new jewelry stacks, doodling in my Figma files, and hearing colors in music (audio-visual synesthesia :D)!
      </p>
      </FadeUp>
      {/* photo card */}
      <FadeUp>
        <img alt="Neha" className="pointer-events-none absolute block max-w-none" src={`${M}/photo-card.webp`} style={{ left: 0, top: 4051, width: 142, height: 196.04 }} />
      </FadeUp>
      <FadeUp>
        <CurrentlyPlaying className="absolute top-[4863.42px] left-[24px]" />
      </FadeUp>
    </>
  );
}

// "referral section": the cards crawl left on their own, like the desktop.
const CARD_STEP = 307 + 32;
const LOOP_WIDTH = REFERRALS.length * CARD_STEP;
function Referrals() {
  return (
    <section className="absolute top-[5068px] left-0 h-[467px] w-[402px]">
      <p className="nm absolute top-0 left-[24px] text-[32px] leading-[1.32] tracking-[-0.64px] whitespace-nowrap text-black">Don’t take my word for it!</p>
      <p className="nm absolute top-[42px] left-[24px] text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-nowrap text-black">(See what others have to say)</p>
      <div className="absolute top-[99px] left-0 h-[368px] w-[402px] overflow-clip">
        <div className="absolute top-0 left-0 flex gap-[32px]" style={{ animation: "mobile-referrals-crawl 70s linear infinite" }}>
          {[...REFERRALS, ...REFERRALS].map((referral, index) => (
            <Card key={index} {...referral} />
          ))}
        </div>
      </div>
      <style>{`@keyframes mobile-referrals-crawl { from { transform: translateX(-291px); } to { transform: translateX(${-291 - LOOP_WIDTH}px); } }`}</style>
    </section>
  );
}

function ArrowUpRight() {
  return (
    <svg className="shrink-0" fill="none" height={11} viewBox="0 0 11 11" width={11}>
      <path d="M0.75 10.25L10.25 0.75M3 0.75H10.25V8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} />
    </svg>
  );
}

function Pill({ href, top, children }: { href: string; top: number; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      className="nm absolute left-[134px] flex h-[44px] w-[134px] items-center justify-center gap-[10px] rounded-[40px] border border-solid border-black text-[16px] leading-[1.32] tracking-[-0.32px] text-black"
      href={href}
      rel={external ? "noreferrer" : undefined}
      style={{ top }}
      target={external ? "_blank" : undefined}
    >
      {children}
      <ArrowUpRight />
    </a>
  );
}

// The mobile footer, also used under the nest case study (`top` is where it
// starts on that page; About Me there goes to home's About Me).
export function Footer({
  onHome,
  onWork,
  onAbout = () => toSection("about"),
  top = 5615,
}: {
  onHome: () => void;
  onWork: () => void;
  onAbout?: () => void;
  top?: number;
}) {
  const link = "nm absolute left-[134px] h-[44px] w-[134px] text-center text-[16px] leading-[44px] tracking-[-0.32px] text-black";
  return (
    <footer className="absolute left-0 h-[518px] w-[402px]" id="contact" style={{ top }}>
      <button className={link} onClick={onHome} style={{ top: 0 }} type="button">
        Home
      </button>
      <button className={link} onClick={onWork} style={{ top: 76 }} type="button">
        Work
      </button>
      <button className={link} onClick={onAbout} style={{ top: 152 }} type="button">
        About Me
      </button>
      <Pill href={`mailto:${EMAIL}`} top={228}>
        Email
      </Pill>
      <Pill href={LINKEDIN_URL} top={304}>
        Linkedin
      </Pill>
      <Pill href={RESUME_URL} top={380}>
        Resume
      </Pill>
      {/* "footer graphic": the name runs off the bottom. */}
      <div className="absolute top-[460px] left-0 h-[58px] w-[402px] overflow-hidden">
        <div className="absolute top-0 left-[34.06px] h-[67.24px] w-[371.94px]">
          <div className="absolute inset-[-3.27%_-0.59%]">
            <img alt="neha mitra" className="block size-full max-w-none" src="/assets/shared/footer-name.svg" />
          </div>
        </div>
        {[
          { name: "mehl", top: 26, size: 6.02, opacity: 0.2 },
          { name: "nagha", top: 35.45, size: 7.22, opacity: 0.4 },
          { name: "naeha", top: 46.84, size: 8.43, opacity: 0.7 },
        ].map(({ name, top, size, opacity }) => (
          <p className="nm absolute left-[5.31px] leading-[1.32] text-black" key={name} style={{ top, fontSize: size, letterSpacing: -size * 0.02, opacity }}>
            {name}
          </p>
        ))}
        {[
          { top: 30.76, width: 18.46, src: "footer-line-1" },
          { top: 40.29, width: 24.12, src: "footer-line-2" },
          { top: 53.28, width: 28.28, src: "footer-line-3" },
        ].map(({ top, width, src }) => (
          <div className="absolute left-[3px] h-0" key={src} style={{ top, width }}>
            <div className="absolute inset-[-0.45px_0_0_0]">
              <img alt="" className="block size-full max-w-none" src={`/assets/shared/${src}.svg`} />
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

// A shelf: "shelf 2 top shadow" (88) down to the white ledge (36), then
// "shelf 2 bottom shadow" (144) fading out below it. `ledge` is the ledge's top.
function Shelf({ ledge }: { ledge: number }) {
  return (
    <>
      <div className="absolute left-[-2px] h-[88px] w-[404px]" style={{ top: ledge - 88, background: "linear-gradient(to bottom, #fff, rgb(236, 236, 236))" }} />
      <div className="absolute left-[-2px] h-[36px] w-[404px] bg-white" style={{ top: ledge }} />
      <div className="absolute left-[-2px] h-[144px] w-[404px]" style={{ top: ledge + 34, background: "linear-gradient(to top, #fff, rgb(236, 236, 236))" }} />
    </>
  );
}

// Glides to a section, slowly and easing in and out.
function toSection(id: string) {
  const element = document.getElementById(id);
  if (element) scrollToElement(element);
}

// Holds the CD states and plays one per gesture (see LAST above).
function useCaseStates(zoom: number) {
  const [state, setState] = useState(() => nearestState(window.scrollY / zoom));
  const stateRef = useRef(state);
  const busy = useRef(false);
  const frame = useRef(0);

  const go = (target: number) => {
    const to = Math.min(LAST, Math.max(0, target));
    const from = stateRef.current;
    if (busy.current || to === from) return;
    busy.current = true;
    stateRef.current = to;
    setState(to);
    // Scroll there on the same curve and time as the cases.
    const startY = window.scrollY;
    const endY = STATE_SCROLL[to] * currentZoom();
    const started = performance.now();
    cancelAnimationFrame(frame.current);
    const step = () => {
      const t = clamp01((performance.now() - started) / MOVE_MS);
      window.scrollTo(0, mix(startY, endY, easeInOut(t)));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else busy.current = false;
    };
    frame.current = requestAnimationFrame(step);
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const zoomNow = () => currentZoom();
    // In the CD area: anywhere up to Ribbon's place.
    const inStage = () => window.scrollY / zoomNow() <= STATE_SCROLL[LAST] + 2;
    // Leaving downwards from Ribbon is ordinary scrolling.
    const leaving = (down: boolean) => stateRef.current === LAST && down;
    // A touch moves one state as soon as it's gone far enough, once.
    let touch: { x: number; y: number; stage: boolean; used: boolean } | null = null;
    // A wheel gesture moves one state; the rest of its glide is ignored, but
    // a fresh push (a gap, or the wheel speeding up again) is a new gesture.
    let wheelUsed = false;
    let lastWheel = { at: 0, size: 0 };

    const onTouchStart = (event: TouchEvent) => {
      const t = event.touches[0];
      touch = { x: t.clientX, y: t.clientY, stage: inStage(), used: false };
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!touch) return;
      const t = event.touches[0];
      const dx = t.clientX - touch.x;
      const dy = touch.y - t.clientY;
      if (!touch.stage || (leaving(dy > 0) && Math.abs(dy) >= Math.abs(dx))) {
        if (busy.current) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (touch.used) return;
      // A swipe made while a state is still playing is spent on nothing.
      if (busy.current) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) > GESTURE) touch.used = true;
        return;
      }
      if (Math.abs(dy) >= Math.abs(dx) && Math.abs(dy) > GESTURE) {
        touch.used = true;
        goRef.current(stateRef.current + (dy > 0 ? 1 : -1));
      } else if (Math.abs(dx) > GESTURE && stateRef.current > 0) {
        touch.used = true;
        // Right brings the next case round from the left (Reforma after nest).
        goRef.current(Math.max(1, stateRef.current + (dx > 0 ? 1 : -1)));
      }
    };
    const onTouchEnd = () => {
      touch = null;
    };
    const onWheel = (event: WheelEvent) => {
      const down = event.deltaY > 0;
      const size = Math.abs(event.deltaY);
      const now = performance.now();
      const fresh = now - lastWheel.at > 80 || (size > lastWheel.size * 1.5 && size > 8);
      lastWheel = { at: now, size };
      if (fresh) wheelUsed = false;
      if (!busy.current && !wheelUsed && (!inStage() || leaving(down))) return;
      event.preventDefault();
      // A wheel gesture made while a state is still playing is spent on nothing.
      if (busy.current) {
        wheelUsed = true;
        return;
      }
      if (wheelUsed || size < 2) return;
      wheelUsed = true;
      goRef.current(stateRef.current + (down ? 1 : -1));
    };
    // Coming back up into the CD area, or a jump elsewhere: settle on a state.
    let settle = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const up = y < lastY;
      lastY = y;
      if (busy.current) return;
      // Scrolling up from below stops on Ribbon; from there each gesture
      // steps back one case, then the disc goes home at the top.
      if (up && stateRef.current === LAST && y / zoomNow() < STATE_SCROLL[LAST]) {
        window.scrollTo(0, STATE_SCROLL[LAST] * zoomNow());
        return;
      }
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (busy.current) return;
        const y = window.scrollY / zoomNow();
        if (y > STATE_SCROLL[LAST] + 2) {
          if (stateRef.current !== LAST) {
            stateRef.current = LAST;
            setState(LAST);
          }
        } else if (Math.abs(y - STATE_SCROLL[stateRef.current]) > 2) {
          window.scrollTo({ top: STATE_SCROLL[stateRef.current] * zoomNow(), behavior: "smooth" });
        }
      }, 140);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(settle);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { state, go };
}

export default function MobileHome() {
  const location = useLocation();
  const zoom = useZoom();
  const { state, go } = useCaseStates(zoom);

  // Coming from another page's footer: open the cases or go to About Me.
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const timer = window.setTimeout(() => (target === "shelves" ? go(1) : toSection(target)), 400);
    return () => window.clearTimeout(timer);
    // Only on arrival.
  }, []);
  const [lift] = useState(landingLift);
  const [openAt] = useState(openCenter);
  const below = belowOffset(openAt);
  // "Work" opens the cases.
  const toWork = () => go(1);

  return (
    <div className="relative w-full overflow-x-clip bg-white">
      <div className="relative" style={{ width: WIDTH, height: HEIGHT + below, zoom }}>
        {/* header */}
        <FadeUp onLoad>
        <button aria-label="Home" className="absolute top-[24px] left-[24px] h-[32px] w-[32.35px]" onClick={() => go(0)} type="button">
          <div className="absolute inset-[-5.37%_-10.12%_-9.53%_-7.45%]">
            <img alt="" className="block size-full max-w-none" src="/assets/shared/logo.svg" />
          </div>
        </button>
        <nav className="nm absolute top-[32px] right-[24px] flex h-[16px] items-center gap-[10px] text-[12px] leading-[1.32] tracking-[-0.24px] whitespace-nowrap text-black">
          <button onClick={toWork} type="button">
            Work /
          </button>
          <button onClick={() => toSection("about")} type="button">
            About /
          </button>
          <button onClick={() => toSection("contact")} type="button">
            Contact
          </button>
        </nav>
        </FadeUp>

        {/* title */}
        <FadeUp delay={100} onLoad>
        <div className="absolute left-[63.04px] h-[60.56px] w-[275.93px]" style={{ top: 190 - lift.title }}>
          <div className="absolute inset-[-84.27%_-19.8%_-8.37%_-1.79%]">
            <img alt="i'm neha!" className="block size-full max-w-none" src="/assets/home/title-big.svg" />
          </div>
        </div>
        <p style={{ top: 275.56 - lift.title }} className="nm absolute left-[38px] w-[326px] text-center text-[16px] leading-[1.32] tracking-[-0.32px] text-black">
          a truly curious product designer who always delivers, one detail at a time.
        </p>
        </FadeUp>

        <FadeUp delay={250} onLoad>
          <CaseStack lift={lift.cases} onGo={go} openAt={openAt} state={state} />
        </FadeUp>

        {/* Everything below waits while the fan turns, then follows on. */}
        <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${below}px)` }}>
          {/* the record and the magazine, each sitting on a shelf */}
          {[2089, 2523].map((ledge) => (
            <Shelf key={ledge} ledge={ledge} />
          ))}
          <FadeUp>
            <div className="absolute top-[1849px] left-[24px] h-[241px] w-[354px] overflow-hidden">
              <img alt="" className="absolute top-[-31.95%] left-[-46.36%] h-[154.06%] w-[186.23%] max-w-none" src="/assets/home/record-cover.png" />
            </div>
          </FadeUp>
          <FadeUp>
            <div className="absolute top-[2222px] left-[83px] h-[301px] w-[236px] overflow-hidden">
              <img alt="" className="absolute top-[-79.35%] left-[-53.13%] h-[240.1%] w-[203.36%] max-w-none" src="/assets/home/magazine-cover.png" />
            </div>
          </FadeUp>

          {/* Each part fades in and up as it comes into view, like desktop. */}
          <FadeUp>
            <Work />
          </FadeUp>
          <FadeUp>
            <Education />
          </FadeUp>
          <FadeUp>
            <Involvement />
          </FadeUp>
          <AboutMe />
          <FadeUp>
            <Referrals />
          </FadeUp>
          <FadeUp>
            <Footer onHome={() => go(0)} onWork={toWork} />
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
