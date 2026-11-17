// What a running card shows while it counts down (docs/screens/running.md).

const segmentCount = 24;
const lastMinutesMs = 5 * 60_000;

const pad = (value: number) => String(value).padStart(2, "0");

// "17:48", or "1:05:30" from an hour on. A started second counts as whole,
// so the card reads 0:01 until it rings rather than 0:00 too early.
export const formatRemaining = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours === 0) return `${minutes}:${pad(seconds)}`;
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
};

// The 24-segment bar from start to ring: the passed part is filled, and the
// segments that fall in the last 5 minutes are marked.
export const barSegments = (
  { startedAt, ringsAt }: { startedAt: number; ringsAt: number },
  now: number,
) => {
  const totalMs = ringsAt - startedAt;
  const passed = Math.min(1, Math.max(0, (now - startedAt) / totalMs));
  const filledCount = Math.round(passed * segmentCount);
  const lastMinutesCount = Math.ceil(
    segmentCount * Math.min(1, lastMinutesMs / totalMs),
  );
  return Array.from({ length: segmentCount }, (_, index) => ({
    isFilled: index < filledCount,
    isLastMinutes: index >= segmentCount - lastMinutesCount,
  }));
};
