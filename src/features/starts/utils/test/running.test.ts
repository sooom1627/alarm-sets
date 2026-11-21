import { barSegments, formatRemaining } from "../running";

const second = 1000;
const minute = 60 * second;

describe("formatRemaining", () => {
  it("shows minutes and seconds under an hour", () => {
    expect(formatRemaining(17 * minute + 48 * second)).toBe("17:48");
  });

  it("pads the seconds", () => {
    expect(formatRemaining(4 * minute + 5 * second)).toBe("4:05");
  });

  it("adds the hours from an hour on", () => {
    expect(formatRemaining(65 * minute + 30 * second)).toBe("1:05:30");
  });

  it("counts a started second as a whole one, so 0:00 is never shown early", () => {
    expect(formatRemaining(500)).toBe("0:01");
  });
});

describe("barSegments", () => {
  const start = { startedAt: 0, ringsAt: 120 * minute };

  it("has 24 segments", () => {
    expect(barSegments(start, 0)).toHaveLength(24);
  });

  it("fills the part of the time that has passed", () => {
    const segments = barSegments(start, 30 * minute);

    expect(segments.filter(({ isFilled }) => isFilled)).toHaveLength(6);
    expect(segments.slice(0, 6).every(({ isFilled }) => isFilled)).toBe(true);
  });

  it("marks the last 5 minutes", () => {
    const segments = barSegments(start, 0);

    expect(segments.filter(({ isLastMinutes }) => isLastMinutes)).toHaveLength(
      1,
    );
    expect(segments[23].isLastMinutes).toBe(true);
  });

  it("marks every segment when the whole time is 5 minutes or less", () => {
    const segments = barSegments({ startedAt: 0, ringsAt: 4 * minute }, 0);

    expect(segments.every(({ isLastMinutes }) => isLastMinutes)).toBe(true);
  });

  it("stays full once the ring time has passed", () => {
    const segments = barSegments(start, 200 * minute);

    expect(segments.every(({ isFilled }) => isFilled)).toBe(true);
  });
});
