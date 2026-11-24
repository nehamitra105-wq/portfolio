import type { NavigateFunction } from "react-router-dom";

export type Section = "top" | "shelves" | "about" | "contact";

export const EMAIL = "nehamitra105@gmail.com";
export const RESUME_URL =
  "https://drive.google.com/file/d/1mOX-6OiUNK18UrbNiHCJGHMFwFrg0lwi/view?usp=drive_link";
export const LINKEDIN_URL = "https://www.linkedin.com/in/neha-mitra/";

// Links that jump to a section glide there slowly, easing in and out;
// longer trips take longer (1.2s up to 2.4s).
const scrollMs = (distance: number) => Math.min(2400, 1200 + Math.abs(distance) * 0.2);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
let scrollFrame = 0;

export function scrollToY(top: number) {
  cancelAnimationFrame(scrollFrame);
  const from = window.scrollY;
  const to = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  const ms = scrollMs(to - from);
  const started = performance.now();
  const step = () => {
    const t = Math.min(1, (performance.now() - started) / ms);
    window.scrollTo(0, from + (to - from) * easeInOut(t));
    if (t < 1) scrollFrame = requestAnimationFrame(step);
  };
  scrollFrame = requestAnimationFrame(step);
}

export const scrollToElement = (element: Element) => scrollToY(element.getBoundingClientRect().top + window.scrollY);

// Scrolls to a section of the current page when it has one (the CD shelves
// and #about on home, the footer on every page), otherwise goes home and
// scrolls there.
export function goToSection(navigate: NavigateFunction, section: Section) {
  if (section === "top") {
    if (window.location.pathname === "/") {
      scrollToY(0);
    } else {
      navigate("/");
    }
    return;
  }

  const element = document.getElementById(section);
  if (element) {
    scrollToElement(element);
  } else {
    navigate("/", { state: { scrollTo: section } });
  }
}
