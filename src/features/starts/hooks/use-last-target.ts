import { useQuery } from "@tanstack/react-query";

import { getLastTarget } from "../db/last-targets";

export const lastTargetQueryKey = (actionId: number) =>
  ["lastTargets", actionId] as const;

// Function declaration, as in use-actions.ts (naming-convention rule).
export function useLastTarget(actionId: number) {
  return useQuery({
    queryKey: lastTargetQueryKey(actionId),
    queryFn: () => getLastTarget(actionId),
  });
}
