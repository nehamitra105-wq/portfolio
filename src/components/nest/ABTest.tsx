import { Anim, IO, type Tracks } from "./timeline";
import { CURSOR_X, CURSOR_X_TIMES, CURSOR_Y, CURSOR_Y_TIMES } from "./cursorPath";

const src = (name: string) => `/assets/nest/ab/${name}`;

// "A/B testing graphic" (1044 x 483). On the page timeline the cursor tries
// out the dial states on both thermostats, then picks B: A slides away, B
// slides to the centre, and the loop resets.
const A_CARD: Tracks = {
  opacity: { values: [1, 1, 0, 0, 1], times: [0, 0.7204, 0.7567, 0.9668, 1], ease: ["linear", "easeOut", "linear", "easeInOut"] },
  x: { values: [0, 0, -351, -351, 0, 0], times: [0, 0.7204, 0.775, 0.9467, 0.9603, 1], ease: ["linear", "easeInOut", "linear", "linear", "linear"] },
};
const A_DIALS: Tracks = {
  y: {
    values: [0, 0, -238, -238, -486, -486, 0, 0],
    times: [0, 0.1458, 0.2042, 0.2792, 0.3375, 0.9468, 0.9605, 1],
    ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "linear", "linear"],
  },
};
const B_CARD: Tracks = {
  opacity: { values: [1, 1, 0, 0, 1], times: [0, 0.8876, 0.9466, 0.9668, 1], ease: ["linear", IO, IO, IO] },
  x: { values: [0, 0, -281, -281, 0, 0], times: [0, 0.7207, 0.7756, 0.9478, 0.9631, 1], ease: ["linear", "easeInOut", "linear", "linear", "linear"] },
};
const B_DIALS: Tracks = {
  y: {
    values: [0, 0, -238.7, -238.7, -477.7, -477.7, 0.3, 0.3],
    times: [0, 0.4253, 0.4836, 0.5703, 0.6286, 0.9471, 0.964, 1],
    ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "linear", "linear"],
  },
};
const A_CLICK: Tracks = {
  opacity: {
    values: [0, 0, 1, 0, 0, 1, 0, 0],
    times: [0, 0.4086, 0.4194, 0.4325, 0.5527, 0.5635, 0.5766, 1],
    ease: ["linear", IO, IO, IO, IO, IO, "linear"],
  },
};
const B_CLICK: Tracks = {
  opacity: {
    values: [0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    times: [0, 0.0983, 0.1091, 0.1222, 0.2412, 0.252, 0.2651, 0.6545, 0.6957, 0.8874, 0.9468, 1],
    ease: ["linear", IO, IO, IO, IO, IO, IO, IO, IO, IO, "linear"],
  },
  x: { values: [0, 0, -281, -281], times: [0, 0.7207, 0.7747, 1], ease: ["linear", "easeInOut", "linear"] },
};
const CURSOR: Tracks = {
  opacity: { values: [1, 1, 0, 0, 1], times: [0, 0.715, 0.7422, 0.9668, 1], ease: ["linear", IO, IO, IO] },
  x: { values: CURSOR_X, times: CURSOR_X_TIMES },
  y: { values: CURSOR_Y, times: CURSOR_Y_TIMES },
};

const karla = "font-['Karla:Regular'] font-normal";
const karlaMedium = "font-['Karla:Medium'] font-medium";

function Img({ className, name }: { className: string; name: string }) {
  return (
    <div className={className}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(name)} />
    </div>
  );
}

