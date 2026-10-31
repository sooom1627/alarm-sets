import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { getDb } from "@/shared/db/db";
import { createQueryClient } from "@/shared/query/query-client";

import { getLastTarget } from "../../db/last-targets";
import { useLastTarget } from "../use-last-target";
import { useStartAction, useStartAtTarget, useStarts } from "../use-starts";

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
  await getLastTarget(0); // creates the table when no test saved one
  await getDb().execAsync("DELETE FROM last_targets");
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
        remindsAt: null,
      }),
    );

    expect(saved.ringsAt).toBe(1_201_000);
    await waitFor(() => expect(result.current.starts).toEqual([saved]));
  });
});

describe("useStartAtTarget", () => {
  it("saves the start and keeps its target for next time", async () => {
    const { result } = await renderHook(
      () => {
        const { data: starts } = useStarts();
        const { data: lastTarget } = useLastTarget(3);
        const { mutateAsync: startAtTarget } = useStartAtTarget();
        return { starts, lastTarget, startAtTarget };
      },
      { wrapper },
    );
    await waitFor(() => expect(result.current.lastTarget).toBeNull());

    const saved = await act(() =>
      result.current.startAtTarget({
        start: {
          actionId: 3,
          startedAt: 1_000,
          ringsAt: 1_201_000,
          remindsAt: 601_000,
        },
        target: { hour: 8, minute: 0 },
      }),
    );

    await waitFor(() => expect(result.current.starts).toEqual([saved]));
    await waitFor(() =>
      expect(result.current.lastTarget).toEqual({ hour: 8, minute: 0 }),
    );
  });
});
