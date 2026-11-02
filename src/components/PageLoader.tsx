import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isMediaPending, type Media } from "../site/media";

const L = "/assets/loader";
const FADE_MS = 500;
// The page is covered in white the moment anything on it is still loading;
// the CD and arc only show if it takes longer than this, so quick (cached)
// page changes just fade in.
const GRAPHIC_AFTER_MS = 250;
// Pictures and videos can appear a moment after the page does (the gallery
// adds each frame as it comes near the screen), so the page keeps being
// checked until nothing new has turned up for a little while.
const CHECK_EVERY_MS = 100;
const MIN_CHECK_MS = 400;
const QUIET_CHECKS = 3;
// Never cover the page for longer than this.
const MAX_WAIT_MS = 15000;

// The arc: a circle round the CD that fills clockwise from the top as the
// page loads, with the star at its tip.
const CENTER = 115;
const RADIUS = 114;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PROGRESS_MS = 400;

// The page's pictures and videos (not the loader's own).
function pageMedia() {
  return Array.from(document.querySelectorAll<Media>("img, video")).filter(
    (el) =>
      !el.closest("[data-page-loader]") &&
      !(el instanceof HTMLImageElement && el.loading === "lazy") &&
      Boolean(el.getAttribute("src") || el.querySelector("source")),
  );
}

// "loading screen" (2085:26105): a CD turning as slowly as the home CD, with
// the arc showing how much of the page has loaded. Covers a page until every
// picture and video on it is ready, then fades out once the arc closes.
export default function PageLoader() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [showGraphic, setShowGraphic] = useState(false);
  const [progress, setProgress] = useState(0);

  // Runs before the new page is painted, so a half-loaded page never shows.
  useLayoutEffect(() => {
    let cancelled = false;
    let checkTimer = 0;
    let graphicTimer = 0;
    let hideTimer = 0;
    let covering = false;
    let quiet = 0;
    const seen = new Set<Media>();
    const startedAt = performance.now();

    const check = () => {
      if (cancelled) return;
      for (const el of pageMedia()) if (isMediaPending(el)) seen.add(el);
      const pending = [...seen].filter((el) => el.isConnected && isMediaPending(el)).length;
      if (pending && !covering) {
        covering = true;
        setProgress(0);
        setVisible(true);
        graphicTimer = window.setTimeout(() => setShowGraphic(true), GRAPHIC_AFTER_MS);
      }
      if (seen.size) setProgress((seen.size - pending) / seen.size);
      quiet = pending ? 0 : quiet + 1;
      const elapsed = performance.now() - startedAt;
      if ((quiet >= QUIET_CHECKS && elapsed >= MIN_CHECK_MS) || elapsed >= MAX_WAIT_MS) {
        if (!covering) return;
        window.clearTimeout(graphicTimer);
        setProgress(1);
        // Let the arc close before fading out.
        hideTimer = window.setTimeout(() => setVisible(false), PROGRESS_MS);
        return;
      }
      checkTimer = window.setTimeout(check, CHECK_EVERY_MS);
    };
    check();

    return () => {
      cancelled = true;
      window.clearTimeout(checkTimer);
      window.clearTimeout(graphicTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  const ease = `${PROGRESS_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      aria-hidden={!visible}
      aria-label="Loading"
      aria-valuenow={Math.round(progress * 100)}
      className="fixed inset-0 z-[45] flex items-center justify-center bg-white transition-opacity ease-out"
      data-page-loader
      role="progressbar"
      onTransitionEnd={(event) => event.target === event.currentTarget && !visible && setShowGraphic(false)}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        // Covers instantly, fades away.
        transitionDuration: visible ? "0ms" : `${FADE_MS}ms`,
      }}
    >
      <div
        className="relative size-[230px] transition-opacity duration-300"
        style={{ zoom: "var(--frame-zoom, 1)", opacity: showGraphic ? 1 : 0 }}
      >
        <img
          alt=""
          className="absolute top-[10px] left-[9px] h-[209px] w-[212px] max-w-none animate-[spin_12s_linear_infinite] object-cover"
          src={`${L}/cd-glare.png`}
        />
        <svg className="absolute inset-0 -rotate-90 overflow-visible" fill="none" viewBox="0 0 230 230">
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="black"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            strokeLinecap="round"
            strokeWidth={2}
            style={{ transition: `stroke-dashoffset ${ease}` }}
          />
        </svg>
        {/* The star rides the tip of the arc. */}
        <div className="absolute inset-0" style={{ rotate: `${progress * 360}deg`, transition: `rotate ${ease}` }}>
          <div className="absolute size-[14.8px]" style={{ left: CENTER - 7.4, top: CENTER - RADIUS - 7.4 }}>
            <div className="absolute inset-[-13.89%]">
              <img alt="" className="block size-full max-w-none" src={`${L}/star-glow.svg`} />
            </div>
            <div className="absolute inset-[-40.56%]">
              <img alt="" className="block size-full max-w-none" src={`${L}/star.svg`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
