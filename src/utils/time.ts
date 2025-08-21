import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type TimeRange = {
  open: string; // e.g., "8:00 AM"
  close: string; // e.g., "2:00 AM" (may be overnight)
};

export type DayRange = TimeRange[]; // multiple ranges per day

export type LocationHours = {
  id: string;
  name: string;
  label?: string;
  hours: Record<number, DayRange>; // 0=Sunday ... 6=Saturday
};

export type OpenStatus = {
  location: { id: string; name: string; label?: string };
  open: boolean;
  closingAt?: Date;
  nextOpen?: Date;
};

function parseTimeForDay(time: string, ref: dayjs.Dayjs) {
  // Parse a time like "10:00 PM" anchored to the date of ref
  const t = dayjs(time, 'h:mm A');
  const anchored = ref.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
  return anchored;
}

function addDay(d: dayjs.Dayjs, days = 1) {
  return d.add(days, 'day');
}

function normalizeRangesForWindow(ranges: TimeRange[], base: dayjs.Dayjs) {
  // Expand ranges possibly overnight into intervals within [base - 1d, base + 2d] window
  const windowStart = base.startOf('day').subtract(1, 'day');
  const windowEnd = base.endOf('day').add(2, 'day');
  const out: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];

  for (const r of ranges) {
    const start = parseTimeForDay(r.open, base);
    let end = parseTimeForDay(r.close, base);

    // If end before or equal start, treat as overnight into next day
    if (!end.isAfter(start)) {
      end = addDay(end, 1);
    }

    // Push the interval for the base day
    out.push({ start, end });

    // Also consider previous-day overnight range that spills into today
    const prevStart = parseTimeForDay(r.open, addDay(base, -1));
    let prevEnd = parseTimeForDay(r.close, addDay(base, -1));
    if (!prevEnd.isAfter(prevStart)) prevEnd = addDay(prevEnd, 1);
    out.push({ start: prevStart, end: prevEnd });

    // And next-day ranges in case we are looking for next open
    const nextStart = parseTimeForDay(r.open, addDay(base, 1));
    let nextEnd = parseTimeForDay(r.close, addDay(base, 1));
    if (!nextEnd.isAfter(nextStart)) nextEnd = addDay(nextEnd, 1);
    out.push({ start: nextStart, end: nextEnd });
  }

  // Filter to our window
  return out.filter(iv => iv.end.isAfter(windowStart) && iv.start.isBefore(windowEnd));
}

export function computeOpenStatus(loc: LocationHours): OpenStatus {
  const now = dayjs();
  const dow = now.day(); // 0..6

  const todayRanges = loc.hours[dow] || [];
  const yesterdayRanges = loc.hours[(dow + 6) % 7] || [];
  const tomorrowRanges = loc.hours[(dow + 1) % 7] || [];

  const intervals = [
    ...normalizeRangesForWindow(todayRanges, now),
    ...normalizeRangesForWindow(yesterdayRanges, now),
    ...normalizeRangesForWindow(tomorrowRanges, now),
  ];

  // Determine if now is within any interval
  let open = false;
  let closingAt: Date | undefined;
  for (const iv of intervals) {
    if (now.isAfter(iv.start) && now.isBefore(iv.end)) {
      open = true;
      if (!closingAt || dayjs(closingAt).isAfter(iv.end)) {
        closingAt = iv.end.toDate();
      }
    }
  }

  if (open) {
    return { location: { id: loc.id, name: loc.name, label: loc.label }, open: true, closingAt };
  }

  // Find the next interval starting after now
  const future = intervals
    .filter(iv => iv.start.isAfter(now))
    .sort((a, b) => a.start.valueOf() - b.start.valueOf());
  const next = future[0];

  return {
    location: { id: loc.id, name: loc.name, label: loc.label },
    open: false,
    nextOpen: next?.start.toDate(),
  };
}
