export function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.max(Math.min(value, max), min);
}
