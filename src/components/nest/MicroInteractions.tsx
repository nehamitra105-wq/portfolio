import { Anim, IO, type Ease, type Track, type Tracks } from "./timeline";

const src = (name: string) => `/assets/nest/micro/${name}`;
const karla = "font-['Karla:Regular'] font-normal";
const karlaMedium = "font-['Karla:Medium'] font-medium";

// Opacity fades used throughout, as [values, times] pairs on the 12s loop.
const fade = (values: number[], times: number[], ease: Track["ease"] = "linear"): Tracks => ({
  opacity: { values, times, ease },
});
const SWAP_EASE: Ease[] = ["linear", IO, IO, IO, "linear"];

function Img({ className, name, style }: { className: string; name: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(name)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// "temp slider" (510 x 242): both handles are dragged in turn and the range
// numbers tick over.

function SliderNumber({ tracks, children, className = "" }: { tracks: Tracks; children: string; className?: string }) {
  return (
    <Anim
      className={`-translate-x-1/2 absolute ${karla} leading-[22px] text-[25px] text-black text-center top-[calc(50%-11px)] whitespace-nowrap ${className}`}
      tracks={tracks}
    >
      {children}
    </Anim>
  );
}

function Handle({ className, tracks, children }: { className: string; tracks: Tracks; children: React.ReactNode }) {
  return (
    <Anim className={`relative shrink-0 size-[48px] ${className}`} tracks={tracks}>
      <div className="absolute left-0 size-[48px] top-0">
        <div className="absolute inset-[-11.46%_-15.63%_-19.79%_-15.63%]">
          <img alt="" className="block max-w-none size-full" src={src("slider-ellipse.svg")} />
        </div>
      </div>
      {children}
    </Anim>
  );
}

function PressedHandle({ left, tracks, popup, before, after, times }: {
  left: number;
  tracks: Tracks;
  popup: string;
  before: string;
  after: string;
  times: number[];
}) {
  return (
    <Anim className="absolute size-[48px] top-[3px]" style={{ left }} tracks={tracks}>
      <div className="absolute h-[125px] left-[-6px] top-[-77px] w-[60px]">
        <div className="absolute inset-[-4.4%_-12.5%_-7.6%_-12.5%]">
          <img alt="" className="block max-w-none size-full" src={src(popup)} />
        </div>
      </div>
      {[before, after].map((value, index) => (
        <Anim
          className={`-translate-x-1/2 absolute ${karla} leading-[22px] left-[24px] text-[32px] text-black text-center top-[-58px] whitespace-nowrap`}
          key={value}
          tracks={fade(index ? [0, 0, 1, 1] : [1, 1, 0, 0], times, ["linear", IO, "linear"])}
        >
          {value}
        </Anim>
      ))}
    </Anim>
  );
}

function TempSlider() {
  return (
    <div className="absolute bg-[#fafafa] h-[242px] left-0 rounded-[20px] top-0 w-[510px]">
      <div className="absolute h-[54px] left-[83px] top-[94px] w-[345px]">
        <div className="absolute bg-[#eee] h-[54px] left-0 rounded-[30px] top-0 w-[345px]" />
        <Anim
          className="absolute bg-black flex items-center justify-between left-[100px] p-[3px] rounded-[40px] top-0 w-[174px]"
          tracks={{
            width: {
              values: [174, 174, 128, 128, 144, 144, 174, 174],
              times: [0, 0.0167, 0.0556, 0.0944, 0.1204, 0.2241, 0.25, 1],
              ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
            },
            x: { values: [0, 0, 46, 46, 0, 0], times: [0, 0.0167, 0.0556, 0.1593, 0.1852, 1], ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"] },
          }}
        >
          <Handle className="" tracks={fade([1, 1, 0, 0, 1, 1], [0, 0.0165, 0.0168, 0.0556, 0.0559, 1], ["linear", IO, "easeInOut", IO, "linear"])}>
            <SliderNumber className="left-[calc(50%+0.5px)]" tracks={fade([1, 1, 0, 0, 1, 1], [0, 0.0165, 0.0168, 0.1595, 0.1852, 1], SWAP_EASE)}>67</SliderNumber>
            <SliderNumber className="left-[calc(50%+0.5px)]" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.0556, 0.0559, 0.1596, 0.1852, 1], SWAP_EASE)}>70</SliderNumber>
          </Handle>
          <Handle className="" tracks={fade([1, 1, 0, 0, 1, 1], [0, 0.0944, 0.0946, 0.1205, 0.1206, 1], ["linear", IO, "easeInOut", IO, "linear"])}>
            <SliderNumber className="left-1/2" tracks={fade([1, 1, 0, 0, 1, 1], [0, 0.0944, 0.0946, 0.2241, 0.25, 1], SWAP_EASE)}>75</SliderNumber>
            <SliderNumber className="left-[calc(50%+0.5px)]" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.1205, 0.1207, 0.1594, 0.1851, 1], SWAP_EASE)}>76</SliderNumber>
            <SliderNumber className="left-1/2" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.1593, 0.1852, 0.2244, 0.25, 1], SWAP_EASE)}>74</SliderNumber>
          </Handle>
        </Anim>
        <Img className="-translate-y-1/2 absolute left-[323px] size-[7px] top-[calc(50%-0.5px)]" name="slider-high-limit.svg" />
        <Img className="-translate-y-1/2 absolute left-[15px] size-[7px] top-[calc(50%-0.5px)]" name="slider-low-limit.svg" />
        <PressedHandle
          after="70"
          before="67"
          left={103}
          popup="slider-popup.svg"
          times={[0, 0.0167, 0.0556, 1]}
          tracks={{
            ...fade([0, 0, 1, 1, 0, 0], [0, 0.0165, 0.0168, 0.0556, 0.0559, 1], ["linear", IO, "easeInOut", IO, "linear"]),
            x: { values: [0, 0, 46, 46], times: [0, 0.0168, 0.0556, 1], ease: ["linear", "easeInOut", "linear"] },
          }}
        />
        <PressedHandle
          after="76"
          before="75"
          left={223}
          popup="slider-popup-2.svg"
          times={[0, 0.0946, 0.1203, 1]}
          tracks={{
            ...fade([0, 0, 1, 1, 0, 0], [0, 0.0943, 0.0944, 0.1204, 0.1205, 1], ["linear", IO, "easeInOut", IO, "linear"]),
            x: { values: [0, 0, 16, 16], times: [0, 0.0944, 0.1204, 1], ease: ["linear", "easeInOut", "linear"] },
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "room pref delete" (510 x 337): a preference is swiped away, then the rest
// are selected and deleted, then one is added back.

const ROW_FADE_EASE: Ease[] = ["linear", IO, IO, "easeInOut", "linear"];
const ROW_MOVE_EASE: Ease[] = ["linear", "easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"];

function Separators() {
  return (
    <>
      {[0, 60.3].map((top) => (
        <div className="absolute h-0 left-0 w-[353.7px]" key={top} style={{ top }}>
          <div className="absolute inset-[-0.45px_0]">
            <img alt="" className="block max-w-none size-full" src={src("del-separator.svg")} />
          </div>
        </div>
      ))}
    </>
  );
}

function Arrow({ className, tracks }: { className: string; tracks?: Tracks }) {
  return (
    <Anim className={`absolute size-[22px] ${className}`} tracks={tracks ?? {}}>
      <div className="absolute inset-[36.25%_27.13%_36.85%_27.13%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("arrow-down-a.svg")} />
      </div>
    </Anim>
  );
}

// A selectable row ("Conference A"/"Conference C") that gains a check bubble.
function SelectableRow({ name, low, high, lowLeft, highLeft, rowTracks, bubbleTimes, fillTimes, check }: {
  name: string;
  low: string;
  high: string;
  lowLeft: number;
  highLeft: number;
  rowTracks: Tracks;
  bubbleTimes: number[];
  fillTimes: number[];
  check: string;
}) {
  return (
    <Anim className="absolute bg-[#fafafa] h-[60.3px] left-[78.65px] top-[139px] w-[353.7px]" tracks={rowTracks}>
      <Separators />
      <Anim
        className="absolute h-[40.6px] left-[-28.65px] top-[10px] w-[369.2px]"
        tracks={{ x: { values: [0, 0, 28, 28], times: bubbleTimes, ease: ["linear", "easeInOut", "linear"] } }}
      >
        <p className={`absolute ${karla} leading-[normal] left-[50.6px] text-[14.4px] text-black top-[12.5px] whitespace-nowrap`}>{name}</p>
        <Arrow className="left-[348px] top-0" tracks={fade([1, 1, 0, 0], bubbleTimes, ["linear", "easeInOut", "linear"])} />
        <p className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] text-[28.8px] text-black text-center top-[3.5px] whitespace-nowrap`} style={{ left: lowLeft }}>
          {low}
        </p>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] text-[28.8px] text-black text-center top-[3.5px] whitespace-nowrap`} style={{ left: highLeft }}>
          {high}
        </p>
        <Img className="absolute h-[7.2px] left-[209.9px] top-[17px] w-[54px]" name="del-range-icon-2.svg" />
        <Anim className="absolute flex items-center left-0 p-[10.8px] top-0" tracks={fade([0, 0, 1, 1], bubbleTimes, ["linear", "easeInOut", "linear"])}>
          <Anim
            className="border border-black border-solid overflow-clip relative rounded-[29px] shrink-0 size-[19px]"
            tracks={{ background: { values: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "#000", "#000"], times: fillTimes, ease: ["linear", IO, "linear"] } }}
          >
            <Anim
              className="absolute inset-[calc(32.63%-0.35px)_calc(23.5%-0.53px)_calc(35.79%-0.28px)_calc(26.5%-0.47px)]"
              tracks={fade([0, 0, 1, 1], fillTimes, ["linear", IO, "linear"])}
            >
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(check)} />
            </Anim>
          </Anim>
        </Anim>
      </Anim>
    </Anim>
  );
}

