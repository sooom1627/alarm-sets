import { z } from "zod";

export const actionNameMaxLength = 16;
export const actionMinMinutes = 1;
export const actionMaxMinutes = 240;

// When the action rings: some minutes after it is pressed, or some minutes
// before a target time asked for when it is pressed.
export const actionKindSchema = z.enum(["after", "before"]);

export type ActionKind = z.infer<typeof actionKindSchema>;

// What the create sheet saves.
export const newActionSchema = z.object({
  name: z.string().trim().min(1).max(actionNameMaxLength),
  minutes: z.number().int().min(actionMinMinutes).max(actionMaxMinutes),
  kind: actionKindSchema,
});

export type NewAction = z.infer<typeof newActionSchema>;

export const actionSchema = newActionSchema.extend({
  id: z.number().int(),
});

export type Action = z.infer<typeof actionSchema>;

// Translation keys for each kind's text in the create sheet.
export const actionKindLabelKeys = {
  after: {
    label: "create.kinds.after.label",
    example: "create.kinds.after.example",
  },
  before: {
    label: "create.kinds.before.label",
    example: "create.kinds.before.example",
  },
} as const satisfies Record<ActionKind, { label: string; example: string }>;
