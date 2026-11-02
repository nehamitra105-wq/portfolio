export type CaseStudySlug = "nest" | "ribbon" | "milune" | "reforma";

// An exported disc image (Neha's 4x exports in public/assets/home, resized to
// 2x) and where the disc's circle sits inside it, in image pixels. The export
// includes the drop shadow, so it's a little bigger than the disc.
export type DiscImage = {
  src: string;
  // Offset of the image from the circle's box, and the image size, in the
  // same units as `size` (the circle's diameter).
  dx: number;
  dy: number;
  width: number;
  height: number;
  size: number;
};

export type CaseStudy = {
  slug: CaseStudySlug;
  shelfDisc: DiscImage;
  description: string;
  shelfTags: string[];
  brief: {
    title: string;
    headline: string;
    tags: string[];
    meta: [string, string][];
    // Disc centre / diameter / CSS rotation on the brief page (frame coords),
    // and the whole disc, already rotated and cut to its circle, shown there.
    disc: { cx: number; cy: number; size: number; rotate: number; src: string };
    graphic: { src: string; left: number; top: number; width: number; height: number };
  };
  // Only nest has a case study page so far; the others show the lock cursor.
  caseStudyPath?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "nest",
    shelfDisc: { src: "/assets/home/cd-nest.png", dx: -29, dy: -53, width: 1340, height: 1355, size: 1260 },
    description: "Redesigning interfaces to be more friendly and cheerful",
    shelfTags: ["Interface Design", "Design Systems"],
    brief: {
      title: "Nest Thermostat Redesign",
      headline: "REDESIGNING INTERFACES TO BE MORE FRIENDLY AND CHEERFUL",
      tags: ["Interface Design", "Design Systems"],
      meta: [["Company", "SCAD Project"], ["Date", "Fall 2025"], ["Time", "10 Weeks"]],
      disc: { cx: -25.33, cy: -25.33, size: 1152.11, rotate: -45, src: "/assets/briefs/disc-nest.png" },
      graphic: { src: "/assets/briefs/graphic-nest.png", left: 17, top: 221, width: 789, height: 761 },
    },
    caseStudyPath: "/nest",
  },
  {
    slug: "ribbon",
    shelfDisc: { src: "/assets/home/cd-ribbon.png", dx: -3, dy: -6, width: 1340, height: 1338, size: 1278 },
    description: "A memento-maker for those who struggle with gift giving",
    shelfTags: ["Design Strategy", "Design Sprint"],
    brief: {
      title: "Ribbon",
      headline: "A MEMENTO-MAKER FOR THOSE WHO STRUGGLE WITH GIFT GIVING",
      tags: ["Design Strategy", "Design Sprint"],
      meta: [["Sprint", "SVSD Design Sprint"], ["Date", "Fall 2026"], ["Time", "6 days"]],
      disc: { cx: 90.66, cy: 49.66, size: 1152.11, rotate: -45, src: "/assets/briefs/disc-ribbon.png" },
      graphic: { src: "/assets/briefs/graphic-ribbon.png", left: 148, top: 405, width: 561.55, height: 577 },
    },
  },
  {
    slug: "milune",
    shelfDisc: { src: "/assets/home/cd-milune.png", dx: -57, dy: -57, width: 1340, height: 1340, size: 1226 },
    description: "An audio-olfactory device that brings home to you.",
    shelfTags: ["Futuristic Design", "Hackathon"],
    brief: {
      title: "Milune",
      headline: "AN AUDIO OLFACTORY DEVICE THAT BRINGS HOME TO YOU",
      tags: ["Futuristic Design", "Hackathon"],
      meta: [["Sprint", "SCAD Startup"], ["Date", "Winter 2026"], ["Time", "5 days"]],
      disc: { cx: 51.59, cy: 14.59, size: 1152, rotate: -45, src: "/assets/briefs/disc-milune.png" },
      graphic: { src: "/assets/briefs/graphic-milune.png", left: 81.01, top: 439.72, width: 606.75, height: 542.28 },
    },
  },
  {
    slug: "reforma",
    shelfDisc: { src: "/assets/home/cd-reforma.png", dx: -57, dy: -57, width: 1340, height: 1286, size: 1226 },
    description: "Designing a mobile app for AI form tracking technology",
    shelfTags: ["End-to-Design", "Product Design"],
    brief: {
      title: "Reforma AI",
      headline: "DESIGNING A MOBILE APP FOR AI FORM TRACKING TECHNOLOGY",
      tags: ["End-to-design", "Product Design"],
      meta: [["Company", "Reforma AI"], ["Date", "Summer 2025"], ["Time", "10 Weeks"]],
      disc: { cx: -21.6, cy: -21.53, size: 1152, rotate: -39.91, src: "/assets/briefs/disc-reforma.png" },
      graphic: { src: "/assets/briefs/graphic-reforma.png", left: 108.86, top: 297.54, width: 624.27, height: 684.46 },
    },
  },
];

export const caseStudyBySlug = (slug: string | undefined) =>
  CASE_STUDIES.find((study) => study.slug === slug);
