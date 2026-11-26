import type { FinalVideo, TraitRow } from "../components/nest/NestComponents";

// "mobile - home" (2187:22119, 402 x 12291): the nest case study on phones.
// Positions are page coordinates in the 402-wide design.
export const MOBILE_NEST_HEIGHT = 12291;
export const MOBILE_NEST_FOOTER_TOP = 11764;

// Where the menu's sections start. Concept is the visual direction block, as
// on desktop.
export const MOBILE_NEST_SECTIONS = [
  { label: "Overview", top: 906 },
  { label: "Challenge", top: 1744 },
  { label: "Concept", top: 2531 },
  { label: "Design", top: 4114 },
  { label: "System", top: 8456 },
  { label: "Final Product", top: 8851 },
];

// The page, rendered from Figma at 2x and cut between its blocks; each block
// fades up as it comes on screen. The moodboard, visual traits, use cases and
// design system areas are blank in these pictures and drawn live on top.
const CUTS = [
  0, 890, 1172, 1313, 1724, 1851, 2511, 2651, 3009, 3078, 3310, 3379, 3586, 3693, 4095, 4212, 4889, 4987, 5803, 5914,
  6686, 7453, 8080, 8151, 8436, 8543, 8832, 8966, 10583, 11057, MOBILE_NEST_FOOTER_TOP - 20,
];
// The first block is the hero, drawn on its own (see MOBILE_NEST_HERO).
export const MOBILE_NEST_BLOCKS = CUTS.slice(0, -1)
  .map((top, i) => ({
    src: `/assets/nest/mobile/block-${String(i).padStart(2, "0")}.webp`,
    top,
    height: CUTS[i + 1] - top,
  }))
  .slice(1);

// "Frame 1597881005" (2217:44579, 400 x 754 at 1, 97): the hero art with the
// nest logo at its foot. On screens shorter than the design it shrinks so the
// logo still shows on the first screen, keeping the design's 23 below it (the
// skip and menu buttons sit over the graphic, as in Figma), and the page
// below closes up.
export const MOBILE_NEST_HERO = { src: "/assets/nest/mobile/hero.webp", top: 97, width: 402, height: 754, below: 23 };

// The final-product videos, cropped as in Figma (phones in their screen mask,
// thermostats in their round screen). Same recordings as desktop.
const video = (name: string) => `/assets/nest/videos/${name}.mp4`;
const PHONE_RADIUS = 19;
export const MOBILE_FINAL_VIDEOS: FinalVideo[] = [
  { src: video("request-temp-phone"), box: [220, 9000.24, 139.5, 253], crop: [0.31025, 0.10881, 0.38247, 0.7677], clip: [227, 9000.74, 123, 252.5, PHONE_RADIUS] },
  { src: video("locked-therm"), box: [222.5, 9316.74, 153, 153], crop: [0.13384, 0.14054, 0.70031, 0.6838], clip: [222.5, 9316.74, 153, 153, 76.5] },
  { src: video("conference-therm"), box: [22.5, 9534.74, 153.55, 153], crop: [0.14684, 0.1414, 0.70127, 0.68257], clip: [22.5, 9534.74, 153.55, 153, 76.5] },
  { src: video("conference-pref-phone"), box: [242, 9747.24, 124.5, 252.5], crop: [0.23447, 0.05342, 0.499, 0.89315], clip: [243, 9746.74, 123.5, 252.5, PHONE_RADIUS] },
  { src: video("eco-friendly-therm"), box: [223, 10068.74, 153.5, 153], crop: [0.1038, 0.07224, 0.76962, 0.80755], clip: [223, 10068.74, 153.5, 153, 76.75] },
  { src: video("pref-leaderboard"), box: [228, 10312.93, 123.32, 252.5], crop: [0.24161, 0.03915, 0.5042, 0.91111], clip: [228, 10312.93, 123, 252.5, PHONE_RADIUS] },
];
// Layers that sit above those videos in Figma: [file, x, y, w, h].
export const MOBILE_ABOVE_VIDEO = [
  ["over-request.png", 133.5, 9139.7, 102, 82.5],
  ["over-meeting.png", 137.5, 9658.4, 52.5, 28.5],
  ["over-dial.svg", 228, 10023.4, 176, 179],
  ["over-leaf.png", 224.7, 10182.2, 31, 22.5],
] as const;