const TRASH_WHITE = fade([0, 0, 1, 1], [0, 0.2828, 0.3001, 1], ["linear", IO, "linear"]);

function TrashIcon({ white }: { white?: boolean }) {
  const name = (base: string) => src(`${base}${white ? "-white" : ""}.svg`);
  return (
    <>
      <img alt="" className="absolute block h-[13.59px] left-0 max-w-none top-[1.71px] w-[11.37px]" src={name("del-trash-body")} />
      {[7.43, 5.31, 3.19].map((left, index) => (
        <img
          alt=""
          className="absolute block h-[7.171px] max-w-none top-[5.99px] w-[0.749px]"
          key={left}
          src={name(`del-trash-line-${index + 1}`)}
          style={{ left }}
        />
      ))}
    </>
  );
}

function RoomPrefDelete() {
  return (
    <div className="absolute bg-[#fafafa] h-[337px] left-0 overflow-clip rounded-[20px] top-[282px] w-[510px]">
      <Anim
        className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] left-[254.5px] text-[#bebebe] text-[18px] text-center top-[158px] whitespace-nowrap`}
        tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.404, 0.4167, 0.444, 0.45, 1], ["linear", IO, IO, IO, "linear"])}
      >
        No Room Preferences
      </Anim>

      {/* "Add preference" / "Delete" button */}
      <Anim
        className="absolute h-[44px] left-[100px] rounded-[90px] top-[147px] w-[310.5px]"
        tracks={{
          opacity: { values: [0, 1, 1, 0, 0], times: [0, 0.0375, 0.4337, 0.4667, 1], ease: [IO, IO, IO, "linear"] },
          y: {
            values: [0, 113.5, 113.5, 89.5, 89.5, 7, 7],
            times: [0, 0.0375, 0.2001, 0.2196, 0.4337, 0.4667, 1],
            ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
          },
          background: {
            values: ["#1E1E1E", "#1E1E1E", "#EEE", "#EEE", "#F31501", "#F31501", "#C01708", "#F31501", "#F31501"],
            times: [0, 0.2423, 0.2677, 0.2828, 0.3, 0.3167, 0.325, 0.3333, 1],
            ease: ["linear", "easeInOut", IO, IO, IO, IO, IO, "linear"],
          },
        }}
      >
        <Anim className="absolute h-[17px] left-[94.75px] top-[14px] w-[121.919px]" tracks={fade([1, 1, 0, 0], [0, 0.2417, 0.2679, 1], ["linear", "easeInOut", "linear"])}>
          <div className="absolute flex inset-[9.06%_88.58%_9.06%_0] items-center justify-center">
            <div className="flex-none h-[19.6px] rotate-45 w-[19.6px]">
              <img alt="" className="block max-w-none size-full" src={src("del-x.svg")} />
            </div>
          </div>
          <p className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[72.42px] text-[14.4px] text-center text-white top-0 whitespace-nowrap`}>
            Add preference
          </p>
        </Anim>
        <Anim className="absolute h-[17px] left-[123.75px] top-[14px] w-[62.371px]" tracks={fade([0, 0, 1, 1], [0, 0.2423, 0.2673, 1], ["linear", "easeInOut", "linear"])}>
          <TrashIcon />
          <Anim className="absolute inset-0" tracks={TRASH_WHITE}>
            <TrashIcon white />
          </Anim>
          <Anim
            className={`-translate-x-1/2 absolute ${karla} leading-[normal] left-[41.37px] text-[14.4px] text-center top-0 whitespace-nowrap`}
            tracks={{ color: { values: ["#BEBEBE", "#BEBEBE", "#FFF", "#FFF"], times: [0, 0.2828, 0.3001, 1], ease: ["linear", IO, "linear"] } }}
          >
            Delete
          </Anim>
        </Anim>
      </Anim>

      {/* "Break Room A", swiped to delete */}
      <Anim
        className="absolute h-[60.3px] left-[78.65px] top-[139px] w-[353.7px]"
        tracks={{
          opacity: { values: [0, 0, 1, 1, 0, 0], times: [0, 0.0111, 0.0342, 0.182, 0.1897, 1], ease: ROW_FADE_EASE },
          y: { values: [0, 0, 47.7, 47.7, -12, -12], times: [0, 0.0111, 0.0342, 0.182, 0.1897, 1], ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"] },
        }}
      >
        <Separators />
        <Anim
          className="absolute h-[60px] left-[290.35px] overflow-clip top-0 w-[63px]"
          tracks={{
            width: { values: [63, 63, 343, 343], times: [0, 0.1693, 0.1824, 1], ease: ["linear", "easeInOut", "linear"] },
            x: { values: [-2, -2, -280, -280], times: [0, 0.1694, 0.1824, 1], ease: ["linear", "easeInOut", "linear"] },
            background: { values: ["#F31501", "#F31501", "#C01708", "#F31501", "#F31501"], times: [0, 0.126, 0.1397, 0.1533, 1], ease: ["linear", IO, IO, "linear"] },
          }}
        >
          <img alt="" className="absolute block h-[60px] left-0 max-w-none top-0 w-[63px]" src={src("del-trash-can.svg")} />
        </Anim>
        <Anim
          className="absolute bg-[#fafafa] h-[60px] left-[21.35px] overflow-clip top-0 w-[332px]"
          tracks={{
            opacity: { values: [1, 1, 0, 0], times: [0, 0.1694, 0.1823, 1], ease: ["linear", "easeInOut", "linear"] },
            x: { values: [0, 0, -63, -63, -342, -342], times: [0, 0.0667, 0.094, 0.1693, 0.182, 1], ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"] },
          }}
        >
          <p className={`absolute ${karla} leading-[normal] left-[0.25px] text-[14.4px] text-black top-[22.5px] whitespace-nowrap`}>Break Room A</p>
          <Arrow className="left-[297px] top-[20px]" />
          <div className="absolute flex gap-[9px] items-center left-[118.05px] top-[13.5px]">
            <p className={`${karlaMedium} leading-[normal] text-[28.8px] text-black text-center whitespace-nowrap`}>70</p>
            <Img className="h-[7.2px] relative shrink-0 w-[54px]" name="del-range-icon.svg" />
            <p className={`${karlaMedium} leading-[normal] text-[28.8px] text-black text-center whitespace-nowrap`}>75</p>
          </div>
        </Anim>
      </Anim>

      <SelectableRow
        bubbleTimes={[0, 0.2419, 0.2668, 1]}
        check="del-check.svg"
        fillTimes={[0, 0.2999, 0.316, 1]}
        high="74"
        highLeft={288.4}
        low="69"
        lowLeft={184.4}
        name="Conference C"
        rowTracks={{
          opacity: { values: [0, 0, 1, 1, 0, 0], times: [0, 0.0205, 0.0435, 0.3918, 0.4043, 1], ease: ROW_FADE_EASE },
          y: { values: [0, 0, -12.6, -12.6, 23.4, 23.4, -97, -97], times: [0, 0.0205, 0.0435, 0.2002, 0.2199, 0.3917, 0.4042, 1], ease: ROW_MOVE_EASE },
        }}
      />
      <SelectableRow
        bubbleTimes={[0, 0.2418, 0.2667, 1]}
        check="del-check-2.svg"
        fillTimes={[0, 0.2828, 0.3, 1]}
        high="73"
        highLeft={287.9}
        low="68"
        lowLeft={184.9}
        name="Conference A"
        rowTracks={{
          opacity: { values: [0, 0, 1, 1, 0, 0], times: [0, 0.0313, 0.0483, 0.3919, 0.4043, 1], ease: ROW_FADE_EASE },
          y: {
            values: [-59.15, -59.15, -72.9, -72.9, -36.9, -36.9, -102, -102],
            times: [0, 0.0313, 0.0483, 0.2001, 0.2193, 0.3919, 0.4043, 1],
            ease: ROW_MOVE_EASE,
          },
        }}
      />

      <Anim
        className="absolute bg-[#fafafa] flex h-[60px] items-center justify-between left-[79px] pt-[14px] top-[139px] w-[353px]"
        tracks={{
          y: {
            values: [0, -133, -133, -97, -97, 0, 0],
            times: [0, 0.0683, 0.2002, 0.2199, 0.4386, 0.4716, 1],
            ease: ["easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
          },
        }}
      >
        <p className={`${karlaMedium} leading-[normal] shrink-0 text-[18px] text-black text-center whitespace-nowrap`}>Room Preferences</p>
        <Anim
          className="flex items-center justify-center px-[9px] py-[11.7px] shrink-0 w-[63px]"
          tracks={fade([1, 1, 0.5, 1, 1], [0, 0.2333, 0.2417, 0.25, 1], ["linear", IO, IO, "linear"])}
        >
          <p className={`${karla} leading-[normal] text-[14.4px] text-black whitespace-nowrap`}>Select</p>
        </Anim>
      </Anim>

      {/* Confirmation dialog */}
      <Anim
        className="absolute bg-black h-[337px] left-0 rounded-[20px] top-0 w-[510px]"
        tracks={fade([0, 0, 0.5, 0.5, 0, 0, 0.5, 0.5, 0, 0], DIALOG_TIMES, DIALOG_EASE)}
      />
      <Anim className="absolute bg-white h-[130.4px] left-[118px] overflow-clip rounded-[16px] top-[97px] w-[276px]" tracks={fade([0, 0, 1, 1, 0, 0, 1, 1, 0, 0], DIALOG_TIMES, DIALOG_EASE)}>
        <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[18.4px] leading-[normal] left-[138px] text-[16px] text-black text-center top-[25.6px] w-[237.6px]`}>
          Delete Preference?
        </p>
        <div className="absolute flex gap-[25.6px] items-center left-[66.4px] top-[69.6px]">
          <div className="bg-white drop-shadow-[0px_1.6px_2.88px_rgba(0,0,0,0.2)] flex h-[35.2px] items-center justify-center p-[8px] rounded-[17.6px] shrink-0 w-[59.2px]">
            <p className={`${karlaMedium} leading-[normal] text-[#1e1e1e] text-[16px] text-center whitespace-nowrap`}>No</p>
          </div>
          <Anim
            className="drop-shadow-[0px_1.6px_2.88px_rgba(0,0,0,0.2)] flex h-[35.2px] items-center justify-center p-[8px] rounded-[17.6px] shrink-0 w-[59.2px]"
            tracks={{
              background: {
                values: ["#F31501", "#F31501", "#C01708", "#F31501", "#F31501", "#C01708", "#F31501", "#F31501"],
                times: [0, 0.1333, 0.147, 0.1607, 0.35, 0.3583, 0.3667, 1],
                ease: ["linear", IO, IO, IO, IO, IO, "linear"],
              },
            }}
          >
            <p className={`${karlaMedium} leading-[normal] text-[16px] text-center text-white whitespace-nowrap`}>Yes</p>
          </Anim>
        </div>
      </Anim>
    </div>
  );
}

