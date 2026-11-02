import { useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ViewCaseStudyButton } from "../components/CaseStudyButtons";
import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import { useFrameZoom } from "../site/frameZoom";
import { EMAIL } from "../site/navigation";

type JobSlug = "adobe" | "kohler" | "finra";

const JOBS: Record<JobSlug, { title: string; paragraphs: string[]; meta: [string, string][]; pairTop: number }> = {
  adobe: {
    title: "Adobe",
    paragraphs: [
      "As the first experience design intern for the Sales Velocity Team, I designed and proposed a comprehensive and gamified enablement solution to improve internal workflows with design tools across the global TPS organization.",
      "I learned to quickly adapt in an environment that experiences constant changes, and organize my time based on priorities I needed to address first. I also picked up new skills by integrating AI tools into my design workflows!",
    ],
    meta: [["Role", "Experience Design Intern"], ["Date", "Summer 2026"], ["Time", "12 Weeks"]],
    pairTop: 834,
  },
  kohler: {
    title: "Kohler Co. X SCAD Pro",
    paragraphs: [
      "I worked alongside 12 UX designers to build the\ninformation architecture and functional prototype for a Kohler Konnect wellness product centered around key personas. I also designed key UX/UI features that aligned with stakeholder goals after extensive feedback rounds.",
    ],
    meta: [["Role", "User Experience Designer"], ["Date", "Spring 2026"], ["Time", "10 Weeks"]],
    pairTop: 842,
  },
  finra: {
    title: "FINRA x SCAD Pro",
    paragraphs: [
      "I co-led efforts with 21 designers to redesign a unified logged-in experience and dashboard driven by user and competitor research. Additionally, I presented prototypes to FINRA leadership and iterated designs based on their feedback",
    ],
    meta: [["Role", "User Experience Design Lead"], ["Date", "Winter 2026"], ["Time", "10 Weeks"]],
    pairTop: 842,
  },
};

const PIC_TOP = 149;
const PIC_HEIGHT = 1667;
// The first screen shows the frame down to just past the top of the two
// pictures under the main one (they start at 983), so they peek in as in
// Figma. Short windows scale the page down to fit that much.
const FIRST_SCREEN = 1060;