// "moodboard" (352 x 326 at 24, 2666.5): [desktop image index, x, y, w, h].
export const MOBILE_MOODBOARD = { left: 24, top: 2666.5, width: 352, height: 326 };
export const MOBILE_MOOD_TILES: [number, number, number, number, number][] = [
  [79, 86, 113, 30, 16],
  [28, 202, 51, 21, 28],
  [101, 198, 135, 24, 30],
  [41, 177, 57, 23, 23],
  [31, 290, 51, 38, 28],
  [0, 152, 4, 29, 22],
  [39, 123, 56, 25, 25],
  [60, 290, 80, 41, 28],
  [20, 202, 33, 29, 16],
  [83, 58, 239, 27, 26],
  [32, 120, 224, 33, 32],
  [14, 262, 27, 29, 22],
  [40, 146, 57, 30, 23],
  [30, 252, 51, 37, 27],
  [4, 202, 10, 28, 21],
  [35, 9, 60, 34, 19],
  [53, 101, 80, 22, 31],
  [36, 45, 57, 35, 22],
  [70, 150, 102, 24, 31],
  [71, 176, 102, 22, 31],
  [19, 182, 36, 18, 18],
  [29, 225, 51, 26, 27],
  [52, 65, 80, 34, 31],
  [10, 65, 28, 34, 26],
  [11, 101, 28, 35, 27],
  [59, 258, 80, 32, 27],
  [57, 207, 80, 23, 21],
  [55, 150, 80, 27, 21],
  [37, 82, 57, 21, 22],
  [76, 21, 107, 23, 34],
  [3, 182, 6, 18, 28],
  [81, 258, 109, 40, 25],
  [80, 116, 113, 32, 21],
  [104, 276, 135, 20, 31],
  [2, 101, 7, 48, 20],
  [102, 223, 135, 29, 30],
  [15, 291, 26, 30, 24],
  [103, 254, 135, 21, 32],
  [51, 21, 80, 42, 24],
  [97, 88, 132, 26, 33],
  [12, 138, 28, 42, 27],
  [16, 58, 172, 26, 32],
  [38, 105, 57, 21, 22],
  [111, 58, 144, 28, 26],
  [105, 299, 135, 29, 22],
  [8, 6, 25, 24, 32],
  [48, 58, 208, 38, 29],
  [77, 45, 107, 19, 34],
  [99, 139, 135, 26, 32],
  [98, 116, 135, 23, 31],
  [58, 232, 80, 24, 55],
  [13, 231, 29, 29, 21],
  [9, 31, 27, 30, 30],
  [54, 124, 80, 23, 31],
  [72, 200, 102, 31, 32],
  [56, 177, 80, 28, 21],
  [100, 166, 135, 29, 30],
  [78, 65, 113, 21, 28],
  [33, 119, 194, 34, 27],
  [82, 300, 109, 32, 24],
  [25, 213, 190, 30, 20],
  [17, 86, 167, 31, 20],
  [43, 185, 221, 27, 20],
  [61, 156, 239, 23, 24],
  [92, 87, 239, 32, 18],
  [27, 294, 159, 38, 28],
  [88, 243, 261, 23, 17],
  [84, 86, 189, 31, 17],
  [117, 234, 299, 28, 19],
  [107, 282, 287, 26, 27],
  [73, 27, 225, 28, 27],
  [50, 27, 201, 29, 22],
  [65, 244, 241, 26, 19],
  [6, 174, 168, 27, 21],
  [23, 203, 168, 27, 20],
  [42, 156, 218, 26, 20],
  [109, 27, 254, 28, 20],
  [87, 202, 265, 18, 13],
  [119, 250, 218, 32, 22],
  [7, 263, 169, 30, 22],
  [44, 213, 211, 36, 28],
  [67, 285, 244, 27, 20],
  [63, 209, 243, 11, 22],
  [110, 28, 146, 26, 33],
  [45, 98, 208, 20, 28],
  [34, 27, 184, 29, 14],
  [49, 10, 209, 15, 28],
  [118, 262, 298, 19, 28],
  [91, 0, 158, 24, 47],
  [47, 315, 191, 27, 20],
  [95, 230, 280, 24, 17],
  [90, 284, 265, 28, 21],
  [116, 207, 300, 25, 25],
  [86, 179, 265, 23, 30],
  [113, 87, 285, 23, 31],
  [74, 221, 257, 21, 21],
  [18, 120, 168, 33, 25],
  [75, 314, 261, 38, 29],
  [24, 231, 167, 30, 22],
  [114, 121, 283, 31, 17],
  [64, 221, 241, 21, 16],
  [69, 306, 214, 26, 26],
  [96, 255, 280, 27, 17],
  [1, 231, 0, 39, 26],
  [115, 179, 299, 27, 20],
  [68, 286, 215, 20, 28],
  [112, 86, 260, 32, 24],
  [22, 187, 189, 24, 31],
  [89, 267, 262, 16, 16],
  [66, 270, 242, 14, 18],
  [46, 244, 191, 39, 27],
  [62, 181, 244, 27, 20],
  [21, 154, 194, 29, 22],
  [93, 120, 257, 32, 24],
  [106, 61, 266, 24, 34],
  [85, 153, 265, 24, 38],
  [5, 153, 166, 19, 28],
  [94, 203, 280, 26, 16],
  [26, 286, 191, 27, 21],
  [108, 309, 290, 16, 26],
];

