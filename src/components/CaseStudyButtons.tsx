// "view case study button": idle is white with a black hairline; hover goes
// black with white text and stroke, and the arrow nudges back and forth.
// A locked button keeps its idle look and shows the lock cursor instead.
export function ViewCaseStudyButton({
  locked = false,
  onClick,
}: {
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`group flex h-[66px] shrink-0 antialiased items-center gap-[13.5px] rounded-[40px] border-[0.375px] border-solid border-black bg-white px-[24px] py-[16px] transition-colors duration-300 ease-in-out ${
        locked ? "" : "hover:border-white hover:bg-black"
      }`}
      data-cursor={locked ? "locked" : undefined}
      onClick={locked ? undefined : onClick}
      type="button"
    >
      <span
        className={`nm text-[24px] leading-[1.32] tracking-[-0.48px] whitespace-nowrap text-black transition-colors duration-300 ${
          locked ? "" : "group-hover:text-white"
        }`}
      >
        View Case Study
      </span>
      <span
        className={`relative size-[17.625px] shrink-0 ${
          locked ? "" : "group-hover:animate-[arrow-nudge_1s_ease-in-out_infinite] group-hover:invert"
        }`}
      >
        <img alt="" className="absolute inset-0 block size-full max-w-none" src="/assets/shared/arrow.svg" />
      </span>
    </button>
  );
}

// "view next study button" (fast-forward icon), same hover treatment.
export function ViewNextStudyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Next case study"
      className="group relative h-[66px] w-[79.75px] antialiased shrink-0 rounded-[40px] border-[0.375px] border-solid border-black bg-white transition-colors duration-300 ease-in-out hover:border-white hover:bg-black"
      onClick={onClick}
      type="button"
    >
      <img
        alt=""
        className="absolute top-[22.5px] left-[22.5px] block h-[20.26px] w-[33.25px] max-w-none transition-opacity duration-300 group-hover:opacity-0"
        src="/assets/shared/next-study-icon.svg"
      />
      <img
        alt=""
        className="absolute top-[22.5px] left-[22.5px] block h-[20.26px] w-[33.25px] max-w-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        src="/assets/shared/next-study-icon-white.svg"
      />
    </button>
  );
}
