import { formatTime, getTimeRemaining } from '@/utils/timer';

describe('timer', () => {
  describe('formatTime', () => {
    it('formats zero milliseconds correctly', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    it('formats seconds correctly', () => {
      expect(formatTime(1000)).toBe('00:00:01');
      expect(formatTime(5000)).toBe('00:00:05');
      expect(formatTime(59000)).toBe('00:00:59');
    });

    it('formats minutes correctly', () => {
      expect(formatTime(60000)).toBe('00:01:00');
      expect(formatTime(120000)).toBe('00:02:00');
      expect(formatTime(3540000)).toBe('00:59:00');
    });

    it('formats hours correctly', () => {
      expect(formatTime(3600000)).toBe('01:00:00');
      expect(formatTime(7200000)).toBe('02:00:00');
      expect(formatTime(86400000)).toBe('24:00:00');
    });

    it('formats combined time correctly', () => {
      expect(formatTime(3661000)).toBe('01:01:01');
      expect(formatTime(7323000)).toBe('02:02:03');
      expect(formatTime(3665000)).toBe('01:01:05');
    });

    it('handles negative milliseconds by returning 00:00:00', () => {
      expect(formatTime(-1000)).toBe('00:00:00');
      expect(formatTime(-5000)).toBe('00:00:00');
    });

    it('pads single digit values with zeros', () => {
      expect(formatTime(61000)).toBe('00:01:01');
      expect(formatTime(3601000)).toBe('01:00:01');
      expect(formatTime(3660000)).toBe('01:01:00');
    });

    it('handles large time values', () => {
      expect(formatTime(90000000)).toBe('25:00:00');
      expect(formatTime(366100000)).toBe('101:41:40');
    });

    it('rounds down fractional seconds', () => {
      expect(formatTime(1500)).toBe('00:00:01');
      expect(formatTime(1999)).toBe('00:00:01');
      expect(formatTime(5999)).toBe('00:00:05');
    });
  });

  describe('getTimeRemaining', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns correct time remaining for future date', () => {
      const now = Date.now();
      const futureDate = now + 3600000; // 1 hour from now

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(futureDate);
      expect(remaining).toBe(3600000);
    });

    it('returns zero for past date', () => {
      const now = Date.now();
      const pastDate = now - 3600000; // 1 hour ago

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(pastDate);
      expect(remaining).toBe(0);
    });

    it('returns zero for current time', () => {
      const now = Date.now();

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(now);
      expect(remaining).toBe(0);
    });

    it('returns correct time remaining for date in the near future', () => {
      const now = Date.now();
      const futureDate = now + 5000; // 5 seconds from now

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(futureDate);
      expect(remaining).toBe(5000);
    });

    it('returns correct time remaining for date far in the future', () => {
      const now = Date.now();
      const futureDate = now + 86400000; // 24 hours from now

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(futureDate);
      expect(remaining).toBe(86400000);
    });

    it('handles negative result by returning zero', () => {
      const now = Date.now();
      const pastDate = now - 1000; // 1 second ago

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(pastDate);
      expect(remaining).toBe(0);
    });

    it('updates correctly when time passes', () => {
      const startTime = Date.now();
      const targetTime = startTime + 10000; // 10 seconds from start

      jest.setSystemTime(startTime);
      let remaining = getTimeRemaining(targetTime);
      expect(remaining).toBe(10000);

      // Advance time by 3 seconds
      jest.setSystemTime(startTime + 3000);
      remaining = getTimeRemaining(targetTime);
      expect(remaining).toBe(7000);

      // Advance time by 7 more seconds (total 10 seconds)
      jest.setSystemTime(startTime + 10000);
      remaining = getTimeRemaining(targetTime);
      expect(remaining).toBe(0);
    });

    it('handles very large future dates', () => {
      const now = Date.now();
      const farFuture = now + 31536000000; // 1 year from now

      jest.setSystemTime(now);

      const remaining = getTimeRemaining(farFuture);
      expect(remaining).toBe(31536000000);
    });
  });
});

