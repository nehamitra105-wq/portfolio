import { useNavigate } from "react-router-dom";
import PillButton from "./PillButton";
import { EMAIL, LINKEDIN_URL, RESUME_URL, goToSection } from "../site/navigation";
import { FRAME_WIDTH, useFooterZoom } from "../site/frameZoom";

export const FOOTER_HEIGHT = 323;

const linkText =
  "nm h-[32px] w-[97px] shrink-0 text-center text-[16px] leading-[1.32] tracking-[-0.32px] text-black";

// The home page footer. It always spans the browser: the 1506 x 323 design
// scales with the window (so the cropped "neha mitra" stays cropped the same
// way), and the link group and the Resume/LinkedIn group sit 30px from each
// edge with auto space between them. The gallery passes its own Gallery
// handler so the falling guy can restart.
export default function SiteFooter({
  onGalleryClick,
  style,
}: {
  onGalleryClick?: () => void;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const zoom = useFooterZoom();

  return (
    <footer
      className="relative w-full overflow-hidden bg-white"
      id="contact"
      style={{ height: FOOTER_HEIGHT * zoom, ...style }}
    >
      <div className="absolute top-0 left-0" style={{ width: FRAME_WIDTH, height: FOOTER_HEIGHT, zoom }}>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-[30px]">
          <div className="mt-[3px] flex items-center gap-[60px]">
            <button className={linkText} onClick={() => goToSection(navigate, "shelves")} type="button">
              Work
            </button>
            <button
              className={linkText}
              onClick={onGalleryClick ?? (() => navigate("/gallery"))}
              type="button"
            >
              Gallery
            </button>
            <button className={linkText} onClick={() => goToSection(navigate, "about")} type="button">
              About
            </button>
            <PillButton className="w-[79px]" href={`mailto:${EMAIL}`}>
              Email
            </PillButton>
          </div>
          <div className="flex items-center gap-[20px]">
            <PillButton className="w-[112px]" href={RESUME_URL}>
              Resume
            </PillButton>
            <PillButton className="w-[112px]" href={LINKEDIN_URL}>
              Linkedin
            </PillButton>
          </div>
        </div>
        <div className="absolute top-[113px] left-[157px] h-[248px] w-[1371.909px]">
          <div className="absolute inset-[-3.27%_-0.59%]">
            <img alt="neha mitra" className="block size-full max-w-none" src="/assets/shared/footer-name.svg" />
          </div>
        </div>
        <p className="nm absolute top-[193px] left-[38.6px] w-[199.826px] text-[22.203px] leading-[1.32] tracking-[-0.4441px] text-black opacity-20">
          mehl
        </p>
        <p className="nm absolute top-[228.25px] left-[38.6px] w-[199.826px] text-[26.643px] leading-[1.32] tracking-[-0.5329px] text-black opacity-40">
          nagha
        </p>
        <p className="nm absolute top-[270.71px] left-[38.6px] w-[199.826px] text-[31.084px] leading-[1.32] tracking-[-0.6217px] text-black opacity-70">
          naeha
        </p>
        {[
          { top: 210.76, width: 68.829, src: "footer-line-1" },
          { top: 246.29, width: 89.922, src: "footer-line-2" },
          { top: 294.72, width: 105.463, src: "footer-line-3" },
        ].map(({ top, width, src }) => (
          <div className="absolute left-[30px] h-0" key={src} style={{ top, width }}>
            <div className="absolute inset-[-1.67px_0_0_0]">
              <img alt="" className="block size-full max-w-none" src={`/assets/shared/${src}.svg`} />
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
