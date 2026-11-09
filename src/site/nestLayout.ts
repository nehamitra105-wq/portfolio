// The micro-interaction videos are scaled up from the Figma's 896-wide grid so
// their edges line up with the 1044-wide content column. That makes them
// taller, so everything below them on the page moves down by the difference.
export const MICRO_SCALE = 1044 / 896;
export const MICRO_GROW = 619 * (MICRO_SCALE - 1);
// Frame y (in the Figma) below which content moves down: the end of the grid.
const MICRO_END = 12801;

export const shiftY = (y: number) => (y >= MICRO_END ? y + MICRO_GROW : y);
