import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrollToY } from "../../site/navigation";
import { MOBILE_NEST_SECTIONS } from "../../site/nestMobile";

// "nav menu overlay" (2187:23931): fixed over the mobile case study. Normally
// only its buttons take touches, so the page under the empty space works as
// usual. The menu button (bottom right, 24 in from the corner) dissolves the
// menu in; the skip button beside it slides right behind it and goes. Tapping
// a section glides the page there behind the menu; closing dissolves the menu
// away to show it.

const SLOW = "cubic-bezier(0.22, 1, 0.36, 1)";
const DISSOLVE = `opacity 0.6s ${SLOW}, visibility 0.6s`;
const FINAL = MOBILE_NEST_SECTIONS.length - 1;
// Sections' label centres in the open menu, 85 apart. The labels are kept
// centred on the screen (their box is as tall as twice their middle).
const LABEL_TOP = 214;
const LABEL_STEP = 85;
const LABELS_HEIGHT = 2 * (LABEL_TOP + (LABEL_STEP * (MOBILE_NEST_SECTIONS.length - 1)) / 2);
// "skip to the end" pill: 16 either side; "Skip to final product" (129),
// a 10 gap and the arrow (12), or, at the final product, just the arrow.
const PAD = 16;
const SKIP_WIDTH = PAD + 129 + 10 + 12 + PAD;
const BACK_WIDTH = PAD + 12 + PAD;
// Scrolls smaller than this don't count as a direction.
const SCROLL_NOISE = 4;

const label = "nm text-[16px] leading-normal tracking-[-0.32px] whitespace-nowrap";

// The section on screen: the last one whose top has passed a third of the
// way down the window.
function currentSection(zoom: number, lift: number) {
  const line = window.scrollY + window.innerHeight / 3;
  let current = 0;
  MOBILE_NEST_SECTIONS.forEach((section, i) => {
    if ((section.top - lift) * zoom <= line) current = i;
  });
  return current;
}

