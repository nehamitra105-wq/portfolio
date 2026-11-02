import { useEffect, useState, type CSSProperties } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ViewCaseStudyButton, ViewNextStudyButton } from "../components/CaseStudyButtons";
import { CASE_STUDIES, caseStudyBySlug } from "../site/caseStudies";
import { BRIEF_FRAME, briefLayout } from "../site/briefLayout";
import { FLIGHT_MS, useDiscFlight } from "../site/discFlight";

// The brief text and graphic slide in on the same slow curve as the rest of
// the site. Coming from home they start this long before the CD lands.
const ENTER_MS = 1250;
const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OVERLAP_MS = 500;
// Skipping to the next study fades the current one out first.
const LEAVE_MS = 400;

function useBriefLayout() {
  const [layout, setLayout] = useState(briefLayout);
  useEffect(() => {
    const handleResize = () => setLayout(briefLayout());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return layout;
}

// "<name> brief" frames (1506 x 982). The disc sits cut off in the top-left
// corner; the brief text slides in from the right and the graphic from below.
// Skipping to the next study fades this one out, then the next one slides in.
export default function Brief() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const study = caseStudyBySlug(slug);
  const { flight } = useDiscFlight();
  const [entered, setEntered] = useState(false);
  const [discReady, setDiscReady] = useState(false);
  const [leavingTo, setLeavingTo] = useState<string | null>(null);
  const [enterDelay, setEnterDelay] = useState(0);
  const layout = useBriefLayout();
  const fromHome = Boolean((location.state as { fromHome?: boolean } | null)?.fromHome);

  useEffect(() => {
    window.scrollTo(0, 0);
    setEntered(false);
    setLeavingTo(null);
    // Still flying in from home: show the brief's own disc when the CD lands,
    // and start the text and graphic towards the end of the flight.
    const flying = fromHome && flight && flight.study.slug === slug ? flight.startedAt + FLIGHT_MS - performance.now() : 0;
    setDiscReady(flying <= 0 && fromHome);
    setEnterDelay(Math.max(0, flying - OVERLAP_MS));
    const discTimer = flying > 0 ? window.setTimeout(() => setDiscReady(true), flying) : 0;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(discTimer);
    };
    // Only when the study changes; the flight is read once on arrival.
  }, [slug]);

  if (!study) return <Navigate replace to="/" />;

  const { brief } = study;
  const next = CASE_STUDIES[(CASE_STUDIES.indexOf(study) + 1) % CASE_STUDIES.length];
  const goToNext = () => {
    if (leavingTo) return;
    setLeavingTo(next.slug);
    window.setTimeout(() => navigate(`/brief/${next.slug}`), LEAVE_MS);
  };

  // A 1506 x 982 frame-sized layer, scaled to fit, with its corner at (left, top).
  const frameBox = (left: number, top: number): CSSProperties => ({
    left,
    top,
    width: BRIEF_FRAME.width,
    height: BRIEF_FRAME.height,
    transform: `scale(${layout.scale})`,
    transformOrigin: "0 0",
  });

  // Hidden (before entering), sliding in, or fading out to the next study.
  const motion = (hidden: string, delay: number): CSSProperties =>
    leavingTo
      ? { opacity: 0, transform: "none", transition: `opacity ${LEAVE_MS}ms ease-out` }
      : entered
        ? {
            opacity: 1,
            transform: "none",
            transition: `transform ${ENTER_MS}ms ${ENTER_EASE} ${delay}ms, opacity ${ENTER_MS}ms ${ENTER_EASE} ${delay}ms`,
          }
        : { opacity: 0, transform: hidden, transition: "none" };

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      {/* The disc stays in the window's top-left corner. From home the flying
          CD lands here; otherwise it fades in. */}
      <div className="absolute" style={frameBox(0, 0)}>
        <img
          alt=""
          className="absolute top-0 left-0 block max-w-none"
          draggable={false}
          key={`disc-${slug}`}
          src={brief.disc.src}
          style={{
            width: brief.disc.width,
            height: brief.disc.height,
            ...(leavingTo
              ? { opacity: 0, transition: `opacity ${LEAVE_MS}ms ease-out` }
              : fromHome
                ? { opacity: discReady ? 1 : 0, transition: "none" }
                : { opacity: entered ? 1 : 0, transition: `opacity ${ENTER_MS}ms ${ENTER_EASE}` }),
          }}
        />
      </div>

      {/* The graphic sits on the window's bottom edge, under the text. */}
      <div className="absolute" style={frameBox(layout.left, layout.top * 2)}>
        <img
          alt=""
          className="absolute block max-w-none"
          src={brief.graphic.src}
          style={{
            left: brief.graphic.left,
            top: brief.graphic.top,
            width: brief.graphic.width,
            height: brief.graphic.height,
            ...motion("translateY(420px)", enterDelay + 150),
          }}
        />
      </div>

      <div className="absolute" style={frameBox(layout.left, layout.top)}>
        <div
          className="absolute top-[152px] left-[820px]"
          style={motion("translateX(240px)", enterDelay)}
        >
          <button className="flex items-center gap-[13.5px]" onClick={() => navigate("/")} type="button">
            <span className="flex rotate-180 items-center justify-center">
              <span className="relative h-0 w-[15.375px]">
                <span className="absolute inset-[-8.28px_-7.32%]">
                  <img alt="" className="block size-full max-w-none" src="/assets/shared/back-arrow.svg" />
                </span>
              </span>
            </span>
            <span className="nm h-[31.875px] w-[63.75px] text-left text-[20px] leading-[1.32] tracking-[-0.4px] text-black">Back</span>
          </button>

          <div className="mt-[44.1px] flex w-[593px] flex-col items-start gap-[48px]">
            <div className="nm flex w-full flex-col items-start gap-[8px] text-black">
              <p className="h-[30.8px] w-full text-[24px] leading-normal">{brief.title}</p>
              <p className="w-full text-[40px] leading-[1.32] tracking-[-0.8px]">{brief.headline}</p>
            </div>
            <div className="flex items-center gap-[16px]">
              {brief.tags.map((tag) => (
                <div className="flex items-center justify-center rounded-[24px] border-[0.4px] border-solid border-black px-[16px] py-[8px]" key={tag}>
                  <p className="nm text-center text-[20px] leading-normal whitespace-nowrap text-black">{tag}</p>
                </div>
              ))}
            </div>
            <div className="flex w-[285px] flex-col items-start gap-[16px] text-[15px] leading-normal text-black">
              {brief.meta.map(([label, value]) => (
                <div className="flex items-center gap-[15px]" key={label}>
                  <p className="nm h-[19px] w-[99px] shrink-0 opacity-50">{label}</p>
                  <p className="nm-medium h-[19px] whitespace-nowrap">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-[20px]">
              <ViewCaseStudyButton
                locked={!study.caseStudyPath}
                onClick={() => study.caseStudyPath && navigate(study.caseStudyPath)}
              />
              <ViewNextStudyButton onClick={goToNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