// Dial ring segments drawn as quarter arcs inside a rotated square.
function Arc({ className, inner, rotate, name }: { className: string; inner: string; rotate: string; name: string }) {
  return (
    <div className={`absolute flex items-center justify-center ${className}`}>
      <div className={`flex-none ${rotate}`}>
        <div className={`relative ${inner.split("|")[0]}`}>
          <div className={`absolute ${inner.split("|")[1]}`}>
            <img alt="" className="block max-w-none size-full" src={src(name)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Dots({
  left,
  right,
  top,
  rightTop = top,
  name,
  flipName,
}: {
  left: number[];
  right: number[];
  top: number[];
  rightTop?: number[];
  name: string;
  flipName: string;
}) {
  return (
    <>
      {left.map((x, i) => (
        <div className="absolute size-[9.975px]" key={`l${i}`} style={{ left: x, top: top[i] }}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(name)} />
        </div>
      ))}
      {right.map((x, i) => (
        <div className="absolute flex items-center justify-center size-[9.975px]" key={`r${i}`} style={{ left: x, top: rightTop[i] }}>
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="relative size-[9.975px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(flipName)} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function SixtyEightDial() {
  // "Dial 20"/"Dial 22": ring of graduated dots, 72°.
  return (
    <div className="bg-white overflow-clip relative rounded-[350px] shrink-0 size-[245px]">
      <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[82.48px] text-[#1e1e1e] text-[10.64px] text-center top-[48.89px] w-[17.955px]`}>68</p>
      <p className={`-translate-x-1/2 absolute ${karla} h-[38.57px] leading-[normal] left-[126.37px] text-[#1e1e1e] text-[43.225px] text-center top-[86.14px] w-[63.175px]`}>72°</p>
      <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[17.955px] leading-[normal] left-[calc(50%-0.79px)] text-[#1e1e1e] text-[13.3px] text-center top-[141.33px] w-[77.805px]`}>In 15 min</p>
      <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%-0.13px)] size-[257.34px] top-[-6.3px]">
        <div className="-scale-y-100 flex-none rotate-120">
          <div className="relative size-[188.386px]">
            <div className="absolute bottom-1/2 left-[34.05%] right-0 top-0">
              <img alt="" className="block max-w-none size-full" src={src("ellipse-234.svg")} />
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%-0.13px)] size-[257.34px] top-[-6.3px]">
        <div className="flex-none rotate-60">
          <div className="relative size-[188.386px]">
            <div className="absolute bottom-1/2 left-[38.63%] right-0 top-0">
              <img alt="" className="block max-w-none size-full" src={src("ellipse-235.svg")} />
            </div>
          </div>
        </div>
      </div>
      <Img className="-translate-x-1/2 absolute left-[calc(50%-3.45px)] size-[16.625px] top-[20.96px]" name="distance.svg" />
      <Img className="-translate-x-1/2 absolute left-[calc(50%-28.52px)] size-[14.364px] top-[26.29px]" name="distance-1.svg" />
      <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%+24.15px)] size-[19.95px] top-[23.63px]">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="relative size-[19.95px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("distance-2.svg")} />
          </div>
        </div>
      </div>
      <Img className="absolute left-[66.85px] size-[11.97px] top-[36.92px]" name="current-temp.svg" />
      <Img className="absolute left-[162.61px] size-[23.275px] top-[35.59px]" name="set-temp.svg" />
      <div className="absolute inset-[81.3%_47.47%_11.91%_46.29%]">
        <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
          <img alt="" className="block max-w-none size-full" src={src("heating.svg")} />
        </div>
      </div>
    </div>
  );
}

function DialA() {
  return (
    <div className="absolute bg-white flex flex-col items-center left-0 top-0 w-[245px]">
      {/* Dial 19 */}
      <div className="bg-white overflow-clip relative rounded-[350px] shrink-0 size-[245px]">
        <div className="absolute left-[50.4px] size-[144.2px] top-[52.5px]">
          <div className="absolute inset-[-2.91%]">
            <img alt="" className="block max-w-none size-full" src={src("ellipse-123.svg")} />
          </div>
        </div>
        <p className={`absolute ${karla} inset-[34.86%_34.57%_43.51%_39.71%] leading-[normal] text-[#1e1e1e] text-[45.5px] whitespace-nowrap`}>75°</p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[18.9px] leading-[normal] left-[calc(50%+0.35px)] text-[#1e1e1e] text-[14px] text-center top-[138.6px] w-[81.9px]`}>In 15 min</p>
        <div className="absolute h-[154.7px] left-[27.86px] top-[29.61px] w-[151.2px]">
          <div className="absolute inset-[-1.45%_-3.33%_-5.07%_-3.33%]">
            <img alt="" className="block max-w-none size-full" src={src("ellipse-124.svg")} />
          </div>
        </div>
        <Img className="absolute left-[163.52px] size-[30.937px] top-[29.91px]" name="cool-sun.svg" />
        <div className="absolute left-[43.26px] size-[16.8px] top-[182.21px]">
          <div className="absolute inset-[0_-16.67%_-33.33%_-16.67%]">
            <img alt="" className="block max-w-none size-full" src={src("current-temp-2.svg")} />
          </div>
        </div>
        <div className="absolute inset-[68.57%_47.43%_24.29%_46%]">
          <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
            <img alt="" className="block max-w-none size-full" src={src("heating-3.svg")} />
          </div>
        </div>
      </div>
      {/* Dial 20 */}
      <div className="bg-white overflow-clip relative rounded-[350px] shrink-0 size-[245px]">
        <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[82.48px] text-[#1e1e1e] text-[10.64px] text-center top-[48.9px] w-[17.955px]`}>68</p>
        <p className={`-translate-x-1/2 absolute ${karla} h-[38.57px] leading-[normal] left-[126.37px] text-[#1e1e1e] text-[43.225px] text-center top-[86.14px] w-[63.175px]`}>72°</p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[17.955px] leading-[normal] left-[calc(50%-0.79px)] text-[#1e1e1e] text-[13.3px] text-center top-[141.33px] w-[77.805px]`}>In 15 min</p>
        <Arc className="-translate-x-1/2 left-[calc(50%-0.13px)] size-[257.34px] top-[-6.3px]" inner="size-[188.386px]|bottom-1/2 left-[34.05%] right-0 top-0" name="ellipse-236.svg" rotate="-scale-y-100 rotate-120" />
        <Arc className="-translate-x-1/2 left-[calc(50%-0.13px)] size-[257.34px] top-[-6.3px]" inner="size-[188.386px]|bottom-1/2 left-[38.63%] right-0 top-0" name="ellipse-237.svg" rotate="rotate-60" />
        <Img className="-translate-x-1/2 absolute left-[calc(50%-3.45px)] size-[16.625px] top-[20.96px]" name="distance-3.svg" />
        <Img className="-translate-x-1/2 absolute left-[calc(50%-28.52px)] size-[14.364px] top-[26.29px]" name="distance-4.svg" />
        <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%+24.15px)] size-[19.95px] top-[23.63px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="relative size-[19.95px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("distance-5.svg")} />
            </div>
          </div>
        </div>
        <Img className="absolute left-[66.85px] size-[11.97px] top-[36.92px]" name="current-temp-3.svg" />
        <Img className="absolute left-[162.61px] size-[23.275px] top-[35.6px]" name="set-temp-2.svg" />
        <div className="absolute inset-[81.3%_47.47%_11.91%_46.29%]">
          <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
            <img alt="" className="block max-w-none size-full" src={src("heating-4.svg")} />
          </div>
        </div>
      </div>
      {/* Dial 21 */}
      <div className="bg-white overflow-clip relative rounded-[350px] shrink-0 size-[232.75px]">
        <Img className="-translate-x-1/2 absolute left-[calc(50%+0.3px)] size-[14.364px] top-[17.88px]" name="distance-1.svg" />
        <Img className="-translate-x-1/2 absolute left-[calc(50%-22.84px)] size-[14.364px] top-[20.28px]" name="distance-1.svg" />
        <div className="-translate-x-1/2 absolute flex items-center justify-center left-[calc(50%+23.44px)] size-[14.364px] top-[20.28px]">
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="relative size-[14.364px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("distance-6.svg")} />
            </div>
          </div>
        </div>
        <Dots
          flipName="ellipse-28.svg"
          left={[43.26, 28.63, 19.99, 15.33, 19.32, 28.63, 43.26, 63.21]}
          name="ellipse-27.svg"
          right={[180.25, 194.22, 203.53, 208.18, 204.19, 194.22, 180.25, 160.3]}
          top={[44.15, 64.1, 87.38, 110.65, 135.26, 158.53, 178.82, 194.44]}
        />
        <Img className="absolute left-[63.21px] size-[14.364px] top-[29.52px]" name="current-temp-4.svg" />
        <Img className="absolute left-[150.99px] size-[23.275px] top-[24.87px]" name="set-temp.svg" />
        <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[76.84px] text-[#1e1e1e] text-[10.64px] text-center top-[44.15px] w-[17.955px]`}>68</p>
        <p className={`-translate-x-1/2 absolute ${karla} h-[38.57px] leading-[normal] left-[121.4px] text-[#1e1e1e] text-[43.225px] text-center top-[82.72px] w-[63.175px]`}>72°</p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[17.955px] leading-[normal] left-[calc(50%+0.37px)] text-[#1e1e1e] text-[13.3px] text-center top-[137.92px] w-[77.805px]`}>In 15 min</p>
        <div className="absolute inset-[84.11%_46.84%_8.74%_46.59%]">
          <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
            <img alt="" className="block max-w-none size-full" src={src("heating-1.svg")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DialB() {
  return (
    <div className="absolute bg-white flex flex-col items-center left-0 top-0 w-[245px]">
      <SixtyEightDial />
      {/* Dial 14 */}
      <div className="bg-white overflow-clip relative rounded-[350px] shrink-0 size-[232.75px]">
        <p className={`-translate-x-1/2 absolute ${karla} h-[38.57px] leading-[normal] left-[122.03px] text-[43.225px] text-black text-center top-[83.13px] w-[63.175px]`}>72°</p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[17.955px] leading-[normal] left-[calc(50%+1px)] text-[13.3px] text-black text-center top-[138.32px] w-[77.805px]`}>In 15 min</p>
        <Img className="absolute h-[160.265px] left-[15.96px] top-[44.55px] w-[202.825px]" name="dial.svg" />
        <div className="absolute inset-[84.29%_46.57%_8.57%_46.86%]">
          <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
            <img alt="" className="block max-w-none size-full" src={src("heating-1.svg")} />
          </div>
        </div>
        <Arc className="left-[-30.59px] size-[294.461px] top-[-30.59px]" inner="size-[208.215px]|inset-[2.13%_1.33%_55.87%_58.65%]" name="ellipse-241.svg" rotate="-rotate-45" />
        <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[80.13px] text-[10.64px] text-black text-center top-[48.54px] w-[17.955px]`}>68</p>
      </div>
      {/* Temperature Dials */}
      <div className="bg-white h-[245px] overflow-clip relative rounded-[500px] shrink-0 w-full">
        <Dots
          flipName="ellipse-30.svg"
          left={[48.49, 33.86, 25.22, 20.56, 24.55, 33.86, 48.49, 68.44]}
          name="ellipse-26.svg"
          right={[199.43, 184.1, 208.74, 213.39, 209.4, 199.43, 185.46, 165.52]}
          rightTop={[68.78, 49, 92.05, 115.32, 139.93, 163.2, 183.15, 199.1]}
          top={[48.83, 68.78, 92.05, 115.32, 139.93, 163.2, 183.48, 199.1]}
        />
        <Img className="absolute left-[177.1px] size-[23.272px] top-[42px]" name="set-temp-1.svg" />
        <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[82.8px] text-[16.8px] text-black text-center top-[50.4px] whitespace-nowrap`}>68</p>
        <p className={`-translate-x-1/2 absolute ${karla} h-[75.6px] leading-[normal] left-[131.95px] text-[70px] text-black text-center top-[77px] w-[107.1px]`}>73°</p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] left-[calc(50%+0.1px)] text-[16.8px] text-black text-center top-[151.2px] whitespace-nowrap`}>Press to Confirm</p>
        <Arc className="left-[-12.51px] size-[269.599px] top-[-12.51px]" inner="size-[197.642px]|inset-[8.2%_0_41.15%_75.38%]" name="ellipse-223.svg" rotate="rotate-[-60.3deg]" />
        <Img className="absolute left-[68.44px] size-[14.362px] top-[32.1px]" name="current-temp-1.svg" />
        <div className="-translate-x-1/2 absolute bottom-[11.28%] left-[calc(50%+0.77px)] top-[82.28%] w-[14.53px]">
          <div className="absolute inset-[-2%_-2.17%_-2.01%_-2.17%]">
            <img alt="" className="block max-w-none size-full" src={src("heating-2.svg")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Thermostat({ side, dials, sideClass }: { side: "A" | "B"; dials: Tracks; sideClass: string }) {
  return (
    <div className="bg-[#fafafa] flex items-center justify-between px-[57px] py-[20.44px] relative rounded-[20.44px] size-[483px]">
      <div className="relative rounded-[22.4px] shrink-0 size-[355.6px]">
        <div className={`-translate-x-1/2 -translate-y-1/2 absolute overflow-clip size-[245px] ${sideClass}`}>
          <Anim className="absolute left-0 top-0 w-[245px]" tracks={dials}>
            {side === "A" ? <DialA /> : <DialB />}
          </Anim>
        </div>
        <div className={`absolute size-[467.6px] top-[-55.3px] ${side === "A" ? "-translate-x-1/2 left-1/2" : "left-[-56px]"}`}>
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={src("overlay.png")} />
        </div>
      </div>
    </div>
  );
}

export default function ABTest({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="absolute h-[483px] w-[1044px] overflow-clip bg-white" style={style}>
      <Anim className="absolute left-[561px] top-0 w-[483px]" tracks={B_CARD}>
        <Thermostat dials={B_DIALS} side="B" sideClass="left-1/2 top-[calc(50%+0.7px)]" />
      </Anim>
      <Anim className="absolute left-0 top-0 w-[483px]" tracks={A_CARD}>
        <Thermostat dials={A_DIALS} side="A" sideClass="left-[calc(50%-0.3px)] top-1/2" />
      </Anim>
      <Anim className="absolute left-[494px] size-[60px] top-[351px]" tracks={CURSOR}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("cursor.svg")} />
      </Anim>
      <Anim className="absolute border border-[#767676] border-solid left-[561px] rounded-[20px] size-[483px] top-0" tracks={B_CLICK} />
      <Anim className="absolute border border-[#767676] border-solid left-0 rounded-[20px] size-[483px] top-0" tracks={A_CLICK} />
    </div>
  );
}
