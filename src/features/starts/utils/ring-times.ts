import { z } from "zod";

// A time of day picked on the target time sheet.
export const timeOfDaySchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

export type TimeOfDay = z.infer<typeof timeOfDaySchema>;

const minuteMs = 60_000;

type RingTimesInput = {
  target: TimeOfDay;
  minutes: number;
  remindMinutes: number | null;
};

// The target is today unless its alarm time has passed, then tomorrow
// (docs/screens/target-time.md). A reminder that has passed does not ring.
export const ringTimes = (
  { target, minutes, remindMinutes }: RingTimesInput,
  now: Date,
) => {
  const targetDate = new Date(now);
  targetDate.setHours(target.hour, target.minute, 0, 0);
  if (targetDate.getTime() - minutes * minuteMs <= now.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const targetAt = targetDate.getTime();
  const ringsAt = targetAt - minutes * minuteMs;
  const remindsAt =
    remindMinutes === null ? null : ringsAt - remindMinutes * minuteMs;
  return {
    targetAt,
    ringsAt,
    remindsAt,
    isReminderPast: remindsAt !== null && remindsAt <= now.getTime(),
  };
};

// Shown as "明日 7:30" when it falls on the day after now.
export const isNextDay = (epochMs: number, now: Date) => {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(epochMs).toDateString() === tomorrow.toDateString();
};

// Without a previous target: the minutes from now, rounded up to 5 minutes,
// so the alarm rings soon.
export const firstTargetTime = (minutes: number, now: Date): TimeOfDay => {
  const target = new Date(now.getTime() + minutes * minuteMs);
  const hasSeconds = target.getSeconds() > 0 || target.getMilliseconds() > 0;
  const minute = target.getMinutes() + (hasSeconds ? 1 : 0);
  target.setMinutes(Math.ceil(minute / 5) * 5, 0, 0);
  return { hour: target.getHours(), minute: target.getMinutes() };
};