const DIALOG_TIMES = [0, 0.1, 0.1273, 0.182, 0.2093, 0.325, 0.3333, 0.3917, 0.4167, 1];
const DIALOG_EASE: Ease[] = ["linear", IO, IO, IO, IO, IO, IO, IO, "linear"];

// ---------------------------------------------------------------------------
// "drag to see preferences" (346 x 619): the user drags their own bar to a
// new range, then the line-up scrolls along the average bar.

const PREF_SCROLL: Track = {
  values: [0, 0, -156.24, -156.24, 0, 0],
  times: [0, 0.4003, 0.46, 0.4895, 0.55, 1],
  ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"],
};

function RangeBar({ left, top, height, color }: { left: number; top: number; height: number; color: string }) {
  return <div className="absolute rounded-[26.4px] w-[47.52px]" style={{ left, top, height, background: color }} />;
}

function Label({ left, top, children, dark = true }: { left: number | string; top: number; children: string; dark?: boolean }) {
  return (
    <p
      className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] text-[17.6px] text-center whitespace-nowrap ${dark ? "text-[#1e1e1e]" : "text-black"}`}
      style={{ left, top }}
    >
      {children}
    </p>
  );
}

// Limbs exported with a flip or tilt, placed by their bounding box.
function Limb({ box, inner, transform, inset, name }: {
  box: [number, number, number, number];
  inner: [number, number];
  transform: string;
  inset?: string;
  name: string;
}) {
  const [left, top, width, height] = box;
  return (
    <div className="absolute flex items-center justify-center" style={{ left, top, width, height }}>
      <div className="flex-none" style={{ transform }}>
        <div className="relative" style={{ width: inner[0], height: inner[1] }}>
          {inset ? (
            <div className="absolute" style={{ inset }}>
              <img alt="" className="block max-w-none size-full" src={src(name)} />
            </div>
          ) : (
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={src(name)} />
          )}
        </div>
      </div>
    </div>
  );
}

function TempBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white drop-shadow-[0px_1.76px_3.3px_rgba(255,102,0,0.6)] flex flex-col items-center justify-center pb-[10px] pl-[11px] pr-[10px] pt-[9px] relative rounded-[19.8px] shrink-0 size-[39.6px] whitespace-nowrap">
      {children}
    </div>
  );
}

function DragPreferences() {
  return (
    <div className="absolute h-[619px] left-[550px] overflow-clip rounded-[22px] top-0 w-[346px]">
      <div className="absolute bg-[#fafafa] h-[619px] left-0 rounded-[22px] top-0 w-[346px]" />
      <div className="absolute h-[530px] left-0 top-[45px] w-[346px]">
        <Anim className="absolute h-[527.875px] left-[64.24px] top-0 w-[433.266px]" tracks={{ x: PREF_SCROLL }}>
          <Img className="absolute h-[43.875px] left-[132.81px] top-[397.76px] w-[11.19px]" name="dough-foot-1.svg" />
          <Img className="absolute h-[43.875px] left-[167.13px] top-[397.76px] w-[11.19px]" name="dough-foot-2.svg" />
          <Img className="absolute h-[43.875px] left-[254.25px] top-[334.4px] w-[11.19px]" name="dough-foot-1.svg" />
          <Limb box={[287.76, 334.4, 11.19, 43.875]} inner={[11.19, 43.875]} name="mary-foot-2.svg" transform="scaleY(-1) rotate(180deg)" />
          <Img className="absolute h-[43.875px] left-[193.53px] top-[484px] w-[11.19px]" name="dc-foot-1.svg" />
          <Img className="absolute h-[43.875px] left-[227.85px] top-[484px] w-[11.19px]" name="dc-foot-2.svg" />
          <Img className="absolute h-[44.755px] left-[72.09px] top-[293.04px] w-[11.19px]" name="sally-foot-1.svg" />
          <Img className="absolute h-[44.755px] left-[375.58px] top-[332.64px] w-[11.19px]" name="sally-foot-1.svg" />
          <Img className="absolute h-[44.755px] left-[106.41px] top-[293.04px] w-[11.19px]" name="sally-foot-2.svg" />
          <Img className="absolute h-[44.755px] left-[409.9px] top-[332.64px] w-[11.19px]" name="sally-foot-2.svg" />
          <Limb box={[126.64, 102.97, 10.727, 24.43]} inner={[4.663, 24.043]} inset="-5.49% -28.31%" name="dough-arm-1.svg" transform="rotate(15deg)" />
          <Img className="absolute h-[47.036px] left-[114.84px] top-[83.6px] w-[14.939px]" name="sally-arm-2.svg" />
          <Img className="absolute h-[47.036px] left-[418.33px] top-[159.72px] w-[14.938px]" name="sally-arm-3.svg" />
          <Limb box={[170.64, 216.92, 46.799, 105.6]} inner={[21.449, 103.533]} inset="-1.28% -6.16%" name="dc-arm.svg" transform="scaleY(-1) rotate(165.43deg)" />
          <Limb box={[176.88, 108.09, 18.335, 111.762]} inner={[18.335, 111.762]} name="dough-arm-2.svg" transform="scaleY(-1) rotate(180deg)" />
          <Limb box={[235.45, 160.6, 24.98, 80.52]} inner={[4.495, 82.026]} inset="-1.61% -29.37%" name="mary-arm.svg" transform="rotate(14.57deg)" />
          <Limb box={[290.58, 160.6, 24.66, 67.32]} inner={[7.94, 67.492]} inset="-1.96% -16.63%" name="mary-arm-1.svg" transform="scaleY(-1) rotate(165.43deg)" />
          <Limb box={[234.96, 237.46, 8.655, 89.025]} inner={[8.655, 89.025]} name="dc-arm-2.svg" transform="scaleY(-1) rotate(180deg)" />
          <Limb box={[60.83, 84.04, 17.376, 51.48]} inner={[4.43, 52.038]} inset="-2.54% -29.8%" name="sally-arm-1.svg" transform="rotate(14.57deg)" />
          <Limb box={[360.55, 160.16, 24.587, 66.88]} inner={[7.986, 67.026]} inset="-1.97% -16.53%" name="sally-arm-4.svg" transform="rotate(14.57deg)" />

          <RangeBar color="#c4e665" height={239.36} left={71.28} top={65.56} />
          <Label left={94.86} top={77.44}>76</Label>
          <Label left={94.62} top={271.04}>71</Label>
          <RangeBar color="#c4e665" height={261.36} left={374.77} top={88.88} />
          <Label left={398.53} top={101.85}>75</Label>
          <Label left={398.2} top={310.54}>70</Label>
          <RangeBar color="#edafff" height={223.52} left={253.44} top={143.88} />
          <Label dark={false} left={277.02} top={156.64}>74</Label>
          <Label dark={false} left={277.14} top={334.4}>69</Label>
          <Img className="absolute h-[49.28px] left-[198.88px] top-[264px] w-[34.629px]" name="dc.svg" />
          <RangeBar color="#7ad7ff" height={200.64} left={192.72} top={304.92} />
          <Label left={216.68} top={318.56}>70</Label>
          <Label left={216.42} top={471.68}>66</Label>
          <RangeBar color="#ffadca" height={316.8} left={132} top={88.44} />
          <Label left="calc(50% - 60.53px)" top={100.32}>75</Label>
          <Label left="calc(50% - 60.79px)" top={372.24}>68</Label>
          <Img className="absolute h-[49.287px] left-[69.52px] top-[24.64px] w-[49.914px]" name="sally.svg" />
          <Img className="absolute h-[49.287px] left-[373.12px] top-[48.4px] w-[49.914px]" name="sally-1.svg" />
          <Img className="absolute h-[48.447px] left-[137.28px] top-[48.4px] w-[36.737px]" name="dough.svg" />
          <Img className="absolute h-[49.28px] left-[256.08px] top-[102.96px] w-[41.179px]" name="group-3.svg" />
          <Img className="absolute h-[41.361px] left-[134.64px] top-[2.64px] w-[43.12px]" name="gold-crown.svg" />
          <Img className="absolute h-[20.984px] left-[80.96px] top-0 w-[26.399px]" name="bronze-crown.svg" />
          <Img className="absolute h-[43.875px] left-[314.97px] top-[397.76px] w-[11.19px]" name="dough-foot-1.svg" />
          <Img className="absolute h-[43.875px] left-[349.29px] top-[397.76px] w-[11.19px]" name="dough-foot-2.svg" />

          {/* The user's own figure, which is dragged */}
          <Anim
            className="absolute h-[116.895px] left-0 top-[23.32px] w-[52.624px]"
            tracks={{ y: { values: [0, 0, -61.32, -61.32, 0, 0], times: [0, 0.1667, 0.2147, 0.2479, 0.2917, 1], ease: ["linear", "easeInOut", "easeInOut", "easeInOut", "linear"] } }}
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("crown-face-arms.svg")} />
          </Anim>
          <Img className="absolute left-[60.76px] size-[7.92px] top-[131px]" name="john-arm-2.svg" />
          <Anim
            className="absolute bottom-[393.675px] left-[63.8px] w-[3.435px]"
            style={{ transformOrigin: "0% 100%" }}
            tracks={{
              height: { values: [16.575, 16.575, 75, 75, 16.575, 16.575], times: ARM_TIMES, ease: ["linear", "linear", "linear", "easeInOut", "linear"] },
              rotate: { values: [-39.605, -39.605, -8.677, -8.677, -39.605, -39.605], times: ARM_TIMES, ease: ["linear", IO, IO, IO, "linear"] },
              x: { values: [0, 0, -36.971, -36.971, 0, 0], times: ARM_TIMES, ease: ["linear", "linear", "linear", "easeInOut", "linear"] },
              y: { values: [0, 0, -45.553, -45.553, 0, 0], times: ARM_TIMES, ease: ["linear", "linear", "linear", "easeInOut", "linear"] },
            }}
          >
            <div className="absolute inset-[-7.97%_-38.44%]">
              <img alt="" className="block max-w-none size-full" src={src("arm.svg")} />
            </div>
          </Anim>
          <Anim
            className="absolute h-[43.875px] left-[11.37px] top-[446.16px] w-[45.51px]"
            tracks={{
              y: {
                values: [0, 0, -48.16, -48.16, 0, 0, -61.16, -61.16, 0, 0],
                times: [0, 0.0167, 0.0532, 0.0776, 0.1141, 0.1669, 0.2147, 0.2479, 0.2917, 1],
                ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear", "easeInOut", "linear"],
              },
            }}
          >
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={src("feet.svg")} />
          </Anim>
          <Img className="absolute h-[49.264px] left-[320.32px] top-[146.96px] w-[35.904px]" name="john.svg" />
          <Img className="absolute h-[21.856px] left-[358.16px] top-[209.44px] w-[13.936px]" name="john-arm-3.svg" />
          <Limb box={[303.6, 209.88, 13.936, 21.855]} inner={[13.936, 21.855]} name="john-arm-4.svg" transform="scaleY(-1) rotate(180deg)" />

          <Anim
            className={`absolute flex flex-col ${karlaMedium} h-[363px] items-center justify-between leading-[normal] left-[10.76px] py-[3.7px] rounded-[44px] text-[17.6px] text-black text-center top-[98px] w-[47px]`}
            tracks={{
              height: { values: [363, 363, 307, 307, 363, 363], times: [0, 0.0167, 0.0532, 0.0776, 0.1141, 1], ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"] },
              y: { values: [0, 0, -63, -63, 0, 0], times: [0, 0.1669, 0.2134, 0.2478, 0.2914, 1], ease: ["linear", "easeInOut", "linear", "easeInOut", "linear"] },
              background: {
                values: ["#FFC653", "#FFC653", "#E5A628", "#E5A628", "#FFC653", "#E5A628", "#E5A628", "#FFC653", "#FFC653"],
                times: [0, 0.1557, 0.1669, 0.2134, 0.2391, 0.2478, 0.2917, 0.2985, 1],
                ease: ["linear", IO, IO, IO, IO, IO, IO, "linear"],
              },
            }}
          >
            <TempBubble>
              <Anim className="h-[22px] relative shrink-0 w-[19px]" tracks={fade([1, 1, 0, 0, 1, 1], [0, 0.1663, 0.2144, 0.2482, 0.2914, 1], SWAP_EASE)}>
                75
              </Anim>
              <Anim className="-translate-x-1/2 absolute left-[calc(50%+1px)] top-[calc(50%-11.5px)]" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.1664, 0.2141, 0.2478, 0.2917, 1])}>
                77
              </Anim>
            </TempBubble>
            <TempBubble>
              <Anim
                className="relative shrink-0"
                tracks={fade([1, 1, 0, 0, 1, 1, 0, 0, 1, 1], [0, 0.0167, 0.0532, 0.0776, 0.1141, 0.1667, 0.2147, 0.2478, 0.2914, 1], ["linear", IO, IO, IO, IO, IO, IO, IO, "linear"])}
              >
                67
              </Anim>
              <Anim className="-translate-x-1/2 absolute left-[calc(50%+1.5px)] top-[calc(50%-10.5px)]" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.0167, 0.0532, 0.0776, 0.1141, 1], SWAP_EASE)}>
                68
              </Anim>
              <Anim className="-translate-x-1/2 absolute left-[calc(50%+2px)] top-[calc(50%-10.5px)]" tracks={fade([0, 0, 1, 1, 0, 0], [0, 0.1664, 0.2134, 0.2478, 0.2917, 1], SWAP_EASE)}>
                69
              </Anim>
            </TempBubble>
          </Anim>

          <RangeBar color="#ffc653" height={218.24} left={314.16} top={187.44} />
          <p className={`-translate-x-1/2 absolute ${karlaMedium} leading-[normal] left-[337.48px] size-[22px] text-[17.6px] text-black text-center top-[372.24px]`}>68</p>
          <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[20.24px] leading-[normal] left-[337.92px] text-[17.6px] text-black text-center top-[200.64px] w-[19.36px]`}>73</p>
        </Anim>
        <Img className="absolute h-[7.04px] left-0 top-[236.72px] w-[347.6px]" name="average-bar.svg" />

        {/* The average marker rides the bar while the line-up scrolls */}
        <Anim className="absolute inset-0" tracks={{ x: { ...PREF_SCROLL, values: [0, 0, 265.08, 265.08, -0.026, -0.026] } }}>
          <Img className="absolute left-[7.92px] size-[58.012px] top-[210.35px]" name="average-bg.svg" />
          <div className="absolute left-[13.2px] size-[47.52px] top-[215.6px]">
            <div className="absolute inset-[-14.81%]">
              <img alt="" className="block max-w-none size-full" src={src("average-grey.svg")} />
            </div>
            <Anim
              className="absolute inset-0 rounded-full bg-[#adadad]"
              tracks={fade([0, 0, 1, 1, 0, 0, 1, 1, 0, 0], [0, 0.3836, 0.3976, 0.455, 0.46, 0.4756, 0.4895, 0.5469, 0.552, 1], ["linear", IO, IO, IO, IO, IO, IO, IO, "linear"])}
            />
          </div>
          <p className={`-translate-x-1/2 absolute ${karlaMedium} h-[24.64px] leading-[normal] left-[36.96px] text-[21.12px] text-black text-center top-[227.04px] w-[28.16px]`}>
            72
          </p>
        </Anim>
      </div>
    </div>
  );
}

const ARM_TIMES = [0, 0.1663, 0.2146, 0.2478, 0.2917, 1];

// "micro interactions" (896 x 619), all three demos on the page timeline.
export default function MicroInteractions({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="absolute h-[619px] w-[896px]" style={style}>
      <TempSlider />
      <RoomPrefDelete />
      <DragPreferences />
    </div>
  );
}
