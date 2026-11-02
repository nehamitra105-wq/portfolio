import LazyPiece from "./LazyPiece";

const IMG = "/assets/gallery";

// Video pieces show their poster frame while the video in
// public/assets/gallery/videos/ loads.
function VideoPiece({ name, extension = "mp4" }: { name: string; extension?: string }) {
  return (
    <video
      autoPlay
      className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
      loop
      muted
      playsInline
      poster={`${IMG}/${name}-poster.png`}
      src={`${IMG}/videos/${name}.${extension}`}
    />
  );
}

function GemCrop({ className, imgClassName }: { className: string; imgClassName: string }) {
  return (
    <LazyPiece className={`absolute ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className={`absolute max-w-none ${imgClassName}`} src={`${IMG}/its-a-gem.jpg`} />
      </div>
    </LazyPiece>
  );
}

function IconTile({ bg, src }: { bg: string; src: string }) {
  return (
    <div className={`${bg} relative shrink-0 size-[361.629px]`}>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[308.012px] top-1/2">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className={`absolute ${bg} inset-0`} />
          <img alt="" className="absolute max-w-none object-cover size-full" src={src} />
        </div>
      </div>
    </div>
  );
}

// Title on the left, medium on the right, spanning the width set in the
// gallery setup frame (usually the piece's width).
const CAPTIONS = [
  { left: 179, top: 976, width: 500, title: "Lord Please, Save Me!", medium: "Oil Paint on Canvas" },
  { left: 878, top: 759, width: 537, title: "Figma Shaders Ad", medium: "Figma Motion" },
  { left: 802, top: 1396, width: 435, title: "Painting for a failing situationship", medium: "Oil Paint" },
  { left: 79, top: 1551, width: 535, title: "Radio Station Sticker Sheet", medium: "Adobe Illustrator" },
  { left: 179, top: 2119, width: 573, title: "Figma Motion Ad", medium: "Figma Motion" },
  { left: 938, top: 2261, width: 464, title: "Truth", medium: "Charcoal" },
  { left: 387, top: 2728, width: 950, title: "Break Free", medium: "Procreate" },
  { left: 193, top: 3352, width: 451, title: "Value", medium: "Micron Pen" },
  { left: 914, top: 3361, width: 451, title: "John Baldessari Imitation", medium: "Adobe Illustrator" },
  { left: 797, top: 3934, width: 520, title: "Maybe this was meant to be.", medium: "Procreate" },
  { left: 136, top: 4251, width: 508, title: "Color Wheel", medium: "Acrylic Gouache" },
  { left: 330, top: 5193, width: 527, title: "Balance", medium: "Graphite Pencils" },
  { left: 1002, top: 5236, width: 362, title: "Game Night", medium: "Adobe Illustrator & After Effects" },
  { left: 808, top: 5842, width: 448, title: "Split Compliment Comp", medium: "Acrylic Gouache" },
  { left: 339, top: 6529, width: 456, title: "Deception", medium: "Linotype Ink Print" },
  { left: 968, top: 6658, width: 430, title: "Mindbend World Event Poster", medium: "Adobe Photoshop & Illustrator" },
  { left: 845, top: 7121, width: 588, title: "Fluxcore Episode 6 Intro Card", medium: "Adobe After Effects" },
  { left: 100, top: 7639, width: 459, title: "The One Who Got Away", medium: "Oil Paint on Canvas" },
  { left: 724, top: 7641, width: 520, title: "Maybe this was meant to be.", medium: "Procreate" },
  { left: 883, top: 8345, width: 361, title: "The Map to Here", medium: "Procreate" },
  { left: 225, top: 8479, width: 481, title: "A Bad Picture", medium: "Micron Pen" },
];


export default function GalleryPieces() {
  return (
    <>
      <LazyPiece className="absolute h-[757px] left-[179px] top-[209px] w-[500px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/lord-please-save-me.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[301.831px] left-[878px] top-[447px] w-[536.588px]">
        <VideoPiece name="final-anim" />
      </LazyPiece>
      <LazyPiece className="absolute h-[344px] left-[79px] top-[1197px] w-[535px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/sticker-sheet.png`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[370px] left-[387px] top-[2348px] w-[950px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/b0503600.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[646px] left-[938px] top-[1605px] w-[464px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/truth.jpg`} />
      </LazyPiece>
      <GemCrop className="h-[232px] left-[193px] top-[3109px] w-[137px]" imgClassName="h-[246.86%] left-[-85.2%] top-[-123.92%] w-[557.68%]" />
      <GemCrop className="h-[233px] left-[124px] top-[2858px] w-[138px]" imgClassName="h-[254.76%] left-[-44.43%] top-[-12.64%] w-[575.18%]" />
      <GemCrop className="h-[232px] left-[349px] top-[3109px] w-[137px]" imgClassName="h-[246.86%] left-[-210.68%] top-[-125.21%] w-[557.68%]" />
      <GemCrop className="h-[233px] left-[280px] top-[2858px] w-[137px]" imgClassName="h-[246.86%] left-[-164.5%] top-[-12.05%] w-[557.68%]" />
      <GemCrop className="h-[233px] left-[438px] top-[2858px] w-[137px]" imgClassName="h-[246.87%] left-[-295.84%] top-[-13.64%] w-[557.7%]" />
      <GemCrop className="h-[233px] left-[507px] top-[3109px] w-[137px]" imgClassName="h-[246.86%] left-[-345.01%] top-[-126.35%] w-[557.68%]" />
      <LazyPiece className="absolute left-[914px] size-[450px] top-[2901px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/john-baldessari.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[356px] left-[802px] top-[1030px] w-[435px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/b8b8a4b6.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[590.11px] left-[176px] top-[5378px] w-[455.994px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/front-cover.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[533.589px] left-[339px] top-[5985px] w-[456.021px]">
        <img alt="" className="absolute inset-0 max-w-none object-bottom pointer-events-none size-full" src={`${IMG}/img-4324.png`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[322px] left-[179px] top-[1787px] w-[573px]">
        <VideoPiece name="ep-8-ad-anim" />
      </LazyPiece>
      <LazyPiece className="absolute h-[390px] left-[797px] top-[3534px] w-[520px]">
        <VideoPiece extension="mov" name="fate" />
      </LazyPiece>
      <LazyPiece className="absolute h-[331px] left-[845px] top-[6780px] w-[588px]">
        <VideoPiece name="ep-6-intro-card" />
      </LazyPiece>
      <LazyPiece className="absolute h-[645px] left-[225px] top-[7824px] w-[481px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/bad-reflection.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute content-stretch flex flex-col gap-[17px] items-start justify-center left-[1002px] top-[4107px]">
        <IconTile bg="bg-[#154420]" src={`${IMG}/animated-icons-2.gif`} />
        <IconTile bg="bg-white" src={`${IMG}/animated-icons-3.gif`} />
        <IconTile bg="bg-[#da2b31]" src={`${IMG}/animated-icons-1.gif`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[345.083px] left-[724px] top-[7284px] w-[613.48px]">
        <VideoPiece name="untitled-artwork" />
      </LazyPiece>
      <LazyPiece className="absolute h-[499px] left-[870px] top-[7834px] w-[374px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/c6c3c523.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[665px] left-[968px] top-[5983px] w-[430px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/mindbend-poster.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[802px] left-[330px] top-[4381px] w-[527px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/balance-on-a-wall.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[668px] left-[136px] top-[3573px] w-[508px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/11066169.png`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[449px] left-[808px] top-[5383px] w-[448px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${IMG}/ce35cb27.jpg`} />
      </LazyPiece>
      <LazyPiece className="absolute h-[931px] left-[100px] top-[6698px] w-[459px]">
        <img alt="" className="absolute inset-0 max-w-none object-bottom pointer-events-none size-full" src={`${IMG}/the-one-who-got-away.png`} />
      </LazyPiece>

      {CAPTIONS.map(({ left, top, width, title, medium }) => (
        <LazyPiece
          className="absolute flex h-[19px] items-center justify-between text-[16px] leading-normal text-black whitespace-nowrap"
          key={`${top}-${left}`}
          style={{ left, top, width }}
        >
          <p className="font-['Neue_Montreal:Medium',Arial,sans-serif]">{title}</p>
          <p className="text-right font-['Neue_Montreal:Regular',Arial,sans-serif]">{medium}</p>
        </LazyPiece>
      ))}

    </>
  );
}
