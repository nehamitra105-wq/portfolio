import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Disc from "../components/Disc";
import SiteFooter, { FOOTER_HEIGHT } from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import AboutMe from "../components/home/AboutMe";
import Referrals from "../components/home/Referrals";
import ShelfDisc from "../components/home/ShelfDisc";
import Reveal from "../components/Reveal";
import { EducationBlock, InvolvementBlock, WorkBlock } from "../components/home/WorkSections";
import { briefLayout } from "../site/briefLayout";
import { caseStudyBySlug, type CaseStudy } from "../site/caseStudies";
import { useDiscFlight } from "../site/discFlight";
import { useFrameZoom } from "../site/frameZoom";

// All positions are from the "portfolio tame" frame (1506 x 7269).
// The hero (wrong names, title, tagline, CD) scales with the window height so
// the CD always starts cut off about halfway by the bottom of the window, and
// the first shelf (its top shadow) starts right at the bottom edge so it
// rises into view as soon as the CD starts moving. Everything from the shelf down is shifted by
// `shelfShift` to follow it.
const FRAME_HEIGHT = 7269;
// The hero uses the shelf's case image (cropped at the case edges), so it
// takes that image's proportions: same width and centre as the design's
// 867 x 752 case.
const HERO_CASE = { left: 319, top: 604 + (752 - 867 * (415 / 467)) / 2, width: 867, height: 867 * (415 / 467) };
const HERO_DISC = { left: 453, top: 668, size: 631 };
const SHELF_TOP = 1446;
// Bottom of the tagline as rendered (in unscaled hero pixels), and the space
// kept between it and a shelf CD popped up on hover (it rises to the top of
// its row).
const TAGLINE_BOTTOM = 564;
const HOVER_GAP = 64;
const SHELF_CASE = { left: 209, top: SHELF_TOP + 225, width: 467, height: 415 };
const SHELF_DISC = { left: 209 + 52, top: SHELF_TOP + 240, size: 383.61 };
// The hero scales about the top of the wrong names, centred on the frame.
const HERO_ORIGIN = { x: 753, y: 181 };
const HERO_SCALE_RANGE = [0.7, 1.6];
// 12s per turn: four 3s quarter-turns in the "nest disc spin" component.
const SPIN_DEGREES_PER_MS = 360 / 12000;
// One scroll down sends the hero CD into its shelf slot in a single timed
// motion (and one scroll back up at the top returns it), so it's never left
// stuck halfway. The page scrolls this far (in frame pixels) along with it.
const HERO_LANDING_SCROLL = 400;
const HERO_LANDING_MS = 1400;
const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"]);

const SHELF_ROWS = [
  { top: 1446, studies: [{ slug: "nest", left: 209 }, { slug: "ribbon", left: 834 }], descTop: 1983, descLefts: [209, 843] },
  { top: 2250, studies: [{ slug: "milune", left: 209 }, { slug: "reforma", left: 843 }], descTop: 2787, descLefts: [209, 844] },
] as const;

// Each shelf: top shadow, the white shelf, and the bottom shadow (the same
// gradient flipped), drawn across the whole window.
const SHELF_BANDS = [
  { top: 1962, height: 124, bottomShadow: 2142 },
  { top: 2754, height: 136, bottomShadow: 2943 },
  { top: 3558, height: 136, bottomShadow: 3747 },
];
const BOTTOM_SHADOW_HEIGHT = 223;
// The shelf shadow gradient (white down to light grey), drawn in CSS so it
// stays crisp at any size.
const SHELF_SHADOW = "linear-gradient(to bottom, #fff, rgb(236, 236, 236))";

