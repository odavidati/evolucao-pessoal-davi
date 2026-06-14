export interface GCalEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  colorId?: string;
  description?: string;
  location?: string;
}

export function getEventTimes(event: GCalEvent): { start: string; end: string; isAllDay: boolean; startMinutes: number } {
  if (!event.start.dateTime) {
    return { start: '', end: '', isAllDay: true, startMinutes: 0 };
  }
  const s = new Date(event.start.dateTime);
  const e = new Date(event.end.dateTime!);
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return {
    start: fmt(s),
    end: fmt(e),
    isAllDay: false,
    startMinutes: s.getHours() * 60 + s.getMinutes(),
  };
}

export function isEventNow(event: GCalEvent): boolean {
  if (!event.start.dateTime) return false;
  const now = Date.now();
  return now >= new Date(event.start.dateTime).getTime() && now <= new Date(event.end.dateTime!).getTime();
}

const CACHE_KEY = 'gcal_events_cache';

export function getCachedEvents(): GCalEvent[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const { date, events } = JSON.parse(raw);
    if (date === new Date().toDateString()) return events;
  } catch {}
  return [];
}

export function setCachedEvents(events: GCalEvent[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toDateString(), events }));
  } catch {}
}

export async function fetchTodayCalendarEvents(accessToken: string): Promise<GCalEvent[]> {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '25',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
  );

  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) throw new Error(`GCAL_ERROR_${res.status}`);

  const data = await res.json();
  return (data.items || []) as GCalEvent[];
}
