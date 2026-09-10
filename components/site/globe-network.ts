// Illustrative journeys, not live availability or individual hotel locations.
type Point = readonly [number, number, number];
const vector = ([lon, lat]: readonly number[]): Point => {
  const a = lat * Math.PI / 180;
  const b = lon * Math.PI / 180;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)];
};

const JOURNEYS = [
  [[-9.1, 38.7], [2.35, 48.86], [12.5, 41.9]],
  [[28.98, 41], [35.9, 31.95], [31.2, 30]],
  [[100.5, 13.75], [103.8, 1.35], [115.2, -8.65]],
  [[-122.4, 37.8], [-118.2, 34.05], [-112.1, 36.1]],
  [[-77, -12], [-72, -13.5], [-68.1, -16.5]],
  [[18.4, -33.9], [28, -26.2], [31.1, -17.8]],
];

// Precompute short spherical paths once, never interpolate geographic data in
// the animation loop. Cubic tangents are shared at each stop, so the route never corners there.
export const TOUR_PATHS = JOURNEYS.map((journey) => {
  const stops = journey.map(vector);
  const points: Point[] = [];
  for (let leg = 0; leg < stops.length - 1; leg++) {
    const before = stops[Math.max(0, leg - 1)];
    const a = stops[leg];
    const b = stops[leg + 1];
    const after = stops[Math.min(stops.length - 1, leg + 2)];
    for (let step = 0; step < 32; step++) {
      const t = step / 32;
      const t2 = t * t;
      const t3 = t2 * t;
      const coordinate = (axis: number) => 0.5 * (
        2 * a[axis] + (-before[axis] + b[axis]) * t +
        (2 * before[axis] - 5 * a[axis] + 4 * b[axis] - after[axis]) * t2 +
        (-before[axis] + 3 * a[axis] - 3 * b[axis] + after[axis]) * t3
      );
      const x = coordinate(0);
      const y = coordinate(1);
      const z = coordinate(2);
      const length = Math.hypot(x, y, z);
      points.push([x / length, y / length, z / length]);
    }
  }
  points.push(stops[stops.length - 1]);
  return points;
});

/** Open, monochrome paths, shared by all markers on this globe. */
export function createServiceGlyphs() {
  return {
    hotel: new Path2D("M3 20V12Q3 10 5 10H19Q21 10 21 12V20M3 16H21M5 10V6Q5 4 7 4H17Q19 4 19 6V10M7 10V8H11V10M13 10V8H17V10"),
    group: new Path2D("M13 7A3 3 0 1 1 7 7A3 3 0 1 1 13 7M3 20V18Q3 13 10 13Q17 13 17 18V20M17 5Q21 5 21 8Q21 11 17 11M20 14Q23 15 23 19V20"),
  };
}

export function drawServiceGlyph(ctx: CanvasRenderingContext2D, path: Path2D, x: number, y: number, size: number, opacity: number, light = false) {
  if (opacity < 0.02) return;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = opacity;
  // A narrow surface-colored keyline separates the strokes from continent dots.
  // There is no filled plate, enclosing shape, shadow filter or glow.
  ctx.strokeStyle = light ? "#eaf3ed" : "#101d1c";
  ctx.lineWidth = 3;
  ctx.stroke(path);
  ctx.strokeStyle = light ? "#145d4e" : "#deede6";
  ctx.lineWidth = 1.2;
  ctx.stroke(path);
  ctx.restore();
}
