export type Point = { x: number; y: number };

export type DrawnPath = { x: number; y: number; d: string };

export type FallPath = {
  start: Point;
  tip: Point;
  pointAt: (progress: number) => Point;
};

export const mix = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

export const cubicBezierValue = (
  start: number,
  controlOne: number,
  controlTwo: number,
  end: number,
  progress: number,
) => {
  const inverse = 1 - progress;
  return (
    inverse ** 3 * start +
    3 * inverse ** 2 * progress * controlOne +
    3 * inverse * progress ** 2 * controlTwo +
    progress ** 3 * end
  );
};

const SAMPLES_PER_SEGMENT = 24;

// Turns one of the hand-drawn path strokes into a fall path in frame
// coordinates. Each stroke ends in an arrowhead, so the stroke is cut where
// the arrowhead starts doubling back up and joined straight to its tip.
export function toFallPath({ x, y, d }: DrawnPath): FallPath {
  const numbers = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const start = { x: x + numbers[0], y: y + numbers[1] };
  const segments: Point[][] = [];
  let previous = start;

  for (let index = 2; index + 5 < numbers.length; index += 6) {
    const end = { x: x + numbers[index + 4], y: y + numbers[index + 5] };
    segments.push([
      previous,
      { x: x + numbers[index], y: y + numbers[index + 1] },
      { x: x + numbers[index + 2], y: y + numbers[index + 3] },
      end,
    ]);
    previous = end;
  }

  const height = Math.max(...segments.map((segment) => segment[3].y)) - start.y;
  let strokeLength = segments.findIndex(
    (segment, index) =>
      index > 0 &&
      segment[3].y < segments[index - 1][3].y &&
      segment[3].y - start.y > height / 2,
  );
  if (strokeLength < 0) strokeLength = segments.length;

  const tip = segments
    .slice(strokeLength - 1)
    .map((segment) => segment[3])
    .reduce((lowest, point) => (point.y > lowest.y ? point : lowest));

  const points: Point[] = [start];
  for (const [p0, p1, p2, p3] of segments.slice(0, strokeLength)) {
    for (let step = 1; step <= SAMPLES_PER_SEGMENT; step += 1) {
      const t = step / SAMPLES_PER_SEGMENT;
      points.push({
        x: cubicBezierValue(p0.x, p1.x, p2.x, p3.x, t),
        y: cubicBezierValue(p0.y, p1.y, p2.y, p3.y, t),
      });
    }
  }
  points.push(tip);

  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    lengths.push(
      lengths[index - 1] +
        Math.hypot(
          points[index].x - points[index - 1].x,
          points[index].y - points[index - 1].y,
        ),
    );
  }
  const totalLength = lengths[lengths.length - 1];

  const pointAt = (progress: number) => {
    const target = Math.min(Math.max(progress, 0), 1) * totalLength;
    let index = 1;
    while (index < lengths.length - 1 && lengths[index] < target) index += 1;
    const span = lengths[index] - lengths[index - 1] || 1;
    const local = (target - lengths[index - 1]) / span;
    return {
      x: mix(points[index - 1].x, points[index].x, local),
      y: mix(points[index - 1].y, points[index].y, local),
    };
  };

  return { start, tip, pointAt };
}
