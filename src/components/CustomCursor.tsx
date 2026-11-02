import { useEffect, useRef, useState } from "react";

type CursorState = "normal" | "play" | "locked" | "email";

// Normal is a 32px dot; the special states are 40px circles with an icon.
const SIZE: Record<CursorState, number> = { normal: 32, play: 40, locked: 40, email: 40 };
// Over anything darker than this the cursor turns white with a black icon.
const DARK_BELOW = 0.45;
const SAMPLE_EVERY_MS = 80;

// Small copies of the page's pictures, drawn once, for reading the colour
// under the cursor.
const thumbnails = new WeakMap<HTMLImageElement, CanvasRenderingContext2D>();
const THUMB = 64;

const luminance = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

// Brightness (0 to 1) of what's under the point, or null if it's see-through.
function brightnessOf(el: Element, x: number, y: number): number | null {
  if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    let ctx: CanvasRenderingContext2D | null | undefined;
    if (el instanceof HTMLImageElement) {
      if (!el.complete || !el.naturalWidth) return null;
      ctx = thumbnails.get(el);
      if (!ctx) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = THUMB;
        ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(el, 0, 0, THUMB, THUMB);
        thumbnails.set(el, ctx);
      }
    } else {
      if (el.readyState < 2) return null;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = THUMB;
      ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(el, 0, 0, THUMB, THUMB);
    }
    const px = Math.min(THUMB - 1, Math.max(0, Math.floor(((x - rect.left) / rect.width) * THUMB)));
    const py = Math.min(THUMB - 1, Math.max(0, Math.floor(((y - rect.top) / rect.height) * THUMB)));
    try {
      const [r, g, b, a] = ctx.getImageData(px, py, 1, 1).data;
      return a < 128 ? null : luminance(r, g, b);
    } catch {
      return null;
    }
  }
  const match = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if (!match) return null;
  const [r, g, b, a = 1] = match.map(Number);
  return a < 0.5 ? null : luminance(r, g, b);
}

// What's showing under the point: the first non-see-through thing, top down.
function brightnessAt(x: number, y: number, cursor: Element | null) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (cursor?.contains(el)) continue;
    const value = brightnessOf(el, x, y);
    if (value !== null) return value;
  }
  return 1;
}

// The site's own cursor (the "cursor states" component). Any element can ask
// for a different state with data-cursor="play", "locked" or "email". Over
// dark pictures or fills it inverts to white with a black icon so it stays
// visible.
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("normal");
  const [dark, setDark] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("custom-cursor");

    let lastSample = 0;
    let point = { x: 0, y: 0 };
    let sampleTimer = 0;
    // The state comes from whatever is under the cursor: the element that got
    // the event, or (when the page scrolls under a still mouse) whatever is
    // there now.
    const readState = (target: Element | null) => {
      const owner = target?.closest?.("[data-cursor]");
      setState((owner?.getAttribute("data-cursor") as CursorState) ?? "normal");
    };
    const sample = () => {
      lastSample = performance.now();
      readState(document.elementFromPoint(point.x, point.y));
      setDark(brightnessAt(point.x, point.y, ref.current) < DARK_BELOW);
    };

    const handleMove = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY };
      if (ref.current) ref.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      readState(event.target as Element | null);
      setVisible(true);
      // Check the colour underneath now and then, and once more after
      // stopping so it settles on the right one.
      window.clearTimeout(sampleTimer);
      if (performance.now() - lastSample > SAMPLE_EVERY_MS) sample();
      sampleTimer = window.setTimeout(sample, SAMPLE_EVERY_MS);
    };
    const handleScroll = () => {
      window.clearTimeout(sampleTimer);
      if (performance.now() - lastSample > SAMPLE_EVERY_MS) sample();
      sampleTimer = window.setTimeout(sample, SAMPLE_EVERY_MS);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.clearTimeout(sampleTimer);
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  const size = SIZE[state];
  const fill = dark ? "#fff" : "#000";
  const ink = dark ? "#000" : "#fff";

  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-0 z-[1000]" ref={ref}>
      <div
        className="flex items-center justify-center rounded-full transition-[width,height,margin,opacity,background-color] duration-200 ease-out"
        style={{ width: size, height: size, margin: -size / 2, backgroundColor: fill, color: ink, opacity: visible ? 1 : 0 }}
      >
        {state === "play" && (
          <svg fill="none" height={40} viewBox="0 0 32 32" width={40}>
            <path
              d="M11.9999 12.3058C11.9998 12.1201 12.0462 11.9376 12.1343 11.7769C12.2224 11.6161 12.3492 11.4828 12.5017 11.3903C12.6543 11.2978 12.8273 11.2494 13.0032 11.25C13.1792 11.2506 13.3518 11.3003 13.5038 11.3939L19.5018 15.087C19.6532 15.1797 19.7789 15.3127 19.8663 15.4728C19.9537 15.6328 19.9997 15.8143 19.9999 15.999C20 16.1837 19.9543 16.3653 19.8671 16.5255C19.78 16.6857 19.6545 16.8189 19.5033 16.9119L13.5038 20.6061C13.3518 20.6997 13.1792 20.7494 13.0032 20.75C12.8273 20.7506 12.6543 20.7022 12.5017 20.6097C12.3492 20.5172 12.2224 20.3839 12.1343 20.2231C12.0462 20.0624 11.9998 19.8799 11.9999 19.6942V12.3058Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
            />
          </svg>
        )}
        {state === "locked" && (
          <svg fill="none" height={12.6} viewBox="0 0 10.25 11.25" width={11.5}>
            <path
              d="M1.625 5.125H8.625C9.17729 5.125 9.625 5.57272 9.625 6.125V9.625C9.625 10.1773 9.17729 10.625 8.625 10.625H1.625C1.07272 10.625 0.625 10.1773 0.625 9.625V6.125C0.625 5.57272 1.07272 5.125 1.625 5.125Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
            />
            <path
              d="M2.625 5.125V3.125C2.625 2.46196 2.88839 1.82607 3.35723 1.35723C3.82607 0.888392 4.46196 0.625 5.125 0.625C5.78804 0.625 6.42393 0.888392 6.89277 1.35723C7.36161 1.82607 7.625 2.46196 7.625 3.125V5.125"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
            />
          </svg>
        )}
        {state === "email" && (
          <svg fill="none" height={14.4} viewBox="0 0 14.4 14.4" width={14.4}>
            <path
              d="M6.54812 7.85166C6.43345 7.7372 6.29679 7.64714 6.14638 7.58692L1.38838 5.67892C1.33157 5.65613 1.28309 5.6165 1.24946 5.56536C1.21582 5.51422 1.19863 5.45401 1.2002 5.39282C1.20176 5.33162 1.22201 5.27238 1.25822 5.22302C1.29444 5.17367 1.34488 5.13658 1.40278 5.11672L12.8028 1.21672C12.8559 1.19752 12.9135 1.19386 12.9686 1.20616C13.0238 1.21846 13.0743 1.24622 13.1143 1.28619C13.1543 1.32616 13.182 1.37668 13.1943 1.43185C13.2066 1.48703 13.203 1.54456 13.1838 1.59772L9.28378 12.9977C9.26392 13.0556 9.22683 13.1061 9.17748 13.1423C9.12813 13.1785 9.06888 13.1987 9.00769 13.2003C8.94649 13.2019 8.88629 13.1847 8.83514 13.151C8.784 13.1174 8.74438 13.0689 8.72158 13.0121L6.81358 8.25292C6.75309 8.10262 6.66279 7.96612 6.54812 7.85166ZM6.54812 7.85166L13.1124 1.28872"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
