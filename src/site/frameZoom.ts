import { useEffect, useState } from "react";

// Pages are designed at the Figma frame width. In a narrower window they scale
// down to fit (like the Figma prototype) instead of being cropped; they never
// scale up.
export const FRAME_WIDTH = 1506;

const currentZoom = (width: number) => Math.min(1, document.documentElement.clientWidth / width);

export function useFrameZoom(width = FRAME_WIDTH) {
  const [zoom, setZoom] = useState(() => currentZoom(width));

  useEffect(() => {
    const update = () => setZoom(currentZoom(width));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [width]);

  return zoom;
}

// The footer always spans the window, so it scales both down and up.
export function useFooterZoom() {
  const [zoom, setZoom] = useState(() => document.documentElement.clientWidth / FRAME_WIDTH);

  useEffect(() => {
    const update = () => setZoom(document.documentElement.clientWidth / FRAME_WIDTH);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return zoom;
}

// Mounted once in App: exposes the zoom to CSS as --frame-zoom.
export function FrameZoom() {
  const zoom = useFrameZoom();

  useEffect(() => {
    document.documentElement.style.setProperty("--frame-zoom", String(zoom));
  }, [zoom]);

  return null;
}
