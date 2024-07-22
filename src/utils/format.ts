export function millisecondsToHHMMSS(milliseconds: number): string {
  // Calculate total seconds
  const totalSeconds = Math.floor(milliseconds / 1000);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format to two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  // Return in hh:mm:ss format
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function isHHMMSS(value: string) {
  const regex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return regex.test(value);
}

export function hHMMSSToMilliseconds(time: string): number {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return ((hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0)) * 1000;
}
