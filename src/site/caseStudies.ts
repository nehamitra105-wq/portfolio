export type CaseStudySlug = "nest" | "ribbon" | "milune" | "reforma";

// An exported disc image (Neha's 4x exports in public/assets/home, resized to
// 2x) and where the disc's circle sits inside it, in image pixels. The export
// usually includes the drop shadow, so it can be a little bigger than the disc.
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
  // The title and headline shown under "Next Project" on a case study.
  brief: {
    title: string;
    headline: string;
  };
  // Only nest has a case study page so far; the others show the "Case study
  // in progress!" cursor.
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
      headline: "Redesigning interfaces to be more friendly and cheerful",
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
      headline: "A memento-maker for those who struggle with gift-giving",
    },
  },
  {
    slug: "milune",
    shelfDisc: { src: "/assets/home/cd-milune.png", dx: -57, dy: -57, width: 1340, height: 1340, size: 1226 },
    description: "An audio-olfactory device that brings home to you.",
    shelfTags: ["Futuristic Design", "Hackathon"],
    brief: {
      title: "Milune",
      headline: "An audio olfactory device powered by AI that brings home to you",
    },
  },
  {
    slug: "reforma",
    shelfDisc: { src: "/assets/home/cd-reforma.png", dx: 0, dy: 0, width: 1226, height: 1226, size: 1226 },
    description: "Designing a mobile app for AI form tracking technology",
    shelfTags: ["End-to-Design", "Product Design"],
    brief: {
      title: "Reforma AI",
      headline: "Designing a mobile app for AI form tracking technology",
    },
  },
];

export const caseStudyBySlug = (slug: string | undefined) =>
  CASE_STUDIES.find((study) => study.slug === slug);
