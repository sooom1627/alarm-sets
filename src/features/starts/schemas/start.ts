import { z } from "zod";

// Times are epoch milliseconds, so they compare and sort as numbers.
const startFields = {
  actionId: z.number().int(),
  startedAt: z.number().int(),
  ringsAt: z.number().int(),
  // Only a target time start can have a reminder, and only one still ahead.
  remindsAt: z.number().int().nullable(),
};

// Whatever rings, rings after the start; the reminder before the alarm.
const isInOrder = ({
  startedAt,
  ringsAt,
  remindsAt,
}: {
  startedAt: number;
  ringsAt: number;
  remindsAt: number | null;
}) =>
  ringsAt > startedAt &&
  (remindsAt === null || (startedAt < remindsAt && remindsAt < ringsAt));

// What pressing an action saves.
export const newStartSchema = z.object(startFields).refine(isInOrder);

export type NewStart = z.infer<typeof newStartSchema>;

// The AlarmKit alarms a start scheduled. Starts saved before S-007 have none.
export const startAlarmsSchema = z.object({
  alarmId: z.string().nullable(),
  remindAlarmId: z.string().nullable(),
});

export type StartAlarms = z.infer<typeof startAlarmsSchema>;

export const startSchema = z
  .object({ id: z.number().int(), ...startFields, ...startAlarmsSchema.shape })
  .refine(isInOrder);

export type Start = z.infer<typeof startSchema>;

// "Some minutes after it is pressed" starts at the press.
export const startAfterPress = (
  { id, minutes }: { id: number; minutes: number },
  pressedAt: Date,
): NewStart => ({
  actionId: id,
  startedAt: pressedAt.getTime(),
  ringsAt: pressedAt.getTime() + minutes * 60_000,
  remindsAt: null,
});
