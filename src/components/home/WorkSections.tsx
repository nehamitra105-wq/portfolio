import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Brand = "adobe" | "kohler" | "finra" | "reforma";

// Where each brand icon goes. Reforma's case study is on the shelf, so it
// opens that brief.
const BRAND_LINKS: Record<Brand, string> = {
  adobe: "/work/adobe",
  kohler: "/work/kohler",
  finra: "/work/finra",
  reforma: "/brief/reforma",
};

const RECORD_POSITIONS: Record<Brand, { left: number; top: number }> = {
  adobe: { left: 0, top: 0.46 },
  kohler: { left: 106, top: 0.46 },
  finra: { left: 1, top: 104.46 },
  reforma: { left: 106, top: 104.46 },
};

const KOHLER_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 145.56 82.162' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-5.686 8.2162 -14.556 -10.143 129.64 -0.0000068442)'><stop stop-color='rgba(39,68,96,1)' offset='0'/><stop stop-color='rgba(33,47,61,0.615)' offset='0.39233'/><stop stop-color='rgba(26,26,26,0.23)' offset='0.78467'/></radialGradient></defs></svg>\")";

function BrandRecord({ brand }: { brand: Brand }) {
  if (brand === "adobe") {
    return <img alt="Adobe" className="absolute inset-0 block size-full max-w-none" src="/assets/home/adobe-record.svg" />;
  }
  if (brand === "kohler") {
    return (
      <div className="absolute inset-0 overflow-clip rounded-[16px] bg-black">
        <div className="absolute top-0 left-[-44.75px] h-[83.456px] w-[146.857px]">
          <div className="absolute top-0 left-0 h-[82.162px] w-[145.563px]" style={{ backgroundImage: KOHLER_GRADIENT }} />
          <div className="absolute top-[1.29px] left-[1.29px] h-[82.162px] w-[145.563px] opacity-26" style={{ backgroundImage: KOHLER_GRADIENT }} />
        </div>
        <div className="absolute top-[calc(50%+0.05px)] left-[calc(50%-0.02px)] h-[14.336px] w-[67.648px] -translate-x-1/2 -translate-y-1/2">
          <img alt="Kohler" className="absolute inset-0 block size-full max-w-none" src="/assets/home/kohler-logo.svg" />
        </div>
      </div>
    );
  }
  if (brand === "finra") {
    return (
      <div className="absolute inset-0 overflow-clip rounded-[16px] bg-black">
        <div className="absolute top-[calc(50%-0.97px)] left-[calc(50%+19.34px)] h-[85.402px] w-[149.172px] -translate-x-1/2 -translate-y-1/2">
          <img alt="" className="absolute inset-0 block size-full max-w-none" src="/assets/home/finra-bg.svg" />
        </div>
        <div className="absolute top-1/2 left-1/2 h-[15.872px] w-[59.29px] -translate-x-1/2 -translate-y-1/2 overflow-clip">
          <div className="absolute inset-[0.49%_0_0.48%_0]">
            <img alt="FINRA" className="absolute inset-0 block size-full max-w-none" src="/assets/home/finra-logo.svg" />
          </div>
        </div>
      </div>
    );
  }
  return <img alt="Reforma" className="absolute inset-0 block size-full max-w-none rounded-[16px]" src="/assets/home/reforma-record.png" />;
}

// "brand hovers": hovering a record tilts it 15deg and shows the hint below.
function BrandHovers() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Brand | null>(null);

  return (
    <div className="relative h-[188px] w-[189px] shrink-0">
      <p
        className="nm absolute left-[calc(50%-93.5px)] h-[27px] w-[188px] text-[16px] leading-[1.32] tracking-[-0.32px] text-black transition-all duration-300 ease-in-out"
        style={{ top: hovered ? 208 : 178, opacity: hovered ? 1 : 0 }}
      >
        Click to see case studies!
      </p>
      {(Object.keys(RECORD_POSITIONS) as Brand[]).map((brand) => (
        <button
          aria-label={`See ${brand} work`}
          className="absolute size-[83.456px] transition-transform duration-300 ease-in-out"
          key={brand}
          onBlur={() => setHovered(null)}
          onClick={() => navigate(BRAND_LINKS[brand])}
          onFocus={() => setHovered(brand)}
          onMouseEnter={() => setHovered(brand)}
          onMouseLeave={() => setHovered(null)}
          style={{ ...RECORD_POSITIONS[brand], transform: hovered === brand ? "rotate(-15deg)" : undefined }}
          type="button"
        >
          <BrandRecord brand={brand} />
        </button>
      ))}
    </div>
  );
}

