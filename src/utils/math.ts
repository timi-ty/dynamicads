export function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.max(Math.min(value, max), min);
}

export function windowToConatainerPoint(
  container: HTMLElement,
  windowPoint: { x: number; y: number },
) {
  // Get the bounding rectangle of the container
  const rect = container.getBoundingClientRect();

  // Convert the point coordinates to the container's coordinate system
  const x = windowPoint.x - rect.left;
  const y = windowPoint.y - rect.top;

  return { x, y };
}
