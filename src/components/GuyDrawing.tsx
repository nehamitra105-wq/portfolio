export type GuyState =
  | "idle"
  | "walking"
  | "sliding"
  | "falling"
  | "about-to-land"
  | "splat"
  | "getting-up"
  | "jumping";

const WALKING_FRAMES = {
  left: ["/assets/guy/326e0.svg", "/assets/guy/6a1aa.svg"],
  right: ["/assets/guy/3576f.svg", "/assets/guy/f5c6b.svg"],
} as const;

const FALLING_FRAMES = [
  "/assets/guy/ab212.svg",
  "/assets/guy/38bc7.svg",
  "/assets/guy/576f4.svg",
  "/assets/guy/4850b.svg",
] as const;

const LANDING_FRAMES = {
  left: {
    aboutToLand: "/assets/guy/5d4ee.svg",
    splat: "/assets/guy/846ca.svg",
    gettingUp: ["/assets/guy/23c61.svg", "/assets/guy/b579d.svg"],
  },
  right: {
    aboutToLand: "/assets/guy/90786.svg",
    splat: "/assets/guy/90bdd.svg",
    gettingUp: ["/assets/guy/4fecb.svg", "/assets/guy/725c7.svg"],
  },
} as const;

const JUMPING_FRAMES = {
  right: [
    "/assets/guy/9500d.svg",
    "/assets/guy/89198.svg",
    "/assets/guy/51ef5.svg",
    "/assets/guy/43f9d.svg",
    "/assets/guy/e5d8a.svg",
  ],
  left: [
    "/assets/guy/9d877.svg",
    "/assets/guy/a07e9.svg",
    "/assets/guy/b498f.svg",
    "/assets/guy/8a09f.svg",
    "/assets/guy/e5d8a.svg",
  ],
} as const;

// Every frame the guy can show, so the page can load them all up front.
export const ALL_GUY_FRAMES = [
  "/assets/guy/690f9.svg",
  "/assets/guy/81f88.svg",
  "/assets/guy/54912.svg",
  ...WALKING_FRAMES.left,
  ...WALKING_FRAMES.right,
  ...FALLING_FRAMES,
  ...Object.values(LANDING_FRAMES).flatMap((frames) => [
    frames.aboutToLand,
    frames.splat,
    ...frames.gettingUp,
  ]),
  ...JUMPING_FRAMES.right,
  ...JUMPING_FRAMES.left,
];

export default function GuyDrawing({
  direction,
  fallFrame,
  getUpFrame,
  hasLanded,
  jumpFrame,
  state,
  walkFrame,
}: {
  direction: "left" | "right";
  fallFrame: number;
  getUpFrame: number;
  hasLanded: boolean;
  jumpFrame: number;
  state: GuyState;
  walkFrame: number;
}) {
  if (state === "sliding") {
    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        src={
          direction === "right"
            ? "/assets/guy/81f88.svg"
            : "/assets/guy/54912.svg"
        }
      />
    );
  }

  if (state === "walking") {
    const walkingFrame = WALKING_FRAMES[direction][walkFrame];

    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        key={walkingFrame}
        src={walkingFrame}
      />
    );
  }

  if (state === "falling") {
    // All four frames stay mounted and only the current one is shown, so the
    // fall never waits on an image swap (which flashed an empty image box).
    return (
      <>
        {FALLING_FRAMES.map((src, frame) => (
          <div
            className={`fall-frame fall-frame--${frame} fall-frame--${direction}`}
            key={frame}
            style={{ visibility: frame === fallFrame ? "visible" : "hidden" }}
          >
            <img
              alt=""
              className="block size-[86px] max-w-none"
              draggable={false}
              src={src}
            />
          </div>
        ))}
      </>
    );
  }

  if (state === "about-to-land") {
    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        src={LANDING_FRAMES[direction].aboutToLand}
      />
    );
  }

  if (state === "splat") {
    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        src={LANDING_FRAMES[direction].splat}
      />
    );
  }

  if (state === "getting-up") {
    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        src={LANDING_FRAMES[direction].gettingUp[getUpFrame]}
      />
    );
  }

  if (state === "jumping") {
    const jumpingFrames = JUMPING_FRAMES[direction];

    return (
      <img
        alt=""
        className="block size-[86px] max-w-none"
        draggable={false}
        src={jumpingFrames[jumpFrame]}
      />
    );
  }

  return (
    <img
      alt=""
      className="block size-[86px] max-w-none"
      draggable={false}
      src={hasLanded ? "/assets/guy/e5d8a.svg" : "/assets/guy/690f9.svg"}
    />
  );
}
