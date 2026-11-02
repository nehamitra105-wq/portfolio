import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const L = "/assets/loader";
// Only shown if a page is still loading after this long, so quick (cached)
// page changes don't flash it.
const SHOW_AFTER_MS = 250;
const FADE_MS = 500;

// Resolves once every image on the page (not the loader's own) has loaded or
// failed.
function imagesLoaded() {
  const pending = Array.from(document.images).filter(
    (img) => !img.complete && img.loading !== "lazy" && !img.closest("[data-page-loader]"),
  );
  const page = document.readyState === "complete" ? [] : [new Promise((resolve) => window.addEventListener("load", resolve, { once: true }))];
  return {
    loading: pending.length > 0 || page.length > 0,
    done: Promise.all([
      ...page,
      ...pending.map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
      ),
    ]),
  };
}

// "loading screen" (2085:26105): a CD turning as slowly as the home CD, with
// the arc and star circling it. Covers a page whose images are still
// loading, then fades out.
export default function PageLoader() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let showTimer = 0;
    // Wait for the new page to render its images before checking them.
    const frame = requestAnimationFrame(() => {
      const { loading, done } = imagesLoaded();
      if (!loading) return;
      showTimer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
      done.then(() => {
        if (cancelled) return;
        window.clearTimeout(showTimer);
        setVisible(false);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(showTimer);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden={!visible}
      aria-label="Loading"
      className="fixed inset-0 z-[45] flex items-center justify-center bg-white transition-opacity ease-out"
      data-page-loader
      role="status"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="relative size-[230px]" style={{ zoom: "var(--frame-zoom, 1)" }}>
        <img
          alt=""
          className="absolute top-[10px] left-[9px] h-[209px] w-[212px] max-w-none animate-[spin_12s_linear_infinite] object-cover"
          src={`${L}/cd-glare.png`}
        />
        {/* The arc and star go round the CD together. */}
        <div className="absolute inset-0 animate-[spin_1.6s_linear_infinite]">
          <div className="absolute inset-0 -rotate-90">
            <div className="absolute inset-[49.57%_0_0_36.74%]">
              <img alt="" className="block size-full max-w-none" src={`${L}/arc.svg`} />
            </div>
          </div>
          <div className="absolute top-[148px] left-[215.2px] size-[14.8px]">
            <div className="absolute inset-[-13.89%]">
              <img alt="" className="block size-full max-w-none" src={`${L}/star-glow.svg`} />
            </div>
          </div>
          <div className="absolute top-[148px] left-[214.9px] size-[14.8px]">
            <div className="absolute inset-[-40.56%]">
              <img alt="" className="block size-full max-w-none" src={`${L}/star.svg`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
