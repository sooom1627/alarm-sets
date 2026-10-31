import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { insertStart, listStarts } from "../db/starts";

const startsQueryKey = ["starts", "list"] as const;

// Function declarations, as in use-actions.ts (naming-convention rule).
export function useStarts() {
  return useQuery({ queryKey: startsQueryKey, queryFn: listStarts });
}

export function useStartAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insertStart,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: startsQueryKey }),
  });
}
