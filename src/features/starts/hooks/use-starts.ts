import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { saveLastTarget } from "../db/last-targets";
import { insertStart, listStarts } from "../db/starts";
import type { NewStart } from "../schemas/start";
import type { TimeOfDay } from "../utils/ring-times";

import { lastTargetQueryKey } from "./use-last-target";

const startsQueryKey = ["starts", "list"] as const;

// Function declarations, as in use-actions.ts (naming-convention rule).
export function useStarts() {
  return useQuery({ queryKey: startsQueryKey, queryFn: listStarts });
}

export function useStartAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (start: NewStart) =>
      insertStart(start, { alarmId: null, remindAlarmId: null }),
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
      target,
    }: {
      start: NewStart;
      target: TimeOfDay;
    }) => {
      const saved = await insertStart(start, {
        alarmId: null,
        remindAlarmId: null,
      });
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
