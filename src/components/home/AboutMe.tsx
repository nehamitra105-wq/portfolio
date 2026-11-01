import Reveal from "../Reveal";
import CurrentlyPlaying from "./CurrentlyPlaying";

const A = "/assets/about";

function Rotated({
  box,
  rotate,
  size,
  radius = 0,
  src,
  crop,
}: {
  box: [number, number, number, number];
  rotate: number;
  size: [number, number];
  radius?: number;
  src: string;
  crop: string;
}) {
  const [left, top, width, height] = box;
  return (
    <div className="absolute flex items-center justify-center" style={{ left, top, width, height }}>
      <div className="flex-none" style={{ transform: `rotate(${rotate}deg)` }}>
        <div className="relative" style={{ width: size[0], height: size[1], borderRadius: radius }}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: radius }}>
            <img alt="" className={`absolute max-w-none ${crop}`} src={src} />
          </div>
        </div>
      </div>
    </div>
  );
}

// "about me" (1964 x 1105, placed at x -214 so it bleeds past the frame).
export default function AboutMe({ style }: { style: React.CSSProperties }) {
  return (
    <section className="absolute h-[1105px] w-[1964px]" id="about" style={style}>
      <Rotated box={[1063.41, 398.05, 857.152, 864.261]} crop="top-[-14.25%] left-[-22.58%] h-[120.54%] w-[156.23%]" radius={248} rotate={-61.28} size={[643.006, 625.075]} src={`${A}/img-9292.jpg`} />
      <Rotated box={[0, 638, 795.81, 466.502]} crop="top-[-50.31%] left-[-23%] h-[190.68%] w-[146.71%]" rotate={-0.79} size={[789.595, 455.644]} src={`${A}/img-9295.jpg`} />
      <Rotated box={[244, 548.58, 196.807, 201.422]} crop="top-[-164.3%] left-[-139.73%] h-[305.58%] w-[423.01%]" rotate={-12.36} size={[164.182, 170.232]} src={`${A}/img-9049.jpg`} />
      <Rotated box={[230.74, -151.23, 867.314, 721.424]} crop="top-0 left-[-14.88%] h-[104.7%] w-[114.88%]" rotate={-108.97} size={[507.619, 742.654]} src={`${A}/img-9048.jpg`} />

      {/* photo card */}
      <Rotated box={[353.58, 212.36, 289.709, 433.649]} crop="top-[-13.35%] left-[-27.01%] h-[126.38%] w-[154.38%]" radius={11} rotate={-5.26} size={[253.009, 412.203]} src={`${A}/card-bg.jpg`} />
      <Rotated box={[374.55, 262.07, 251.589, 364.656]} crop="top-[-0.51%] left-[-2.5%] h-[101.54%] w-[105.8%]" rotate={-5.26} size={[220.83, 345.879]} src={`${A}/headshot.png`} />
      <Rotated box={[346.87, 208.49, 306.824, 441.542]} crop="top-[-12.5%] left-[-23.42%] h-[125%] w-[145.52%]" rotate={-5.26} size={[269.608, 418.602]} src={`${A}/photo-card.png`} />

      <Rotated box={[626, 295, 212.509, 212.005]} crop="top-[-59.49%] left-[-25.03%] h-[270.22%] w-[353.23%]" radius={150.56} rotate={38.58} size={[152.629, 149.444]} src={`${A}/img-9049.jpg`} />
      <Rotated box={[1217, -99, 747.374, 772.321]} crop="top-[-20.07%] left-0 h-[120.07%] w-[111.97%]" radius={305.492} rotate={-129.7} size={[635.058, 444.145]} src={`${A}/img-9290.jpg`} />
      <Reveal className="absolute inset-0">
        <p className="nm absolute top-[328px] left-[857px] text-[32px] leading-[1.32] tracking-[-0.64px] whitespace-nowrap text-black">
          A little bit about me!
        </p>

      <p className="nm absolute top-[390px] left-[857px] h-[168px] w-[579px] text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-pre-wrap text-black">
        {`I’m an intentional, curious, and playful product designer with a background in graphic design. I’m a sucker for trying new ways to express the numerous ideas I have in my head, I ask a lot of questions and I love using motion graphics to bring things to life. I like to write books on the side, so there’s a huge storytelling element to a lot of my work. `}
        <br aria-hidden />
        <br aria-hidden />
        When I’m not hunched over my computer, I’m probably getting my butt kicked in a pilates class, making new jewelry stacks, doodling in my Figma files, and hearing colors in music (audio-visual synesthesia :D)!
      </p>
      </Reveal>

      <CurrentlyPlaying />
    </section>
  );
}