// "<brand> brief" frames (1506 x 2219). The job description stays put while
// the pictures on the right scroll past, until the pictures run out.
export default function Job() {
  const { brand } = useParams();
  const navigate = useNavigate();
  const job = JOBS[brand as JobSlug];
  const widthZoom = useFrameZoom();
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const zoom = Math.min(widthZoom, windowHeight / FIRST_SCREEN);
  // Window height in frame pixels: the job description is centred in it.
  const screenHeight = windowHeight / zoom;

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [brand]);

  if (!job) return <Navigate replace to="/" />;

  const img = (name: string) => `/assets/work/${brand}-${name}`;
  const ext = brand === "adobe" ? "jpg" : "png";

  return (
    <div className="page-clip">
      <div className="frame-page h-[1896px] bg-white" style={{ zoom }}>
        <SiteNav />

        <div className="absolute top-0 left-[139px] w-[495px]" style={{ height: PIC_TOP + PIC_HEIGHT }}>
          <div className="sticky top-0 flex w-full flex-col justify-center" style={{ height: screenHeight }}>
            <div className="flex w-full flex-col items-start gap-[91px]">
              <div className="flex w-full flex-col items-start gap-[8px]">
                <button
                  className="flex items-center gap-[13.5px]"
                  onClick={() => navigate("/", { state: { scrollTo: "work" } })}
                  type="button"
                >
                  <span className="flex rotate-180 items-center justify-center">
                    <span className="relative h-0 w-[15.375px]">
                      <span className="absolute inset-[-8.28px_-7.32%]">
                        <img alt="" className="block size-full max-w-none" src="/assets/shared/back-arrow.svg" />
                      </span>
                    </span>
                  </span>
                  <span className="nm h-[31.875px] w-[63.75px] text-left text-[20px] leading-[1.32] tracking-[-0.4px] text-black">Back</span>
                </button>
                <p className="nm flex h-[92px] w-full flex-col justify-end text-[40px] leading-[1.32] tracking-[-0.8px] text-black">{job.title}</p>
                <div className="nm w-full text-[20px] leading-[1.32] tracking-[-0.4px] whitespace-pre-wrap text-black">
                  {job.paragraphs.map((paragraph, index) => (
                    <p className={index ? "mt-[26.4px]" : ""} key={index}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex w-[461px] flex-col items-start gap-[16px] text-[15px] leading-normal text-black">
                {job.meta.map(([label, value]) => (
                  <div className="flex w-full items-center gap-[15px]" key={label}>
                    <p className="nm h-[19px] w-[99px] shrink-0 opacity-50">{label}</p>
                    <p className="nm-medium h-[19px] min-w-px flex-1">{value}</p>
                  </div>
                ))}
              </div>
              {/* No public case study for client work yet. */}
              <ViewCaseStudyButton locked />
            </div>
          </div>
        </div>

        <div className="absolute left-[764px] w-[609px]" style={{ top: PIC_TOP, height: PIC_HEIGHT }}>
          <img alt="" className="absolute top-0 left-0 h-[805px] w-[609px] max-w-none" src={img("main.png")} />
          <div className="absolute left-0 flex items-center gap-[37px]" style={{ top: job.pairTop }}>
            <img alt="" className="h-[377px] w-[286px] max-w-none object-cover" src={img(`pair-1.${ext}`)} />
            <img alt="" className="h-[377px] w-[286px] max-w-none object-cover" src={img(`pair-2.${ext}`)} />
          </div>
          <div className="absolute top-[1256px] left-0 h-[411px] w-[609px] overflow-clip bg-black">
            <img alt="" className="absolute inset-0 block size-full max-w-none" src={img("nda-bg.png")} />
            <p className="nm absolute top-[47px] left-[49px] h-[63px] w-[510px] text-[40px] leading-[1.32] tracking-[-0.8px] text-white">OOPS, YOU HIT AN NDA...</p>
            <p className="nm absolute top-[110px] left-[49px] h-[52px] w-[508px] text-[20px] leading-[1.32] tracking-[-0.4px] text-white">
              That’s all I can show you for now, but feel free to reach out to me if you want to know more!
            </p>
            {/* Hover fills it white with black text and icon. */}
            <a
              className="absolute top-[202px] left-[49px] flex h-[66px] items-center gap-[13.5px] rounded-[40px] border-[0.375px] border-solid border-white px-[24px] py-[16px] text-white antialiased transition-colors duration-300 ease-in-out hover:bg-white hover:text-black"
              data-cursor="email"
              href={`mailto:${EMAIL}`}
            >
              <span className="nm text-[24px] leading-[1.32] tracking-[-0.48px] whitespace-nowrap">Email me!</span>
              <svg className="block size-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
                <path
                  d="M8.18503 9.81393C8.04169 9.67085 7.87087 9.55828 7.68285 9.48301L1.73535 7.09801C1.66434 7.06951 1.60375 7.01998 1.5617 6.95605C1.51965 6.89212 1.49816 6.81687 1.50012 6.74037C1.50208 6.66388 1.52739 6.58982 1.57266 6.52813C1.61792 6.46644 1.68098 6.42008 1.75335 6.39526L16.0034 1.52026C16.0698 1.49625 16.1417 1.49167 16.2107 1.50705C16.2797 1.52243 16.3428 1.55713 16.3928 1.60709C16.4427 1.65705 16.4774 1.72021 16.4928 1.78917C16.5082 1.85813 16.5036 1.93005 16.4796 1.99651L11.6046 16.2465C11.5798 16.3189 11.5334 16.3819 11.4717 16.4272C11.41 16.4725 11.336 16.4978 11.2595 16.4997C11.183 16.5017 11.1077 16.4802 11.0438 16.4382C10.9799 16.3961 10.9303 16.3355 10.9019 16.2645L8.51685 10.3155C8.44124 10.1276 8.32836 9.95701 8.18503 9.81393ZM8.18503 9.81393L16.3904 1.61026"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            </a>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}