// "visual trait anim mobile" (354 x 200 at 24, 3094): eight rows of pills.
export const MOBILE_TRAIT_ROWS: TraitRow[] = [
  { y: 0, from: 344, pills: [["Warm vs Cool", 7, 48], ["Cards", 63, 27], ["Color Tint", 98, 38], ["Element Dimension", 144, 63, true], ["Casing for Headings", 215, 65], ["Graphic Elements", 288, 59]] },
  { y: 26, from: -344, pills: [["Information Density", 3.5, 63], ["Font Weight", 74.5, 43], ["Number of Typefaces", 125.5, 68], ["Dark vs Light Theme", 201.5, 66, true], ["User Acknowledgement", 275.5, 75]] },
  { y: 52, from: 344, pills: [["Solid / Gradient", 9, 53, true], ["Grid System", 70, 44], ["Icon Line Weight", 122, 56], ["Type of Navigation", 186, 61], ["Organic to Geometric Density", 255, 90, true]] },
  { y: 78, from: -344, pills: [["Information Density", 3.5, 63], ["Font Weight", 74.5, 43], ["Number of Typefaces", 125.5, 68], ["Dark vs Light Theme", 201.5, 66, true], ["User Acknowledgement", 275.5, 75]] },
  { y: 104, from: 344, pills: [["Strength of Corner Radius", -1, 81, true], ["Character", 88, 38], ["Focal Point", 134, 41, true], ["Contrast", 183, 34], ["# of Items in Global Nav", 225, 74], ["Transparency", 307, 48, true]] },
  { y: 130, from: -344, pills: [["Information Density", 3.5, 63], ["Font Weight", 74.5, 43], ["Number of Typefaces", 125.5, 68], ["Dark vs Light Theme", 201.5, 66, true], ["User Acknowledgement", 275.5, 75]] },
  { y: 156, from: 344, pills: [["Negative Space", 11.5, 53], ["Header to Body Text Ratio", 72.5, 81, true], ["First Main Color", 161.5, 54], ["Second Main Color", 223.5, 62], ["Button Format", 293.5, 49, true]] },
  { y: 182, from: -344, pills: [["Type of Color Palette", 42, 67], ["Third Main Color", 117, 56], ["Color Saturation", 181, 55, true], ["UX Copywriting Tone", 244, 68]] },
];
