import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { whenMediaReady, type Media } from "../site/media";

// A gallery frame that only loads its image or video once it's about a screen
// away, then fades in and up (like Reveal) as it scrolls into view, but not
// before its image or video is ready, so it never shows half loaded.
export default function LazyPiece({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const load = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          load.disconnect();
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          reveal.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    load.observe(el);
    reveal.observe(el);
    return () => {
      load.disconnect();
      reveal.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!near || !el) return;
    let cancelled = false;
    Promise.all(Array.from(el.querySelectorAll<Media>("img, video")).map(whenMediaReady)).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [near]);

  return (
    <div className={`${className} ${visible && ready ? "fade-up" : "opacity-0"}`} ref={ref} style={style}>
      {near && children}
    </div>
  );
}
