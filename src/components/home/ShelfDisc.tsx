import Disc from "../Disc";
import type { CaseStudy } from "../../site/caseStudies";

// "<name> shelf disc" component (467 x 640). On hover the disc slides up out
// of its case and the case rises with it (SMART_ANIMATE 1.25s, "slow").
// Only the button's own box takes the hover: the turned disc's picture pokes
// out past it, and letting that count made the CD bob up and down as it
// moved in and out from under the cursor.
export default function ShelfDisc({
  study,
  hidden = false,
  onSelect,
  style,
}: {
  study: CaseStudy;
  hidden?: boolean;
  onSelect: (study: CaseStudy) => void;
  style?: React.CSSProperties;
}) {
  const ease = "1.25s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <button
      aria-label={study.caseStudyPath ? `Open the ${study.brief.title} case study` : `${study.brief.title}: case study in progress`}
      className="group absolute h-[640px] w-[467px]"
      data-cursor={study.caseStudyPath ? "play" : "progress"}
      onClick={() => onSelect(study)}
      style={{ ...style, visibility: hidden ? "hidden" : undefined }}
      type="button"
    >
      <img
        alt=""
        className="pointer-events-none absolute left-0 top-[225px] h-[415px] w-[467px] max-w-none group-hover:top-[101px]"
        draggable={false}
        src="/assets/home/shelf-case.png"
        style={{ transition: `top ${ease}` }}
      />
      {/* The hover variant also turns the disc a little (the bars go vertical). */}
      <Disc
        className="pointer-events-none absolute left-[52px] top-[240px] size-[383.61px] group-hover:top-0 group-hover:-rotate-45"
        disc={study.shelfDisc}
        style={{ transition: `top ${ease}, rotate ${ease}` }}
      />
    </button>
  );
}
