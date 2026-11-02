import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { goToSection } from "../site/navigation";
import { FRAME_WIDTH } from "../site/frameZoom";

type NavItem = "work" | "gallery" | "about" | "contact";

const ITEMS: { id: NavItem; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// Bar height in frame pixels: the nav (48px) with 48px above and below at the
// top of the page, and a thinner bar (16px above and below) when it comes
// back in on scroll-up.
const BAR = { top: { height: 144, navTop: 48 }, compact: { height: 80, navTop: 16 } };
// The nav's fade-in only plays the first time the site is opened (per browser
// session), not when coming back to a page.
const NAV_INTRO_KEY = "nav-intro-played";
let introPending = (() => {
  try {
    return !sessionStorage.getItem(NAV_INTRO_KEY);
  } catch {
    return true; // storage unavailable (private mode): just play it
  }
})();
const markIntroPlayed = () => {
  introPending = false;
  try {
    sessionStorage.setItem(NAV_INTRO_KEY, "1");
  } catch {
    // ignore
  }
};

// Ignore scroll jitter smaller than this.
const SCROLL_THRESHOLD = 4;

type BarState = "top" | "hidden" | "shown";

// The home page's "nav w/ logo". It's fixed to the window: at the top of the
// page it sits as designed; scrolling down fades it up and away, and
// scrolling back up brings it back in on a white bar. It's drawn outside the
// page frame (portal) with the frame's width and scale, so it lines up with
// the page in any window.
export default function SiteNav({
  active,
  animateIn = false,
  onContact,
}: {
  active?: NavItem;
  animateIn?: boolean;
  // Replaces Contact's usual scroll to the footer (the gallery drops the guy
  // onto it too).
  onContact?: () => void;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<BarState>("top");
  const [playIntro] = useState(() => animateIn && introPending);

  // Whichever page opens first uses up the intro.
  useEffect(markIntroPlayed, []);
  const bar = state === "top" ? BAR.top : BAR.compact;

  useEffect(() => {
    let last = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current <= SCROLL_THRESHOLD) setState("top");
      else if (current > last + SCROLL_THRESHOLD) setState("hidden");
      else if (current < last - SCROLL_THRESHOLD) setState("shown");
      else return;
      last = current;
    };
    // Arriving partway down a page (e.g. Back from a job page lands on Work):
    // show the nav on its white bar rather than as the transparent top nav.
    setState(window.scrollY <= SCROLL_THRESHOLD ? "top" : "shown");
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (item: NavItem) => {
    if (item === "gallery") {
      navigate("/gallery");
      return;
    }
    if (item === "contact" && onContact) {
      onContact();
      return;
    }
    goToSection(navigate, item === "work" ? "shelves" : item === "about" ? "about" : "contact");
  };

  return createPortal(
    <header
      className="fixed inset-x-0 top-0 z-40 transition-[opacity,transform,background-color] duration-400 ease-out"
      style={{
        backgroundColor: state === "shown" ? "#fff" : "transparent",
        opacity: state === "hidden" ? 0 : 1,
        transform: state === "hidden" ? "translateY(-100%)" : "none",
        pointerEvents: state === "hidden" ? "none" : undefined,
      }}
    >
      <div
        className={`relative mx-auto transition-[height] duration-400 ease-out ${playIntro ? "fade-up" : ""}`}
        style={{ width: FRAME_WIDTH, height: bar.height, zoom: "var(--frame-zoom, 1)" }}
      >
        <div
          className="absolute left-[139px] flex h-[48px] items-center gap-[241px] transition-[top] duration-400 ease-out"
          style={{ top: bar.navTop }}
        >
          <button className="relative size-[48px] shrink-0" onClick={() => goToSection(navigate, "top")} type="button">
            <div className="absolute inset-[-5.37%_-10.12%_-9.53%_-7.45%]">
              <img alt="Home" className="block size-full max-w-none" src="/assets/shared/logo.svg" />
            </div>
          </button>
          <nav className="nm flex items-center gap-[114px] text-center text-[16px] leading-[1.32] tracking-[-0.32px] text-black">
            {/* The current page is shown in brackets; hovering another item
                brings its brackets in too. */}
            {ITEMS.map(({ id, label }) => {
              const current = id === active;
              const brackets = `transition-opacity duration-300 ease-out ${current ? "" : "opacity-0 group-hover:opacity-100"}`;
              return (
                <button
                  className={`group w-[77px] shrink-0 whitespace-pre transition-opacity duration-300 ease-out ${current ? "" : "opacity-50 hover:opacity-100"}`}
                  key={id}
                  onClick={() => handleClick(id)}
                  type="button"
                >
                  <span className={brackets}>{"(   "}</span>
                  {label}
                  <span className={brackets}>{"   )"}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>,
    document.body,
  );
}
