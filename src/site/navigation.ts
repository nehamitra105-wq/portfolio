import type { NavigateFunction } from "react-router-dom";

export type Section = "top" | "about" | "contact";

export const EMAIL = "nehamitra105@gmail.com";
export const RESUME_URL =
  "https://drive.google.com/file/d/1mOX-6OiUNK18UrbNiHCJGHMFwFrg0lwi/view?usp=drive_link";
export const LINKEDIN_URL = "https://www.linkedin.com/in/neha-mitra/";

// Scrolls to a section of the current page when it has one (#about on home,
// the footer on every page), otherwise goes home and scrolls there.
export function goToSection(navigate: NavigateFunction, section: Section) {
  if (section === "top") {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
    return;
  }

  const element = document.getElementById(section);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  } else {
    navigate("/", { state: { scrollTo: section } });
  }
}
