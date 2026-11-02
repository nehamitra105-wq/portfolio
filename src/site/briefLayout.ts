// The brief frame (1506 x 982) is scaled to fit the window and centred, so
// the whole brief is always in view and the page never scrolls. The disc
// stays in the window's top-left corner and the graphic on its bottom edge.
export const BRIEF_FRAME = { width: 1506, height: 982 };

export function briefLayout() {
  const scale = Math.min(window.innerWidth / BRIEF_FRAME.width, window.innerHeight / BRIEF_FRAME.height);
  return {
    scale,
    left: (window.innerWidth - BRIEF_FRAME.width * scale) / 2,
    top: (window.innerHeight - BRIEF_FRAME.height * scale) / 2,
  };
}
