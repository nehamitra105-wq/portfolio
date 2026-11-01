import { useEffect, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { FRAME_WIDTH } from "../../site/frameZoom";

// Section anchors (frame y) the "nest nav" items scroll to. Concept jumps to
// the visual direction block, as in the prototype.
export const NEST_SECTIONS = [
  { label: "Overview", top: 1042 },
  { label: "Challenge", top: 4838 },
  { label: "Concept", top: 5761 },
  { label: "Design", top: 8237 },
  { label: "System", top: 12881 },
  { label: "Final Product", top: 13795 },
];

const SCROLL_OFFSET = 42; // section lands level with the "Home" link
const ease = "1.25s cubic-bezier(0.22, 1, 0.36, 1)";

// "nav" (162 x 412 at 100, 1007): the Home link and the "nest nav" panel. It
// sticks while the case study scrolls, highlights the section in view and
// scrolls to a section on click.
export default function NestNav({ frameRef, height }: { frameRef: RefObject<HTMLDivElement | null>; height: number }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      // The frame may be zoomed down to fit the window.
      const zoom = rect.width / FRAME_WIDTH;
      const y = (-rect.top + window.innerHeight * 0.35) / zoom;
      let index = 0;
      NEST_SECTIONS.forEach((section, i) => {
        if (y >= section.top) index = i;
      });
      setActive(index);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [frameRef]);

  const scrollTo = (top: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const zoom = rect.width / FRAME_WIDTH;
    window.scrollTo({ top: rect.top + window.scrollY + (top - SCROLL_OFFSET) * zoom, behavior: "smooth" });
  };

  return (
    <div className="absolute top-[1007px] left-[100px] w-[162px]" style={{ height }}>
      <nav aria-label="Case study sections" className="sticky top-0 h-[412px] w-[162px]">
        <button className="absolute top-[35px] left-0 flex items-center gap-[13.5px]" onClick={() => navigate("/")} type="button">
          <span className="flex rotate-180 items-center justify-center">
            <span className="relative h-0 w-[15.375px]">
              <span className="absolute inset-[-8.28px_-7.32%]">
                <img alt="" className="block size-full max-w-none" src="/assets/shared/back-arrow.svg" />
              </span>
            </span>
          </span>
          <span className="nm h-[28px] w-[64px] text-left text-[20px] leading-[1.32] tracking-[-0.4px] text-black">Home</span>
        </button>

        <div className="absolute top-[83px] left-0 h-[294px] w-[162px] rounded-[20px] bg-[#ececec]">
          {NEST_SECTIONS.map((section, i) => {
            const selected = i === active;
            // Rows are 45px apart; the selected text sits a little lower and
            // shifts right to make room for the dot (the first idle row is
            // the exception, as in the component).
            const textTop = selected ? 3 : i === 0 ? 5 : 1;
            return (
              <button
                aria-current={selected ? "true" : undefined}
                className="absolute left-[24px] h-[25px] w-[115px] text-left"
                key={section.label}
                onClick={() => scrollTo(section.top)}
                style={{ top: 22 + 45 * i }}
                type="button"
              >
                <span
                  className="absolute top-[9.5px] left-0 size-[6px] rounded-full bg-black"
                  style={{ opacity: selected ? 1 : 0, transition: `opacity ${ease}` }}
                />
                <span
                  className="nm absolute w-[155px] text-[16px] leading-normal whitespace-nowrap text-black"
                  style={{
                    left: selected ? 19 : 0,
                    top: textTop,
                    opacity: selected ? 1 : 0.5,
                    transition: `left ${ease}, top ${ease}, opacity ${ease}`,
                  }}
                >
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
