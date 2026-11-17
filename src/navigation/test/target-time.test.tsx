import { Alert } from "react-native";

import { router } from "expo-router";
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from "expo-router/testing-library";

import { AlarmKitManager } from "react-native-ios-alarmkit";

import { insertAction } from "@/features/actions/db/actions";
import {
  getLastTarget,
  saveLastTarget,
} from "@/features/starts/db/last-targets";
import { listStarts } from "@/features/starts/db/starts";
import { getDb } from "@/shared/db/db";

import {
  isSheetShown,
  pickTimeOfDay,
  selectedTimeOfDay,
  shownHeaderTitles,
} from "./native-ui";

// Opens the sheet straight from its URL.
const renderSheet = async (actionId: number) => {
  await renderRouter("./src/app", {
    initialUrl: `/target-time?actionId=${actionId}`,
  });
  await screen.findByText("目標時間は？");
};

const addLeaveHome = (remindMinutes: number | null) =>
  insertAction({
    name: "家を出る",
    minutes: 30,
    kind: "before",
    remindMinutes,
  });

const scheduledAlarms = () => AlarmKitManager.shared.getAlarms();

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 9, 31, 6, 0) });
});

afterEach(async () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  for (const { id } of await scheduledAlarms()) {
    await AlarmKitManager.shared.cancel(id);
  }
  await getDb().execAsync("DELETE FROM actions");
  await listStarts(); // creates the table when no test started anything
  await getDb().execAsync("DELETE FROM starts");
  await getLastTarget(0); // creates the table when no test saved one
  await getDb().execAsync("DELETE FROM last_targets");
});

describe("opening the target time sheet", () => {
  it("opens one sheet from the list, without starting anything", async () => {
    await addLeaveHome(null);
    const app = await renderRouter("./src/app", { initialUrl: "/" });

    await fireEvent.press(
      await screen.findByRole("button", {
        name: "家を出る、目標時間の30分前に鳴る",
      }),
    );

    expect(await screen.findByText("目標時間は？")).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/target-time");
    expect(isSheetShown("target-time")).toBe(true);
    expect(shownHeaderTitles()).toContain("家を出る");
    expect(await listStarts()).toEqual([]);
  });

  it("closes when the action is not there", async () => {
    const app = await renderRouter("./src/app", { initialUrl: "/" });
    await screen.findByText("最初の行動を作りましょう");

    await act(async () => {
      router.push({ pathname: "/target-time", params: { actionId: 99 } });
    });

    expect(
      await screen.findByText("最初の行動を作りましょう"),
    ).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/");
  });
});

describe("the target time sheet", () => {
  it("asks for the target time of the action", async () => {
    const { id } = await addLeaveHome(null);
    await renderSheet(id);

    expect(
      screen.getByText("「家を出る」の時間を入れると、その 30 分前に鳴ります"),
    ).toBeOnTheScreen();
  });

  it("starts from the target time the action last started with", async () => {
    const { id } = await addLeaveHome(10);
    await saveLastTarget(id, { hour: 8, minute: 0 });
    await renderSheet(id);

    expect(selectedTimeOfDay()).toBe("8:00");
    expect(screen.getByLabelText("7:30 アラーム")).toBeOnTheScreen();
  });

  it("starts from the minutes from now, rounded up to 5 minutes, the first time", async () => {
    jest.setSystemTime(new Date(2026, 9, 31, 14, 3));
    const { id } = await addLeaveHome(null);
    await renderSheet(id);

    expect(selectedTimeOfDay()).toBe("14:35");
    expect(screen.getByLabelText("14:05 アラーム")).toBeOnTheScreen();
  });

  it("shows the reminder and alarm times for the target time", async () => {
    const { id } = await addLeaveHome(10);
    await renderSheet(id);

    await pickTimeOfDay(8, 0);

    expect(screen.getByLabelText("7:20 リマインド")).toBeOnTheScreen();
    expect(screen.getByLabelText("7:30 アラーム")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("8:00 目標時間（鳴らない）"),
    ).toBeOnTheScreen();
  });

  it("changes the times as soon as the target time changes", async () => {
    const { id } = await addLeaveHome(10);
    await renderSheet(id);
    await pickTimeOfDay(8, 0);

    await pickTimeOfDay(9, 15);

    expect(screen.getByLabelText("8:35 リマインド")).toBeOnTheScreen();
    expect(screen.getByLabelText("8:45 アラーム")).toBeOnTheScreen();
    expect(screen.queryByLabelText("7:30 アラーム")).toBeNull();
  });

  it("moves to tomorrow once today's alarm time has passed", async () => {
    const { id } = await addLeaveHome(null);
    await renderSheet(id);

    await pickTimeOfDay(6, 20);

    expect(screen.getByLabelText("明日 5:50 アラーム")).toBeOnTheScreen();
    expect(
      screen.getByLabelText("明日 6:20 目標時間（鳴らない）"),
    ).toBeOnTheScreen();
  });

  it("says a reminder that has passed will not ring", async () => {
    const { id } = await addLeaveHome(10);
    await renderSheet(id);

    await pickTimeOfDay(6, 35);

    expect(
      screen.getByLabelText("5:55 リマインド もう過ぎているので鳴りません"),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("6:05 アラーム")).toBeOnTheScreen();
  });
});

