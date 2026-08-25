export function scrollToSection(sectionId: string) {
  if (typeof window === "undefined") return;
  const cleanId = sectionId.replace(/^#/, "");
  if (!cleanId) return;

  const element = document.getElementById(cleanId);
  if (element) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    if (window.history.pushState) {
      window.history.pushState(null, "", `#${cleanId}`);
    }
  }
}
