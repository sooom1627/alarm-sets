import { z } from "zod";

export const actionNameMaxLength = 16;
export const actionMinMinutes = 1;
export const actionMaxMinutes = 240;

// When the action rings: some minutes after it is pressed, or some minutes
// before a target time asked for when it is pressed.
export const actionKindSchema = z.enum(["after", "before"]);

export type ActionKind = z.infer<typeof actionKindSchema>;

export const actionMinRemindMinutes = 5;
export const actionMaxRemindMinutes = 60;
export const actionRemindStep = 5;

const actionFields = {
  name: z.string().trim().min(1).max(actionNameMaxLength),
  minutes: z.number().int().min(actionMinMinutes).max(actionMaxMinutes),
  kind: actionKindSchema,
  // Rings this many minutes before the alarm, so it may exceed `minutes`.
  // Only a target time action has one; otherwise it is null.
  remindMinutes: z
    .number()
    .int()
    .min(actionMinRemindMinutes)
    .max(actionMaxRemindMinutes)
    .multipleOf(actionRemindStep)
    .nullable(),
};

const hasReminderOnlyBeforeTarget = ({
  kind,
  remindMinutes,
}: {
  kind: ActionKind;
  remindMinutes: number | null;
}) => kind === "before" || remindMinutes === null;

// What the create sheet saves.
export const newActionSchema = z
  .object(actionFields)
  .refine(hasReminderOnlyBeforeTarget);

export type NewAction = z.infer<typeof newActionSchema>;

export const actionSchema = z
  .object({ id: z.number().int(), ...actionFields })
  .refine(hasReminderOnlyBeforeTarget);

export type Action = z.infer<typeof actionSchema>;

// Translation keys for each kind's text: the choice in the create sheet and
// the tile in the action list.
export const actionKindLabelKeys = {
  after: {
    label: "create.kinds.after.label",
    example: "create.kinds.after.example",
    tag: "actionList.kinds.after.tag",
    unit: "actionList.kinds.after.unit",
    spoken: "actionList.kinds.after.spoken",
  },
  before: {
    label: "create.kinds.before.label",
    example: "create.kinds.before.example",
    tag: "actionList.kinds.before.tag",
    unit: "actionList.kinds.before.unit",
    spoken: "actionList.kinds.before.spoken",
  },
} as const satisfies Record<
  ActionKind,
  Record<"label" | "example" | "tag" | "unit" | "spoken", string>
>;
