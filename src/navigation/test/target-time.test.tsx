import { router } from "expo-router";
import {
  act,
  fireEvent,
  renderRouter,
  screen,
} from "expo-router/testing-library";

import { insertAction } from "@/features/actions/db/actions";
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

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 9, 31, 6, 0) });
});

afterEach(async () => {
  jest.useRealTimers();
  await getDb().execAsync("DELETE FROM actions");
});

describe("opening the target time sheet", () => {
  it("opens one sheet from the list, without starting anything", async () => {
    await addLeaveHome(null);
    const app = renderRouter("./src/app", { initialUrl: "/" });
    await app;

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
    const app = renderRouter("./src/app", { initialUrl: "/" });
    await app;
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

  it("starts from the minutes from now, rounded up to 5 minutes", async () => {
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
