export function minutesSince(uploadedAt: Date | string): number {
  const ms = Date.now() - new Date(uploadedAt).getTime();
  return Math.max(0, Math.floor(ms / 60_000));
}
