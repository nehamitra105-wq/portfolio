import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fades its children in and up once, either straight away (`onLoad`, for the
// hero) or when it scrolls into view.
export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 1250,
  onLoad = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  onLoad?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(onLoad);

  useEffect(() => {
    if (onLoad || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // Watch the content itself: when it's absolutely positioned the wrapper
    // has no size of its own.
    observer.observe(ref.current.firstElementChild ?? ref.current);
    return () => observer.disconnect();
  }, [onLoad]);

  return (
    <div
      className={`${className} ${visible ? "fade-up" : "opacity-0"}`}
      ref={ref}
      style={{ ...style, ["--fade-delay" as string]: `${delay}ms`, ["--fade-duration" as string]: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
