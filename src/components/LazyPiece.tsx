import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// A gallery frame that only loads its image or video once it's about a screen
// away, then fades in and up (like Reveal) as it scrolls into view.
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

  return (
    <div className={`${className} ${visible ? "fade-up" : "opacity-0"}`} ref={ref} style={style}>
      {near && children}
    </div>
  );
}
