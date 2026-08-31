export function formatTimeSince(createdAt: Date | string): string {
  const ms = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const totalMinutes = Math.floor(ms / 60_000);

  const days = Math.floor(totalMinutes / (60 * 24));
  if (days >= 1) {
    return `${days}d`;
  }

  const hours = Math.floor(totalMinutes / 60);
  if (hours >= 1) {
    const mins = totalMinutes % 60;
    return `${hours}hr ${mins}m`;
  }

  return `${totalMinutes}m`;
}
