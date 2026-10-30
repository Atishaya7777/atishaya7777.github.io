const localParts = (date: Date) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]));

/** Each Monday at 09:00 begins a new collection window, including after an overdue login. */
export function collectionDue(lastCompletedAt: string | null, now = new Date()): boolean {
  if (!lastCompletedAt || !Number.isFinite(Date.parse(lastCompletedAt))) return true;
  const current = localParts(now);
  const day = new Date(`${current.year}-${current.month}-${current.day}T00:00:00Z`);
  const daysSinceMonday = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - daysSinceMonday - (daysSinceMonday === 0 && Number(current.hour) < 9 ? 7 : 0));
  const window = `${day.toISOString().slice(0, 10)}T09:00`;
  const previous = localParts(new Date(lastCompletedAt));
  return `${previous.year}-${previous.month}-${previous.day}T${previous.hour}:${previous.minute}` < window;
}
