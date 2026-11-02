import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { whenMediaReady, type Media } from "../site/media";

// A gallery frame: its image or video loads with the page (the loading screen
// waits for all of them), and it fades in and up (like Reveal) as it scrolls
// into view, never before its image or video is ready.
export default function GalleryFrame({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    Promise.all(Array.from(el.querySelectorAll<Media>("img, video")).map(whenMediaReady)).then(() => {
      if (!cancelled) setReady(true);
    });
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          reveal.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    reveal.observe(el);
    return () => {
      cancelled = true;
      reveal.disconnect();
    };
  }, []);

  return (
    <div className={`${className} ${visible && ready ? "fade-up" : "opacity-0"}`} ref={ref} style={style}>
      {children}
    </div>
  );
}
