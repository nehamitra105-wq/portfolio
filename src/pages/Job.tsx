import { useLayoutEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ViewCaseStudyButton } from "../components/CaseStudyButtons";
import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
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

// "<brand> brief" frames (1506 x 2219). The job description stays put while
// the pictures on the right scroll past, until the pictures run out.
export default function Job() {
  const { brand } = useParams();
  const navigate = useNavigate();
  const job = JOBS[brand as JobSlug];

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [brand]);

  if (!job) return <Navigate replace to="/" />;

  const img = (name: string) => `/assets/work/${brand}-${name}`;
  const ext = brand === "adobe" ? "jpg" : "png";

  return (
    <div className="page-clip">
      <div className="frame-page h-[1896px] bg-white">
        <SiteNav />

        <div className="absolute top-0 left-[139px] w-[495px]" style={{ height: PIC_TOP + PIC_HEIGHT }}>
          <div className="sticky top-0 flex w-full flex-col items-start gap-[91px] pt-[149px]">
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
                <span className="nm h-[31.875px] w-[63.75px] text-left text-[24px] leading-[1.32] tracking-[-0.48px] text-black">Back</span>
              </button>
              <p className="nm flex h-[92px] w-full flex-col justify-end text-[48px] leading-[1.32] tracking-[-0.96px] text-black">{job.title}</p>
              <div className="nm w-full text-[20px] leading-[1.32] tracking-[-0.4px] whitespace-pre-wrap text-black">
                {job.paragraphs.map((paragraph, index) => (
                  <p className={index ? "mt-[26.4px]" : ""} key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex w-[461px] flex-col items-start gap-[16px] text-[20px] leading-normal text-black">
              {job.meta.map(([label, value]) => (
                <div className="flex w-full items-center gap-[15px]" key={label}>
                  <p className="nm h-[30.4px] w-[98.8px] shrink-0 opacity-50">{label}</p>
                  <p className="nm-medium h-[30.4px] min-w-px flex-1">{value}</p>
                </div>
              ))}
            </div>
            {/* No public case study for client work yet. */}
            <ViewCaseStudyButton locked />
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
            <a
              className="absolute top-[202px] left-[49px] flex h-[66px] items-center gap-[13.5px] rounded-[40px] border-[0.375px] border-solid border-white px-[24px] py-[16px]"
              href={`mailto:${EMAIL}`}
            >
              <span className="nm text-[24px] leading-[1.32] tracking-[-0.48px] whitespace-nowrap text-white">Email me!</span>
              <img alt="" className="block size-[18px] max-w-none" src="/assets/work/send.svg" />
            </a>
          </div>
        </div>

      </div>
      <SiteFooter />
    </div>
  );
}
