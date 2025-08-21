import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import dayjs from 'dayjs';
import { computeOpenStatus, type LocationHours } from './time';

describe('computeOpenStatus', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Fixed time helpers using vi.setSystemTime
  const base = dayjs().day(1).hour(12).minute(0).second(0).millisecond(0); // Monday noon of current week

  it('handles normal hours open/close correctly', () => {
    vi.setSystemTime(base.toDate()); // Monday noon
    const loc: LocationHours = {
      id: 'a',
      name: 'A',
      hours: {
        1: [{ open: '8:00 AM', close: '5:00 PM' }],
      },
    } as any;

    const st = computeOpenStatus(loc);
    expect(st.open).toBe(true);
    expect(st.closingAt).toBeTruthy();
  });

  it('returns future nextOpen when closed', () => {
    vi.setSystemTime(base.hour(6).toDate()); // Monday 6 AM
    const loc: LocationHours = {
      id: 'b',
      name: 'B',
      hours: {
        1: [{ open: '8:00 AM', close: '5:00 PM' }],
      },
    } as any;

    const st = computeOpenStatus(loc);
    expect(st.open).toBe(false);
    expect(dayjs(st.nextOpen!).hour()).toBe(8);
  });

  it('handles overnight ranges across midnight', () => {
    // Monday 1 AM, should consider Sunday night 10 PM - Monday 2 AM as open
    const monday1am = base.startOf('day').hour(1);
    vi.setSystemTime(monday1am.toDate());

    const loc: LocationHours = {
      id: 'c',
      name: 'C',
      hours: {
        0: [{ open: '10:00 PM', close: '2:00 AM' }],
      },
    } as any;

    const st = computeOpenStatus(loc);
    expect(st.open).toBe(true);
    expect(dayjs(st.closingAt!).hour()).toBe(2);
  });
});
