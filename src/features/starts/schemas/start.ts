import { z } from "zod";

// Times are epoch milliseconds, so they compare and sort as numbers.
const startFields = {
  actionId: z.number().int(),
  startedAt: z.number().int(),
  ringsAt: z.number().int(),
};

const ringsAfterItStarted = ({
  startedAt,
  ringsAt,
}: {
  startedAt: number;
  ringsAt: number;
}) => ringsAt > startedAt;

// What pressing an action saves.
export const newStartSchema = z.object(startFields).refine(ringsAfterItStarted);

export type NewStart = z.infer<typeof newStartSchema>;

export const startSchema = z
  .object({ id: z.number().int(), ...startFields })
  .refine(ringsAfterItStarted);

export type Start = z.infer<typeof startSchema>;

// "Some minutes after it is pressed" starts at the press.
export const startAfterPress = (
  { id, minutes }: { id: number; minutes: number },
  pressedAt: Date,
): NewStart => ({
  actionId: id,
  startedAt: pressedAt.getTime(),
  ringsAt: pressedAt.getTime() + minutes * 60_000,
});
