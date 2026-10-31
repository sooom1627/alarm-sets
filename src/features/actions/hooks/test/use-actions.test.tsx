import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { getDb } from "@/shared/db/db";
import { createQueryClient } from "@/shared/query/query-client";

import { useActions, useCreateAction } from "../use-actions";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

const renderActionHooks = () =>
  renderHook(
    () => {
      const { data: actions } = useActions();
      const { mutateAsync: createAction } = useCreateAction();
      return { actions, createAction };
    },
    { wrapper },
  );

afterEach(async () => {
  await getDb().execAsync("DELETE FROM actions");
});

describe("useActions / useCreateAction", () => {
  it("reads the saved actions", async () => {
    const { result } = await renderActionHooks();

    await waitFor(() => expect(result.current.actions).toEqual([]));
  });

  it("shows a created action in the list without reloading", async () => {
    const { result } = await renderActionHooks();
    await waitFor(() => expect(result.current.actions).toEqual([]));

    await act(() =>
      result.current.createAction({
        name: "昼寝",
        minutes: 20,
        kind: "after",
      }),
    );

    await waitFor(() =>
      expect(result.current.actions).toEqual([
        { id: expect.any(Number), name: "昼寝", minutes: 20, kind: "after" },
      ]),
    );
  });
});