// Opens the sheet from the list, so closing it goes back there.
const openFromList = async () => {
  await renderRouter("./src/app", { initialUrl: "/" });
  await fireEvent.press(
    await screen.findByRole("button", {
      name: "家を出る、目標時間の30分前に鳴る",
    }),
  );
  await screen.findByText("目標時間は？");
};

describe("starting from the target time sheet", () => {
  it("stays open and offers the Settings app when alarms are not allowed", async () => {
    jest
      .spyOn(AlarmKitManager.shared, "requestAuthorization")
      .mockResolvedValue(false);
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    await addLeaveHome(10);
    await openFromList();
    await pickTimeOfDay(8, 0);

    await fireEvent.press(
      screen.getByRole("button", { name: "7:30 に鳴らしてスタート" }),
    );

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "アラームが許可されていません",
        "設定アプリでアラームを許可すると、スタートできます。",
        [
          expect.objectContaining({ text: "キャンセル" }),
          expect.objectContaining({ text: "設定を開く" }),
        ],
      ),
    );
    expect(isSheetShown("target-time")).toBe(true);
    expect(await listStarts()).toEqual([]);
    expect(await scheduledAlarms()).toEqual([]);
  });

  it("starts with the alarm and reminder times and closes", async () => {
    const { id } = await addLeaveHome(10);
    await openFromList();
    await pickTimeOfDay(8, 0);

    // Finding the sheet let some time pass; press at 6:00 exactly.
    jest.setSystemTime(new Date(2026, 9, 31, 6, 0));
    await fireEvent.press(
      screen.getByRole("button", { name: "7:30 に鳴らしてスタート" }),
    );

    const ringsAt = new Date(2026, 9, 31, 7, 30).getTime();
    const remindsAt = new Date(2026, 9, 31, 7, 20).getTime();
    const alarms = await scheduledAlarms();
    const ringingAt = (date: number) =>
      alarms.find(
        ({ schedule }) => schedule?.type === "fixed" && schedule.date === date,
      );
    const alarm = ringingAt(ringsAt);
    const reminder = ringingAt(remindsAt);
    expect(alarm).toEqual(expect.objectContaining({ title: "家を出る" }));
    expect(reminder).toEqual(
      expect.objectContaining({ title: "家を出る まであと 10 分" }),
    );
    expect(await listStarts()).toEqual([
      {
        id: expect.any(Number),
        actionId: id,
        startedAt: new Date(2026, 9, 31, 6, 0).getTime(),
        ringsAt,
        remindsAt,
        alarmId: alarm?.id,
        remindAlarmId: reminder?.id,
      },
    ]);
    expect(await getLastTarget(id)).toEqual({ hour: 8, minute: 0 });
    await waitFor(() => expect(isSheetShown("target-time")).toBe(false));
    expect(
      await screen.findByText("家を出る 7:30 に鳴ります"),
    ).toBeOnTheScreen();
  });

  it("does not keep a reminder that has passed", async () => {
    await addLeaveHome(10);
    await openFromList();
    await pickTimeOfDay(6, 35);

    await fireEvent.press(
      screen.getByRole("button", { name: "6:05 に鳴らしてスタート" }),
    );

    expect((await listStarts())[0].remindsAt).toBeNull();
  });

  it("says tomorrow on the button once today's alarm time has passed", async () => {
    const { id } = await addLeaveHome(null);
    await renderSheet(id);

    await pickTimeOfDay(6, 20);

    expect(
      screen.getByRole("button", { name: "明日 5:50 に鳴らしてスタート" }),
    ).toBeOnTheScreen();
  });
});