// Home fades out this long after a CD is clicked, then the brief page opens.
const HOME_FADE_MS = 500;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function ShelfDescription({ study, style }: { study: CaseStudy; style: CSSProperties }) {
  return (
    <div className="absolute flex w-[467px] flex-col items-start gap-[14px]" style={style}>
      <p className="nm h-[26px] text-[20px] leading-[1.32] tracking-[-0.4px] text-black">{study.description}</p>
      <div className="flex items-center gap-[20px]">
        {study.shelfTags.map((tag) => (
          <div className="flex items-center justify-center rounded-[40px] border border-solid border-black px-[12px] py-[6px]" key={tag}>
            <p className="nm text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-nowrap text-black">{tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const zoom = useFrameZoom();
  const frameRef = useRef<HTMLDivElement>(null);
  const heroCaseRef = useRef<HTMLDivElement>(null);
  const heroDiscRef = useRef<HTMLDivElement>(null);
  const firstRowRef = useRef<HTMLDivElement>(null);
  const discRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [heroDone, setHeroDone] = useState(false);
  const [leaving, setLeaving] = useState<CaseStudy | null>(null);
  const { startFlight } = useDiscFlight();
  // Hero → shelf: 0 is the spinning hero, 1 is landed on the shelf. `landing`
  // is the timed move between them; when `drive` is set it also scrolls the
  // page and holds off other scrolling until it's done.
  const landedRef = useRef(0);
  const landingRef = useRef<{ from: number; to: number; startedAt: number; drive: boolean; fromScroll: number; toScroll: number } | null>(null);
  const lastScrollRef = useRef(0);

  // Window height in frame pixels (the frame may be scaled down to fit).
  const viewportHeight = windowHeight / zoom;
  const heroScale = Math.min(
    Math.max((viewportHeight - HERO_ORIGIN.y) / (HERO_CASE.top + HERO_CASE.height / 2 - HERO_ORIGIN.y), HERO_SCALE_RANGE[0]),
    HERO_SCALE_RANGE[1],
  );
  const heroX = (x: number) => HERO_ORIGIN.x + (x - HERO_ORIGIN.x) * heroScale;
  const heroY = (v: number) => HERO_ORIGIN.y + (v - HERO_ORIGIN.y) * heroScale;
  // The first shelf starts at the window bottom, or lower when the window is
  // short so a CD popped up on hover still clears the tagline. The landing
  // scrolls that much further to match.
  const shelfDrop = Math.max(0, heroY(TAGLINE_BOTTOM) + HOVER_GAP - (viewportHeight - SHELF_BANDS[0].top + SHELF_TOP));
  const shelfShift = viewportHeight - SHELF_BANDS[0].top + shelfDrop;
  const landingScroll = HERO_LANDING_SCROLL + shelfDrop;
  const y = (value: number) => (value >= SHELF_TOP ? value + shelfShift : value);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Arriving from a nav/footer link on another page.
  useLayoutEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target) document.getElementById(target)?.scrollIntoView();
    else window.scrollTo(0, 0);
    landingRef.current = null;
    landedRef.current = window.scrollY > 1 ? 1 : 0;
    lastScrollRef.current = window.scrollY;
  }, [location.state]);

  // Start the hero CD landing (or going back) from a scroll, wheel, key or swipe.
  useEffect(() => {
    const landingPx = landingScroll * zoom;
    const start = (to: number, drive: boolean) => {
      if (landingRef.current || landedRef.current === to) return;
      landingRef.current = {
        from: landedRef.current,
        to,
        startedAt: performance.now(),
        drive,
        fromScroll: window.scrollY,
        toScroll: to === 1 ? Math.max(window.scrollY, landingPx) : 0,
      };
    };
    // Down at the very top lands the CD; up near the top sends it back.
    const request = (down: boolean, event: Event) => {
      if (landingRef.current?.drive) {
        event.preventDefault();
        return;
      }
      if (down && landedRef.current === 0) {
        event.preventDefault();
        start(1, true);
      } else if (!down && landedRef.current === 1 && window.scrollY <= landingPx * 1.25) {
        event.preventDefault();
        start(0, true);
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0) request(event.deltaY > 0, event);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key) || (event.target as HTMLElement).closest("input, textarea")) return;
      request(!["ArrowUp", "PageUp", "Home"].includes(event.key) && !(event.key === " " && event.shiftKey), event);
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const dy = touchY - event.touches[0].clientY;
      if (Math.abs(dy) > 4) request(dy > 0, event);
    };
    // Anything else that moves the page (scrollbar, nav links): the CD makes
    // the same timed move without taking over the scroll.
    const onScroll = () => {
      if (landingRef.current) return;
      const scroll = window.scrollY;
      const previous = lastScrollRef.current;
      lastScrollRef.current = scroll;
      if (landedRef.current === 0 && scroll > previous && scroll > 1) start(1, false);
      else if (landedRef.current === 1 && scroll < previous && scroll < landingPx - 1) start(0, false);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [landingScroll, zoom]);

  // Spin the hero disc and, while it lands, shrink it and its case into the
  // nest slot on the first shelf as that shelf's CDs slide in on a slow curve.
  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const landing = landingRef.current;
      if (landing) {
        const t = clamp01((time - landing.startedAt) / HERO_LANDING_MS);
        landedRef.current = mix(landing.from, landing.to, t);
        if (landing.drive) window.scrollTo({ top: mix(landing.fromScroll, landing.toScroll, easeInOut(t)), behavior: "instant" });
        if (t >= 1) {
          landingRef.current = null;
          lastScrollRef.current = window.scrollY;
        }
      }
      const progress = easeInOut(landedRef.current);

      let spin = ((time - startedAt) * SPIN_DEGREES_PER_MS) % 360;
      if (spin > 180) spin -= 360;
      const angle = spin * (1 - progress);

      const caseEl = heroCaseRef.current;
      if (caseEl) {
        caseEl.style.left = `${mix(heroX(HERO_CASE.left), SHELF_CASE.left, progress)}px`;
        caseEl.style.top = `${mix(heroY(HERO_CASE.top), y(SHELF_CASE.top), progress)}px`;
        caseEl.style.width = `${mix(HERO_CASE.width * heroScale, SHELF_CASE.width, progress)}px`;
        caseEl.style.height = `${mix(HERO_CASE.height * heroScale, SHELF_CASE.height, progress)}px`;
      }
      const discEl = heroDiscRef.current;
      if (discEl) {
        const size = mix(HERO_DISC.size * heroScale, SHELF_DISC.size, progress);
        discEl.style.left = `${mix(heroX(HERO_DISC.left), SHELF_DISC.left, progress)}px`;
        discEl.style.top = `${mix(heroY(HERO_DISC.top), y(SHELF_DISC.top), progress)}px`;
        discEl.style.width = discEl.style.height = `${size}px`;
        discEl.style.transform = `rotate(${angle}deg)`;
      }
      setHeroDone(progress >= 0.999);

      if (firstRowRef.current) {
        const amount = clamp01((landedRef.current - 0.15) / 0.85);
        firstRowRef.current.style.transform = `translateX(${(1 - easeOut(amount)) * 1506}px)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [heroScale, shelfShift, viewportHeight, zoom]);

  const selectStudy = (study: CaseStudy) => {
    const disc = discRefs.current[study.slug];
    const frame = frameRef.current;
    if (!disc || !frame || leaving) return;
    // Measure by centre: a hovered disc is turned, which grows its bounding box.
    const rect = disc.getBoundingClientRect();
    const size = disc.offsetWidth * zoom;
    const target = study.brief.disc;
    const brief = briefLayout();
    startFlight({
      study,
      from: {
        left: rect.left + rect.width / 2 - size / 2,
        top: rect.top + rect.height / 2 - size / 2,
        size,
        rotate: parseFloat(getComputedStyle(disc).rotate) || 0,
      },
      to: {
        left: (target.cx - target.size / 2) * brief.scale,
        top: (target.cy - target.size / 2) * brief.scale,
        size: target.size * brief.scale,
        rotate: target.rotate - 360,
      },
    });
    setLeaving(study);
    // Switch pages once home has faded out; the CD keeps flying over the top
    // and the brief comes in as it lands.
    window.setTimeout(() => navigate(`/brief/${study.slug}`, { state: { fromHome: true } }), HOME_FADE_MS);
  };

  const renderRow = (row: (typeof SHELF_ROWS)[number]) => (
    <>
      {row.studies.map(({ slug }, i) => {
        const study = caseStudyBySlug(slug)!;
        // Each description sits behind its CD case until the CD is hovered;
        // nest's also waits for the hero CD to land on top of it.
        return (
          <ShelfDescription
            key={slug}
            study={study}
            style={{ left: row.descLefts[i], top: y(row.descTop), visibility: slug === "nest" && !heroDone ? "hidden" : undefined }}
          />
        );
      })}
      {row.studies.map(({ slug, left }) => {
        const study = caseStudyBySlug(slug)!;
        return (
          <ShelfDisc
            hidden={(slug === "nest" && !heroDone) || leaving?.slug === slug}
            key={slug}
            onSelect={selectStudy}
            ref={(el) => {
              discRefs.current[slug] = el;
            }}
            study={study}
            style={{ left, top: y(row.top) }}
          />
        );
      })}
    </>
  );

  return (
    <>
      <div className="page-clip bg-white transition-opacity ease-in-out" style={{ opacity: leaving ? 0 : 1, transitionDuration: `${HOME_FADE_MS}ms` }}>
        {/* Shelf bands span the window, outside the (possibly scaled) frame. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
          {SHELF_BANDS.map(({ top, height, bottomShadow }) => (
            <div key={top}>
              <div className="absolute left-0 w-full" style={{ top: y(top) * zoom, height: height * zoom, background: SHELF_SHADOW }} />
              <div className="absolute left-0 w-full bg-white" style={{ top: y(top + height) * zoom, height: 56 * zoom }} />
              <div
                className="absolute left-0 w-full -scale-y-100"
                style={{ top: y(bottomShadow) * zoom, height: BOTTOM_SHADOW_HEIGHT * zoom, background: SHELF_SHADOW }}
              />
            </div>
          ))}
        </div>

        <div className="frame-page" ref={frameRef} style={{ height: FRAME_HEIGHT - FOOTER_HEIGHT + shelfShift }}>
          <SiteNav active="home" animateIn />

          {/* wrong names + title + tagline, scaled with the hero */}
          <Reveal className="pointer-events-none absolute inset-0" delay={100} onLoad>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: `scale(${heroScale})`, transformOrigin: `${HERO_ORIGIN.x}px ${HERO_ORIGIN.y}px` }}
          >
          <div className="absolute top-[181px] left-[684px] flex w-[174px] flex-col items-start gap-[6px]">
            {[
              { name: "mehl", h: 24, size: 18.518, ls: -0.3704, op: 0.2, line: 14.81, w: 57.406 },
              { name: "nagha", h: 29, size: 22.222, ls: -0.4444, op: 0.4, line: 15.05, w: 74.998 },
              { name: "naeha", h: 34, size: 25.925, ls: -0.5185, op: 0.7, line: 20.02, w: 87.96 },
            ].map(({ name, h, size, ls, op, line, w }, index) => (
              <div className="relative w-full" key={name} style={{ height: h }}>
                <p className="nm absolute top-0 left-[7.18px] w-[166.662px] leading-[1.32] text-black" style={{ fontSize: size, letterSpacing: ls, opacity: op }}>
                  {name}
                </p>
                <div className="absolute left-0 h-0" style={{ top: line, width: w }}>
                  <div className="absolute inset-[-1.39px_0_0_0]">
                    <img alt="" className="block size-full max-w-none" src={`/assets/home/wrong-line-${index + 1}.svg`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-[273px] left-[450px] flex w-[607px] flex-col items-center gap-[41px]">
            <div className="relative h-[124px] w-[565px] shrink-0">
              <div className="absolute inset-[-84.27%_-19.8%_-8.37%_-1.79%]">
                <img alt="i'm neha!" className="block size-full max-w-none" src="/assets/home/title-big.svg" />
              </div>
            </div>
            <p className="nm w-full text-center text-[28px] leading-[1.32] tracking-[-0.56px] text-black">
              a truly curious product designer who always delivers, one detail at a time.
            </p>
          </div>
          </div>
          </Reveal>

          {/* First shelf: its CDs slide in as the hero CD lands in the nest slot */}
          <div className="absolute inset-x-0 top-0" ref={firstRowRef}>
            {renderRow(SHELF_ROWS[0])}
          </div>
          {renderRow(SHELF_ROWS[1])}

          {/* Third shelf: record and magazine */}
          <div className="absolute left-[91px] h-[530px] w-[780px] overflow-hidden" style={{ top: y(3164) }}>
            <img alt="" className="absolute top-[-31.95%] left-[-46.36%] h-[154.06%] w-[186.23%] max-w-none" src="/assets/home/record-cover.png" />
          </div>
          <div className="absolute left-[1003px] h-[525px] w-[412px] overflow-hidden" style={{ top: y(3169) }}>
            <img alt="" className="absolute top-[-79.35%] left-[-53.13%] h-[240.1%] w-[203.36%] max-w-none" src="/assets/home/magazine-cover.png" />
          </div>

          {/* Hero CD: case + spinning nest disc, moved every frame above */}
          <Reveal className="pointer-events-none absolute inset-0" delay={250} onLoad>
          <div className="pointer-events-none absolute overflow-hidden" ref={heroCaseRef} style={{ visibility: heroDone ? "hidden" : undefined }}>
            <img alt="" className="absolute inset-0 block size-full max-w-none" src="/assets/home/shelf-case.png" />
          </div>
          <Disc
            className="pointer-events-none absolute"
            disc={caseStudyBySlug("nest")!.shelfDisc}
            ref={heroDiscRef}
            style={{ visibility: heroDone ? "hidden" : undefined }}
          />
          </Reveal>

          <Reveal className="absolute" style={{ left: 98, top: y(4099) }}>
            <WorkBlock style={{ left: 0, top: 0 }} />
          </Reveal>
          <Reveal className="absolute" style={{ left: 98, top: y(4607) }}>
            <EducationBlock style={{ left: 0, top: 0 }} />
          </Reveal>
          <Reveal className="absolute" style={{ left: 98, top: y(4885) }}>
            <InvolvementBlock style={{ left: 0, top: 0 }} />
          </Reveal>
          <AboutMe style={{ left: -214, top: y(5198) }} />
          <Reveal className="absolute" style={{ left: 100, top: y(6383) }}>
            <Referrals style={{ left: 0, top: 0 }} />
          </Reveal>
        </div>
        <SiteFooter />
      </div>

    </>
  );
}