function Line({ left, top }: { left: number; top: number }) {
  return (
    <div className="absolute h-0 w-[108px]" style={{ left, top }}>
      <div className="absolute inset-[-1px_0_0_0]">
        <img alt="" className="block size-full max-w-none" src="/assets/home/section-line.svg" />
      </div>
    </div>
  );
}

const rowText = "nm-medium shrink-0 whitespace-pre";
const lines = "flex w-[799px] shrink-0 flex-col items-start text-[20px] leading-[1.32] tracking-[-0.4px] text-black";
const title = "nm h-[63px] text-[48px] leading-[1.32] tracking-[-0.96px] text-black";

const EXPAND_EASE = "500ms cubic-bezier(0.22, 1, 0.36, 1)";

// A role line with a plus on the right: clicking it opens the description
// underneath (at most four lines) and the plus turns into a minus.
function ExpandableRow({
  org,
  role,
  dates,
  description,
  gap = 9,
}: {
  org: string;
  role: string;
  dates: string;
  description: string;
  gap?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button aria-expanded={open} className="flex w-full items-center gap-[179px] text-left" onClick={() => setOpen((value) => !value)} type="button">
        <span className="flex w-[389px] shrink-0 items-center" style={{ gap }}>
          <span className={rowText}>{`${org}   /`}</span>
          <span className="nm min-w-px flex-1">{role}</span>
        </span>
        <span className="nm h-[26px] w-[231px] shrink-0">{dates}</span>
        <span aria-hidden className="absolute top-[13px] left-[calc(100%+24px)] size-[22px] -translate-y-1/2">
          <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-black" />
          <span
            className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-black"
            style={{ rotate: `${open ? 90 : 0}deg`, opacity: open ? 0 : 1, transition: `rotate ${EXPAND_EASE}, opacity ${EXPAND_EASE}` }}
          />
        </span>
      </button>
      <div className="grid" style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0, transition: `grid-template-rows ${EXPAND_EASE}, opacity ${EXPAND_EASE}` }}>
        <div className="overflow-hidden">
          <p className="nm line-clamp-4 w-[568px] pt-[24px] text-[16px] leading-[1.32] tracking-[-0.32px]">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Reports how much taller the rows have grown from their closed height, so
// the sections below can move down to make room.
function useExtraHeight(onExtraChange?: (extra: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !onExtraChange) return;
    const base = el.offsetHeight;
    const observer = new ResizeObserver(() => onExtraChange(el.offsetHeight - base));
    observer.observe(el);
    return () => observer.disconnect();
  }, [onExtraChange]);
  return ref;
}

export function WorkBlock({ style, onExtraChange }: { style: React.CSSProperties; onExtraChange?: (extra: number) => void }) {
  const rowsRef = useExtraHeight(onExtraChange);
  return (
    <div className="absolute flex w-[1311px] items-start gap-[156px]" id="work" style={style}>
      <div className="flex w-[356px] shrink-0 flex-col items-start gap-[40px]">
        <p className={title}>WORK</p>
        <BrandHovers />
      </div>
      <div className={`${lines} gap-[80px]`} ref={rowsRef}>
        <ExpandableRow
          dates="June - Sept 2026"
          description="Proposed and designed a layered solution to improve internal workflows with design tools across the global Technical Pre-Sales Organization (details under NDA)."
          org="Adobe"
          role="Experience Design Intern"
        />
        <ExpandableRow
          dates="March - May 2026"
          description="Worked alongside 12 UX designers to build the architecture and functional prototype for a Kohler Konnect wellness product. Designed key UX/UI features aligned with stakeholder goals (details under NDA)."
          org="Kohler x SCAD Pro"
          role="UX Designer"
        />
        <ExpandableRow
          dates="Jan - March 2026"
          description="Co-led efforts with 21 designers to redesign a unified logged-in experience driven by user and competitor research. Presented prototypes to FINRA leadership and iterated designs based on their feedback."
          gap={11}
          org="FINRA x SCAD Pro"
          role="UX Design Lead"
        />
        <ExpandableRow
          dates="June - Dec 2026"
          description="Collaborated with the founder to create customer journeys and sitemaps to visualize the user flow. Created a new brand style guide and visual identity. Designed wireframes for the mobile app and desktop experience."
          org="Reforma AI"
          role="UX Design Intern"
        />
      </div>
      <Line left={356} top={0} />
    </div>
  );
}

function Badge({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <div className="relative size-[83.456px] shrink-0 overflow-clip rounded-[16px]" style={{ background: bg }}>
      {children}
    </div>
  );
}

