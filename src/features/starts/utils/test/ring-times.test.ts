import { firstTargetTime, isNextDay, ringTimes } from "../ring-times";

const at = (day: number, hour: number, minute: number) =>
  new Date(2026, 9, day, hour, minute).getTime();

describe("ringTimes", () => {
  it("rings the minutes before the target, and the reminder before that", () => {
    const now = new Date(2026, 9, 31, 6, 0);

    expect(
      ringTimes(
        { target: { hour: 8, minute: 0 }, minutes: 30, remindMinutes: 10 },
        now,
      ),
    ).toEqual({
      targetAt: at(31, 8, 0),
      ringsAt: at(31, 7, 30),
      remindsAt: at(31, 7, 20),
      isReminderPast: false,
    });
  });

  it("has no reminder when the action has none", () => {
    const now = new Date(2026, 9, 31, 6, 0);

    expect(
      ringTimes(
        { target: { hour: 8, minute: 0 }, minutes: 30, remindMinutes: null },
        now,
      ).remindsAt,
    ).toBeNull();
  });

  it("moves the target to tomorrow once the alarm time has passed", () => {
    const now = new Date(2026, 9, 31, 7, 30);

    expect(
      ringTimes(
        { target: { hour: 8, minute: 0 }, minutes: 30, remindMinutes: null },
        now,
      ),
    ).toMatchObject({ targetAt: at(32, 8, 0), ringsAt: at(32, 7, 30) });
  });

  it("keeps today while the alarm is still ahead, even if the reminder passed", () => {
    const now = new Date(2026, 9, 31, 7, 25);

    expect(
      ringTimes(
        { target: { hour: 8, minute: 0 }, minutes: 30, remindMinutes: 10 },
        now,
      ),
    ).toMatchObject({
      ringsAt: at(31, 7, 30),
      remindsAt: at(31, 7, 20),
      isReminderPast: true,
    });
  });

  it("can ring the day before a target just after midnight", () => {
    const now = new Date(2026, 9, 31, 22, 0);

    expect(
      ringTimes(
        { target: { hour: 0, minute: 10 }, minutes: 30, remindMinutes: null },
        now,
      ),
    ).toMatchObject({ targetAt: at(32, 0, 10), ringsAt: at(31, 23, 40) });
  });
});

describe("isNextDay", () => {
  it("tells a time tomorrow from a time today", () => {
    const now = new Date(2026, 9, 31, 22, 0);

    expect(isNextDay(at(31, 23, 40), now)).toBe(false);
    expect(isNextDay(at(32, 0, 10), now)).toBe(true);
  });
});

describe("firstTargetTime", () => {
  it("is the minutes from now, rounded up to 5 minutes", () => {
    expect(firstTargetTime(30, new Date(2026, 9, 31, 14, 3))).toEqual({
      hour: 14,
      minute: 35,
    });
  });

  it("stays on a time already on 5 minutes", () => {
    expect(firstTargetTime(30, new Date(2026, 9, 31, 14, 5))).toEqual({
      hour: 14,
      minute: 35,
    });
  });

  it("wraps past midnight", () => {
    expect(firstTargetTime(30, new Date(2026, 9, 31, 23, 52))).toEqual({
      hour: 0,
      minute: 25,
    });
  });
});
