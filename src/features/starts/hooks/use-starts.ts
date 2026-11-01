import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelStartAlarms, scheduleStartAlarms } from "../alarms/start-alarms";
import { saveLastTarget } from "../db/last-targets";
import { insertStart, listStarts } from "../db/starts";
import type { NewStart } from "../schemas/start";
import type { TimeOfDay } from "../utils/ring-times";

import { lastTargetQueryKey } from "./use-last-target";

const startsQueryKey = ["starts", "list"] as const;

// The alarms come first: a start that cannot ring is not saved. If saving
// fails, the alarms are taken back.
const startWithAlarms = async (start: NewStart, name: string) => {
  const alarms = await scheduleStartAlarms({
    name,
    ringsAt: start.ringsAt,
    remindsAt: start.remindsAt,
  });
  try {
    return await insertStart(start, alarms);
  } catch (error) {
    await cancelStartAlarms(alarms);
    throw error;
  }
};

// Function declarations, as in use-actions.ts (naming-convention rule).
export function useStarts() {
  return useQuery({ queryKey: startsQueryKey, queryFn: listStarts });
}

export function useStartAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ start, name }: { start: NewStart; name: string }) =>
      startWithAlarms(start, name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: startsQueryKey }),
  });
}

// A target time start also keeps its target, for the sheet to offer next time.
export function useStartAtTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      start,
      name,
      target,
    }: {
      start: NewStart;
      name: string;
      target: TimeOfDay;
    }) => {
      const saved = await startWithAlarms(start, name);
      await saveLastTarget(start.actionId, target);
      return saved;
    },
    onSuccess: ({ actionId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: startsQueryKey }),
        queryClient.invalidateQueries({
          queryKey: lastTargetQueryKey(actionId),
        }),
      ]),
  });
}