function SchoolRow({ school, degree, dates }: { school: string; degree: string; dates: string }) {
  return (
    <div className="flex w-full items-start justify-between">
      <div className="flex w-[338px] shrink-0 flex-col items-start gap-[10px]">
        <p className="nm-medium h-[26px] w-full whitespace-pre">{`${school}  /`}</p>
        <p className="nm h-[26px] w-full">{degree}</p>
      </div>
      <p className="nm h-[42px] w-[231px] shrink-0">{dates}</p>
    </div>
  );
}

export function EducationBlock({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute flex w-[1311px] items-start gap-[156px]" style={style}>
      <div className="flex w-[356px] shrink-0 flex-col items-start gap-[40px]">
        <p className={title}>EDUCATION</p>
        <div className="flex items-center gap-[22px]">
          <Badge bg="#046648">
            <div className="absolute top-[17px] left-[13px] h-[49px] w-[57px] overflow-hidden">
              {/* Scaled up a touch so the image's dark border falls outside the crop. */}
              <img alt="SCAD" className="absolute top-[-3%] left-[-19.15%] h-[106%] w-[139.1%] max-w-none" src="/assets/home/scad-badge.png" />
            </div>
          </Badge>
          <Badge bg="#212129">
            <div className="absolute top-[8px] left-[8px] size-[67px] overflow-hidden rounded-[425.5px]">
              <img alt="University of South Florida" className="absolute top-[-89.72%] left-[-50.42%] h-[279.91%] w-[198.52%] max-w-none" src="/assets/home/usf-badge.png" />
            </div>
          </Badge>
        </div>
      </div>
      <Line left={356} top={0} />
      <div className={`${lines} gap-[61px]`}>
        <SchoolRow dates="Sept 2024 - June 2027" degree="BFA User Experience Design" school="Savannah College of Art and Design" />
        <SchoolRow dates="Aug 2023 - May 2024" degree="BFA Graphic Arts" school="University of South Florida" />
      </div>
    </div>
  );
}

const PODCAST_URL = "https://open.spotify.com/show/300FcmRPc5Pe92SdTYFH6A?si=2747da33443d4828";

// The FLUX badge opens the podcast; hovering tilts it like the work records
// and shows the hint below.
function FluxBadge() {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <p
        className="nm pointer-events-none absolute left-0 h-[27px] w-[188px] text-[16px] leading-[1.32] tracking-[-0.32px] text-black transition-all duration-300 ease-in-out"
        style={{ top: hovered ? 103.5 : 73.5, opacity: hovered ? 1 : 0 }}
      >
        check out my podcast!
      </p>
      <a
        aria-label="SCAD FLUX podcast on Spotify"
        className="relative shrink-0 transition-transform duration-300 ease-in-out"
        href={PODCAST_URL}
        onBlur={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        rel="noreferrer"
        style={{ transform: hovered ? "rotate(-15deg)" : undefined }}
        target="_blank"
      >
        <Badge bg="#004aff">
          <img alt="SCAD FLUX" className="absolute top-[calc(50%-0.23px)] left-[calc(50%-0.23px)] size-[59px] max-w-none -translate-x-1/2 -translate-y-1/2" src="/assets/home/flux-logo.svg" />
        </Badge>
      </a>
    </>
  );
}

export function InvolvementBlock({ style, onExtraChange }: { style: React.CSSProperties; onExtraChange?: (extra: number) => void }) {
  const rowsRef = useExtraHeight(onExtraChange);
  return (
    <div className="absolute flex w-[1311px] items-start gap-[156px]" style={style}>
      <div className="flex w-[356px] shrink-0 flex-col items-start gap-[40px]">
        <p className={title}>INVOLVEMENT</p>
        <div className="relative flex items-center gap-[22px]">
          <FluxBadge />
          <Badge bg="#000">
            <img alt="Figma" className="absolute top-[calc(50%-0.23px)] left-[calc(50%-0.23px)] size-[57px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover" src="/assets/home/figma-badge.png" />
          </Badge>
        </div>
      </div>
      <div className={`${lines} gap-[80px]`} ref={rowsRef}>
        <ExpandableRow
          dates="March 2025 - Present"
          description="Co-host of a student-led podcast to empower student voices at SCAD UX. Have casual discussions about current UX and design trends with guests. Assist with editing and promoting the podcast on social media platforms."
          gap={11}
          org="SCAD FLUX"
          role="Podcast Officer"
        />
        <ExpandableRow
          dates="Aug 2025 - Present"
          description="Selected as part of the inaugural cohort of student leaders, building a community of student designers and promoting Figma at SCAD. Grow adoption of Figma through design events and engaging community activities."
          gap={11}
          org="Figma"
          role="Campus Leader"
        />
      </div>
      <Line left={356} top={1} />
    </div>
  );
}
