// "view case study button": idle is white with a black hairline; hover goes
// black with white text and stroke, and the arrow nudges back and forth.
// A locked button keeps its idle look with a lock in place of the arrow, and
// the normal cursor.
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
        {locked ? (
          // The lock from the cursor states.
          <svg className="absolute inset-0 size-full" fill="none" viewBox="-1 -0.5 12.25 12.25">
            <path
              d="M1.625 5.125H8.625C9.17729 5.125 9.625 5.57272 9.625 6.125V9.625C9.625 10.1773 9.17729 10.625 8.625 10.625H1.625C1.07272 10.625 0.625 10.1773 0.625 9.625V6.125C0.625 5.57272 1.07272 5.125 1.625 5.125Z"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.1}
            />
            <path
              d="M2.625 5.125V3.125C2.625 2.46196 2.88839 1.82607 3.35723 1.35723C3.82607 0.888392 4.46196 0.625 5.125 0.625C5.78804 0.625 6.42393 0.888392 6.89277 1.35723C7.36161 1.82607 7.625 2.46196 7.625 3.125V5.125"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.1}
            />
          </svg>
        ) : (
          <img alt="" className="absolute inset-0 block size-full max-w-none" src="/assets/shared/arrow.svg" />
        )}
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