// "down" (2217:11305): the arrow keeps nudging along its direction, 5px each
// way (after delay, smart animate 0.4s ease out).
function Arrow({ up }: { up: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const animation = ref.current?.animate(
      [
        { translate: "0 -3px", easing: "ease-out" },
        { translate: "0 2px", easing: "ease-out" },
        { translate: "0 -3px" },
      ],
      { duration: 800, iterations: Infinity },
    );
    return () => animation?.cancel();
  }, []);
  return (
    <svg
      ref={ref}
      className="block shrink-0"
      fill="none"
      height="18"
      style={{ rotate: up ? "180deg" : "0deg" }}
      viewBox="0 0 12 18"
      width="12"
    >
      <path d="M6 3.5V14.5M1.5 10L6 14.5L10.5 10" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

// `lift`: how far the sections sit above their design places (negative when
// the page below the hero moved down for a tall screen).
export default function MobileNestOverlay({ zoom, lift = 0 }: { zoom: number; lift?: number }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(() => currentSection(zoom, lift));
  const [homeLabel, setHomeLabel] = useState(true);
  const [homeShown, setHomeShown] = useState(true);
  // The skip and menu buttons wait until Overview has come on screen.
  const [rowShown, setRowShown] = useState(false);
  const atFinal = section === FINAL;

  // Above Overview the home button shows, labelled "Home". Once the page is
  // scrolled down to Overview (its top three quarters of the way up the
  // screen) the label closes up and the whole button goes; from there it
  // comes back, as just the star, whenever the page is scrolled up, and goes
  // again on the way down.
  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const overview = (MOBILE_NEST_SECTIONS[0].top - lift) * zoom;
      const above = overview > y + window.innerHeight * 0.75;
      setRowShown(overview < y + window.innerHeight);
      setHomeLabel(above);
      if (above) setHomeShown(true);
      else if (Math.abs(y - lastY) >= SCROLL_NOISE) setHomeShown(y < lastY);
      if (above || Math.abs(y - lastY) >= SCROLL_NOISE) lastY = y;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [zoom, lift]);

  useEffect(() => {
    const update = () => setSection(currentSection(zoom, lift));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [zoom, lift]);

  const toSection = (i: number) => scrollToY((MOBILE_NEST_SECTIONS[i].top - lift) * zoom);
  const skipWidth = atFinal ? BACK_WIDTH : SKIP_WIDTH;

  return (
    // Under the loading screen (z 45).
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* the open menu */}
      <div
        aria-hidden={!open}
        className="absolute inset-0"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(24.6px)",
          WebkitBackdropFilter: "blur(24.6px)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transition: DISSOLVE,
        }}
      >
        <nav className="absolute top-1/2 left-1/2 w-[402px]" style={{ height: LABELS_HEIGHT, translate: "-50% -50%", scale: zoom }}>
          {MOBILE_NEST_SECTIONS.map((item, i) => (
            <button
              className={`${label} absolute left-1/2 h-[44px] -translate-x-1/2 -translate-y-1/2 px-[16px] text-black`}
              key={item.label}
              onClick={() => toSection(i)}
              style={{ top: LABEL_TOP + LABEL_STEP * i }}
              tabIndex={open ? 0 : -1}
              type="button"
            >
              <span className="relative">
                {item.label}
                <span
                  className="absolute top-1/2 right-[calc(100%+10px)] size-[4px] -translate-y-1/2 rounded-full bg-black"
                  style={{ opacity: i === section ? 1 : 0, transition: `opacity 0.6s ${SLOW}` }}
                />
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* "home button": the star (on no background), labelled at first */}
      <div className="absolute top-0 left-0 origin-top-left" style={{ scale: zoom }}>
        <button
          aria-label="Home"
          className="absolute top-[8px] left-[8px] h-[64px] overflow-hidden rounded-[75px]"
          onClick={() => navigate("/")}
          style={{
            width: homeLabel ? 122.3 : 64.3,
            opacity: homeShown || open ? 1 : 0,
            pointerEvents: homeShown || open ? "auto" : "none",
            transition: `width 1.25s ${SLOW}, opacity 0.6s ${SLOW}`,
          }}
          tabIndex={homeShown || open ? 0 : -1}
          type="button"
        >
          <span className="absolute top-[16px] left-[16px] h-[32px] w-[32.3px]">
            <span className="absolute inset-[-5.37%_-10.12%_-9.53%_-7.45%]">
              <img alt="" className="block size-full max-w-none" src="/assets/shared/logo.svg" />
            </span>
          </span>
          <span
            className={`${label} absolute top-[21.5px] left-[65.3px] text-black`}
            style={{ opacity: homeLabel ? 1 : 0, transition: `opacity 0.8s ${SLOW}` }}
          >
            Home
          </span>
        </button>
      </div>

      {/* "menu row": skip / back up, and the menu button */}
      <div
        className="absolute right-0 bottom-0 h-[88px] w-[300px] origin-bottom-right"
        style={{
          scale: zoom,
          opacity: rowShown || open ? 1 : 0,
          visibility: rowShown || open ? "visible" : "hidden",
          transition: DISSOLVE,
        }}
      >
        <button
          aria-label={atFinal ? "Scroll back up" : undefined}
          className={`${label} pointer-events-auto absolute right-[74px] bottom-[24px] flex h-[40px] items-center justify-center gap-[10px] overflow-hidden rounded-[40px] bg-black text-white`}
          onClick={() => (atFinal ? scrollToY(0) : toSection(FINAL))}
          style={{
            width: skipWidth,
            translate: open ? `${skipWidth + 10}px 0` : "0 0",
            opacity: open ? 0 : 1,
            pointerEvents: open ? "none" : "auto",
            transition: `translate 0.6s ${SLOW}, opacity 0.6s ${SLOW}, width 0.6s ${SLOW}`,
          }}
          tabIndex={open ? -1 : 0}
          type="button"
        >
          {!atFinal && "Skip to final product"}
          <Arrow up={atFinal} />
        </button>
        <button
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Menu"}
          className="pointer-events-auto absolute right-[24px] bottom-[24px] z-10 size-[40px] rounded-[40px] bg-black"
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          {/* The list icon turns into the close X (smart animate): the top
              and bottom lines (15 long) swing to the middle and cross, as
              the X's 11 x 11 diagonals; the middle line fades. */}
          <span className="absolute top-[10px] left-[10px] size-[20px]">
            {[
              { top: 4.5, turn: 45 },
              { top: 10, turn: 0 },
              { top: 15.5, turn: -45 },
            ].map(({ top, turn }) => (
              <span
                className="absolute left-[2.5px] h-[1.5px] w-[15px] rounded-full bg-white"
                key={top}
                style={{
                  top: top - 0.75,
                  translate: open ? `0 ${10 - top}px` : "0 0",
                  rotate: open ? `${turn}deg` : "0deg",
                  opacity: open && !turn ? 0 : 1,
                  transition: `translate 0.6s ${SLOW}, rotate 0.6s ${SLOW}, opacity 0.3s ${SLOW}`,
                }}
              />
            ))}
          </span>
        </button>
      </div>
    </div>
  );
}
