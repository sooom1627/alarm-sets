import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AlarmKitManager } from "react-native-ios-alarmkit";

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

const scheduledAlarms = () => AlarmKitManager.shared.getAlarms();

afterEach(async () => {
  jest.restoreAllMocks();
  for (const { id } of await scheduledAlarms()) {
    await AlarmKitManager.shared.cancel(id);
  }
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
        start: {
          actionId: 3,
          startedAt: 1_000,
          ringsAt: 1_201_000,
          remindsAt: null,
        },
        name: "昼寝",
      }),
    );

    expect(saved.ringsAt).toBe(1_201_000);
    await waitFor(() => expect(result.current.starts).toEqual([saved]));
  });

  it("schedules the alarm and keeps its id with the start", async () => {
    const { result } = await renderStartHooks();

    const saved = await act(() =>
      result.current.startAction({
        start: {
          actionId: 3,
          startedAt: 1_000,
          ringsAt: 1_201_000,
          remindsAt: null,
        },
        name: "昼寝",
      }),
    );

    expect(await scheduledAlarms()).toEqual([
      expect.objectContaining({
        id: saved.alarmId,
        schedule: { type: "fixed", date: 1_201_000 },
      }),
    ]);
  });

  it("saves nothing when alarms are not allowed", async () => {
    jest
      .spyOn(AlarmKitManager.shared, "requestAuthorization")
      .mockResolvedValue(false);
    const { result } = await renderStartHooks();

    await act(() =>
      result.current
        .startAction({
          start: {
            actionId: 3,
            startedAt: 1_000,
            ringsAt: 1_201_000,
            remindsAt: null,
          },
          name: "昼寝",
        })
        .catch(() => undefined),
    );

    await waitFor(() => expect(result.current.starts).toEqual([]));
    expect(await scheduledAlarms()).toEqual([]);
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
        name: "家を出る",
        target: { hour: 8, minute: 0 },
      }),
    );

    await waitFor(() => expect(result.current.starts).toEqual([saved]));
    expect(await scheduledAlarms()).toHaveLength(2);
    expect(saved.remindAlarmId).toEqual(expect.any(String));
    await waitFor(() =>
      expect(result.current.lastTarget).toEqual({ hour: 8, minute: 0 }),
    );
  });
});
