import {
  act,
  fireEvent,
  renderRouter,
  screen,
} from "expo-router/testing-library";

import { insertAction } from "@/features/actions/db/actions";
import * as startsDb from "@/features/starts/db/starts";
import { insertStart, listStarts } from "@/features/starts/db/starts";
import { getDb } from "@/shared/db/db";

const at = (hour: number, minute: number) =>
  new Date(2026, 10, 18, hour, minute).getTime();

const noAlarms = { alarmId: null, remindAlarmId: null };

const renderRunning = async () => {
  const app = await renderRouter("./src/app", { initialUrl: "/running" });
  return { app };
};

// 7:00 の昼寝（押してから 20 分後）と、8:00 が目標の家を出る（30 分前、
// リマインド 10 分）。
const startNapAndLeaveHome = async () => {
  const nap = await insertAction({
    name: "昼寝",
    minutes: 20,
    kind: "after",
    remindMinutes: null,
  });
  const leaveHome = await insertAction({
    name: "家を出る",
    minutes: 30,
    kind: "before",
    remindMinutes: 10,
  });
  await insertStart(
    {
      actionId: leaveHome.id,
      startedAt: at(7, 0),
      ringsAt: at(7, 30),
      remindsAt: at(7, 20),
    },
    noAlarms,
  );
  await insertStart(
    {
      actionId: nap.id,
      startedAt: at(7, 0),
      ringsAt: at(7, 20),
      remindsAt: null,
    },
    noAlarms,
  );
};

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 18, 7, 0) });
});

afterEach(async () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  await getDb().execAsync("DELETE FROM actions");
  await listStarts(); // creates the table when no test started anything
  await getDb().execAsync("DELETE FROM starts");
});

describe("running", () => {
  it("says nothing is running and leads back to the list", async () => {
    const { app } = await renderRunning();

    expect(
      await screen.findByText("動いているものはありません"),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "行動の一覧へ" }));

    expect(app.getPathname()).toBe("/");
  });

  it("lists what has started, the first to ring first", async () => {
    await startNapAndLeaveHome();
    await renderRunning();

    // The home tab is mounted too, and its tiles end with に鳴る as well.
    const cards = await screen.findAllByLabelText(/、\d+:\d+に鳴る$/);

    expect(cards.map((card) => card.props["aria-label"])).toEqual([
      "昼寝、7:20に鳴る",
      "家を出る、7:30に鳴る",
    ]);
  });

  it("shows how it was started, the time left and the ring times", async () => {
    await startNapAndLeaveHome();
    await renderRunning();
    await screen.findByLabelText("家を出る、7:30に鳴る");

    expect(screen.getByText("押してから 20 分後")).toBeOnTheScreen();
    expect(screen.getByText("目標 8:00")).toBeOnTheScreen();
    expect(screen.getByText("20:00")).toBeOnTheScreen();
    expect(screen.getByText("30:00")).toBeOnTheScreen();
    expect(screen.getByText("リマインド 7:20")).toBeOnTheScreen();
    expect(screen.getByText("鳴る 7:30")).toBeOnTheScreen();
  });

  it("counts down every second", async () => {
    await startNapAndLeaveHome();
    await renderRunning();
    await screen.findByText("20:00");

    await act(() => jest.advanceTimersByTime(1000));

    expect(screen.getByText("19:59")).toBeOnTheScreen();
  });

  it("drops a start once its ring time has passed", async () => {
    await startNapAndLeaveHome();
    await renderRunning();
    await screen.findByLabelText("昼寝、7:20に鳴る");

    await act(() => jest.advanceTimersByTime(20 * 60_000));

    expect(screen.queryByLabelText("昼寝、7:20に鳴る")).toBeNull();
    expect(screen.getByLabelText("家を出る、7:30に鳴る")).toBeOnTheScreen();
  });

  it("says tomorrow for a ring time after midnight", async () => {
    jest.setSystemTime(new Date(2026, 10, 18, 23, 50));
    const nap = await insertAction({
      name: "昼寝",
      minutes: 20,
      kind: "after",
      remindMinutes: null,
    });
    await insertStart(
      {
        actionId: nap.id,
        startedAt: at(23, 50),
        ringsAt: at(24, 10),
        remindsAt: null,
      },
      noAlarms,
    );
    await renderRunning();

    expect(
      await screen.findByLabelText("昼寝、明日 0:10に鳴る"),
    ).toBeOnTheScreen();
    expect(screen.getByText("鳴る 明日 0:10")).toBeOnTheScreen();
  });

  it("offers to try again when the starts cannot be read", async () => {
    jest.spyOn(startsDb, "listStarts").mockRejectedValueOnce(new Error("disk"));
    await renderRunning();

    expect(
      await screen.findByText("動いているものを読み込めませんでした"),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "もう一度" }));

    expect(
      await screen.findByText("動いているものはありません"),
    ).toBeOnTheScreen();
  });
});
