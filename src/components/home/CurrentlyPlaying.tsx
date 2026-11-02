import { useEffect, useRef, useState } from "react";

const A = "/assets/about";

// Neha's queue. `color` fills the "it's [color]!" line. Artwork (600px album
// covers from Apple Music's search) is public/assets/about/queue/<slug>.jpg;
// the grey disc shows if one is missing.
const QUEUE = [
  { slug: "devils-advocate", song: "Devil’s Advocate", artist: "The Neighbourhood", color: "blue" },
  { slug: "starlet", song: "Starlet", artist: "Leven Kali, Destin Conrad & Ambré", color: "green & yellow" },
  { slug: "lady-brown", song: "Lady Brown (ft. Cise Starr)", artist: "Nujabes", color: "blue" },
  { slug: "show-you-me", song: "Show You Me", artist: "Steve Lacy", color: "red" },
  { slug: "talking-bout-you", song: "Talking Bout You", artist: "wave to earth", color: "blue" },
  { slug: "nouvelle-vague", song: "Nouvelle Vague", artist: "wave to earth", color: "red" },
  { slug: "is-it-cool", song: "Is It Cool (ft. SZA)", artist: "Steve Lacy", color: "green" },
  { slug: "holyland", song: "Holyland", artist: "wave to earth", color: "yellow" },
  { slug: "nice-shoes-in-your-world", song: "Nice Shoes / In Your World", artist: "Steve Lacy", color: "red & blue" },
];

// The "cd" placeholder's shape: a 123px disc with a 33px centre hole.
const DISC_MASK =
  "radial-gradient(closest-side, transparent 26.8%, #000 calc(26.8% + 0.5px), #000 calc(100% - 0.5px), transparent 100%)";

// Text that doesn't fit scrolls slowly sideways on a loop, like a mini
// player: it waits at the start, scrolls one copy's width, then repeats.
const MARQUEE_GAP = 32;
const MARQUEE_SPEED = 30; // px per second
const MARQUEE_PAUSE_MS = 1500;

function Marquee({ className, text }: { className: string; text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track) return;
    const first = track.firstElementChild as HTMLElement;
    setOverflow(first.offsetWidth > box.clientWidth ? first.offsetWidth : 0);
  }, [text]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !overflow) return;
    const distance = overflow + MARQUEE_GAP;
    const scrollMs = (distance / MARQUEE_SPEED) * 1000;
    const total = scrollMs + MARQUEE_PAUSE_MS;
    const animation = track.animate(
      [
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: MARQUEE_PAUSE_MS / total },
        { transform: `translateX(${-distance}px)`, offset: 1 },
      ],
      { duration: total, iterations: Infinity, easing: "linear" },
    );
    return () => animation.cancel();
  }, [overflow, text]);

  return (
    <div className={`${className} overflow-hidden`} ref={boxRef}>
      <div className={`flex w-max ${overflow ? "" : "mx-auto"}`} ref={trackRef} style={{ gap: MARQUEE_GAP }}>
        <span className="whitespace-nowrap">{text}</span>
        {overflow > 0 && (
          <span aria-hidden className="whitespace-nowrap">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

// "currently playing" block in About me: skip and back step through the
// queue (it starts on a random song), and pause stops the disc turning.
export default function CurrentlyPlaying() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUEUE.length));
  const [playing, setPlaying] = useState(true);
  // Only the current song's failed load: try again whenever a song comes back up.
  const [failedArt, setFailedArt] = useState<string | null>(null);
  const track = QUEUE[index];
  const step = (by: number) => {
    setFailedArt(null);
    setIndex((current) => (current + by + QUEUE.length) % QUEUE.length);
  };

  return (
    <div className="absolute top-[614px] left-[851px] flex items-center gap-[15px]">
      <div
        className="relative size-[123px] shrink-0 animate-[spin_12s_linear_infinite]"
        style={{ animationPlayState: playing ? "running" : "paused" }}
      >
        {failedArt === track.slug ? (
          <img alt="" className="block size-full max-w-none" src={`${A}/cd.svg`} />
        ) : (
          <img
            alt={`${track.song} artwork`}
            className="block size-full max-w-none rounded-full object-cover"
            key={track.slug}
            onError={() => setFailedArt(track.slug)}
            src={`${A}/queue/${track.slug}.jpg`}
            style={{ maskImage: DISC_MASK, WebkitMaskImage: DISC_MASK }}
          />
        )}
        {/* Thin black ring just outside the centre hole, like a real CD. */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[39px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-solid border-black" />
      </div>
      <div className="flex w-[217px] shrink-0 flex-col items-center gap-[15px]">
        <div aria-live="polite" className="flex w-full flex-col items-start gap-[4px] text-center text-[16px] leading-[1.32] tracking-[-0.32px] text-black">
          <Marquee className="nm-medium h-[21px] w-full" text={track.song} />
          <Marquee className="nm h-[21px] w-full" text={track.artist} />
        </div>
        <div className="flex items-center gap-[31.852px] select-none">
          <button aria-label="Previous song" className="outline-none" onClick={() => step(-1)} type="button">
            <img alt="" className="block size-[26.796px] max-w-none" draggable={false} src={`${A}/go-back.svg`} />
          </button>
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="relative size-[25.279px] shrink-0 outline-none"
            onClick={() => setPlaying((value) => !value)}
            type="button"
          >
            {playing ? (
              <>
                <span className="absolute top-0 left-[3.5px] h-[25.279px] w-[7.584px] rounded-[2.022px] bg-[#141414]" />
                <span className="absolute top-0 left-[14.62px] h-[25.279px] w-[7.584px] rounded-[2.022px] bg-[#141414]" />
              </>
            ) : (
              <span
                className="absolute top-0 left-[3.5px] h-[25.279px] w-[21px] bg-[#141414]"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)", borderRadius: 2 }}
              />
            )}
          </button>
          <button aria-label="Next song" className="outline-none" onClick={() => step(1)} type="button">
            <img alt="" className="block size-[26.796px] max-w-none" draggable={false} src={`${A}/skip.svg`} />
          </button>
        </div>
        <p className="nm h-[21px] w-[217px] text-center text-[12px] leading-[1.32] tracking-[-0.24px] text-black">{`it’s ${track.color}!`}</p>
      </div>
    </div>
  );
}
