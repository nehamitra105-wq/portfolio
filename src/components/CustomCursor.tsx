import { useEffect, useRef, useState } from "react";

type CursorState = "normal" | "play" | "locked";

// The site's own cursor (the "cursor states" component). Any element can ask
// for a different state with data-cursor="play" or data-cursor="locked".
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("normal");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("custom-cursor");

    const handleMove = (event: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${event.clientX - 16}px, ${event.clientY - 16}px)`;
      }
      const target = (event.target as Element | null)?.closest?.("[data-cursor]");
      setState((target?.getAttribute("data-cursor") as CursorState) ?? "normal");
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[1000] size-[32px] transition-opacity duration-150"
      ref={ref}
      style={{ opacity: visible ? 1 : 0 }}
    >
      {state === "locked" ? (
        <div className="flex size-[32px] items-center justify-center rounded-[33px] bg-black p-[4px]">
          <div className="relative size-[12px] overflow-clip">
            <div className="absolute inset-[8.33%_12.5%]">
              <div className="absolute inset-[-6.25%_-6.94%]">
                <img alt="" className="block size-full max-w-none" src="/assets/shared/cursor-lock.svg" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <img
          alt=""
          className="block size-full max-w-none"
          src={state === "play" ? "/assets/shared/cursor-play.svg" : "/assets/shared/cursor-normal.svg"}
        />
      )}
    </div>
  );
}
