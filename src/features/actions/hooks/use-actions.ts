import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { insertAction, listActions } from "../db/actions";

const actionsQueryKey = ["actions", "list"] as const;

// Hooks are function declarations: the naming-convention rule for exported
// `use*` variables strips the prefix and then rejects the rest.
export function useActions() {
  return useQuery({ queryKey: actionsQueryKey, queryFn: listActions });
}

export function useCreateAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insertAction,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: actionsQueryKey }),
  });
}
