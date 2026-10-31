import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { getDb } from "@/shared/db/db";
import { createQueryClient } from "@/shared/query/query-client";

import { useStartAction, useStarts } from "../use-starts";

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    {children}
  </QueryClientProvider>
);

const renderStartHooks = () =>
  renderHook(
    () => {
      const { data: starts } = useStarts();
      const { mutateAsync: startAction } = useStartAction();
      return { starts, startAction };
    },
    { wrapper },
  );

afterEach(async () => {
  await getDb().execAsync("DELETE FROM starts");
});

describe("useStarts / useStartAction", () => {
  it("reads the saved starts", async () => {
    const { result } = await renderStartHooks();

    await waitFor(() => expect(result.current.starts).toEqual([]));
  });

  it("shows a new start without reloading", async () => {
    const { result } = await renderStartHooks();
    await waitFor(() => expect(result.current.starts).toEqual([]));

    const saved = await act(() =>
      result.current.startAction({
        actionId: 3,
        startedAt: 1_000,
        ringsAt: 1_201_000,
      }),
    );

    expect(saved.ringsAt).toBe(1_201_000);
    await waitFor(() => expect(result.current.starts).toEqual([saved]));
  });
});
