import { AccessibilityInfo } from "react-native";

import * as Haptics from "expo-haptics";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster, toast } from "sonner-native";

import { listStarts } from "@/features/starts/db/starts";
import { getDb } from "@/shared/db/db";
import { createQueryClient } from "@/shared/query/query-client";

import { insertAction } from "../../db/actions";
import { ActionListScreen } from "../action-list-screen";

// The vibration is out of process.
jest.mock("expo-haptics", () => ({
  ...jest.requireActual("expo-haptics"),
  notificationAsync: jest.fn(),
}));

const pressedAt = new Date(2026, 9, 31, 14, 0);

// fireEvent presses without letting time pass; finding a tile may let some
// pass, so tests that check the time set the clock right before the press.
const renderList = async () => {
  await render(
    <GestureHandlerRootView>
      <QueryClientProvider client={createQueryClient()}>
        <ActionListScreen />
        <Toaster duration={4000} />
      </QueryClientProvider>
    </GestureHandlerRootView>,
  );
};

const addNap = () =>
  insertAction({
    name: "昼寝",
    minutes: 20,
    kind: "after",
    remindMinutes: null,
  });

beforeEach(() => {
  jest.useFakeTimers({ now: pressedAt });
});

afterEach(async () => {
  // Toasts live in a module-wide store, so clear them between tests.
  await act(() => toast.dismiss());
  jest.useRealTimers();
  jest.mocked(Haptics.notificationAsync).mockClear();
  await getDb().execAsync("DELETE FROM actions");
  await listStarts(); // creates the table when no test started anything
  await getDb().execAsync("DELETE FROM starts");
});

describe("pressing an action that rings minutes after it is pressed", () => {
  it("starts at once and rings the minutes after the press", async () => {
    const nap = await addNap();
    await renderList();
    const tile = await screen.findByRole("button", {
      name: "昼寝、押してから20分後に鳴る",
    });

    jest.setSystemTime(pressedAt);
    await fireEvent.press(tile);

    expect(await listStarts()).toEqual([
      {
        id: expect.any(Number),
        actionId: nap.id,
        startedAt: pressedAt.getTime(),
        ringsAt: new Date(2026, 9, 31, 14, 20).getTime(),
      },
    ]);
  });

  it("tells when it rings for a few seconds, with a vibration", async () => {
    await addNap();
    await renderList();

    await fireEvent.press(
      await screen.findByRole("button", {
        name: "昼寝、押してから20分後に鳴る",
      }),
    );

    expect(await screen.findByText("昼寝 14:20 に鳴ります")).toBeOnTheScreen();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      "昼寝 14:20 に鳴ります",
    );

    await act(() => jest.advanceTimersByTime(5000));

    expect(screen.queryByText("昼寝 14:20 に鳴ります")).toBeNull();
  });

  it("starts a second time when pressed again", async () => {
    await addNap();
    await renderList();
    const tile = await screen.findByRole("button", {
      name: "昼寝、押してから20分後に鳴る",
    });

    jest.setSystemTime(pressedAt);
    await fireEvent.press(tile);
    jest.setSystemTime(new Date(2026, 9, 31, 14, 1));
    await fireEvent.press(tile);

    expect((await listStarts()).map(({ ringsAt }) => ringsAt)).toEqual([
      new Date(2026, 9, 31, 14, 20).getTime(),
      new Date(2026, 9, 31, 14, 21).getTime(),
    ]);
  });

  it("says it could not start when saving fails", async () => {
    await addNap();
    await renderList();
    await listStarts();
    await getDb().execAsync("ALTER TABLE starts RENAME TO starts_away");

    try {
      await fireEvent.press(
        await screen.findByRole("button", {
          name: "昼寝、押してから20分後に鳴る",
        }),
      );

      expect(
        await screen.findByText("スタートできませんでした"),
      ).toBeOnTheScreen();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    } finally {
      await getDb().execAsync("ALTER TABLE starts_away RENAME TO starts");
    }
  });
});

describe("pressing an action that rings minutes before a target time", () => {
  it("does not start yet", async () => {
    await insertAction({
      name: "家を出る",
      minutes: 30,
      kind: "before",
      remindMinutes: null,
    });
    await renderList();

    const tile =
      await screen.findByLabelText("家を出る、目標時間の30分前に鳴る");

    expect(tile).not.toHaveProp("role", "button");
    expect(screen.queryByRole("button", { name: /家を出る/ })).toBeNull();
  });
});
