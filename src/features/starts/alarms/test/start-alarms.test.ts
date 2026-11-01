import { AlarmKitManager } from "react-native-ios-alarmkit";

import {
  cancelStartAlarms,
  isAlarmDenied,
  scheduleStartAlarms,
} from "../start-alarms";

const ringsAt = new Date(2026, 9, 31, 7, 30).getTime();
const remindsAt = new Date(2026, 9, 31, 7, 20).getTime();

const scheduledAlarms = () => AlarmKitManager.shared.getAlarms();

afterEach(async () => {
  jest.restoreAllMocks();
  for (const { id } of await scheduledAlarms()) {
    await AlarmKitManager.shared.cancel(id);
  }
});

describe("scheduleStartAlarms", () => {
  it("schedules one alarm titled with the action at the ring time", async () => {
    const alarms = await scheduleStartAlarms({
      name: "昼寝",
      ringsAt,
      remindsAt: null,
    });

    expect(alarms).toEqual({
      alarmId: expect.any(String),
      remindAlarmId: null,
    });
    expect(await scheduledAlarms()).toEqual([
      expect.objectContaining({
        id: alarms.alarmId,
        title: "昼寝",
        schedule: { type: "fixed", date: ringsAt },
      }),
    ]);
  });

  it("also schedules the reminder, saying how long until the alarm", async () => {
    const alarms = await scheduleStartAlarms({
      name: "家を出る",
      ringsAt,
      remindsAt,
    });

    expect(alarms.remindAlarmId).toEqual(expect.any(String));
    expect(alarms.remindAlarmId).not.toBe(alarms.alarmId);
    expect(await scheduledAlarms()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: alarms.alarmId,
          title: "家を出る",
          schedule: { type: "fixed", date: ringsAt },
        }),
        expect.objectContaining({
          id: alarms.remindAlarmId,
          title: "家を出る まであと 10 分",
          schedule: { type: "fixed", date: remindsAt },
        }),
      ]),
    );
  });

  it("schedules nothing and fails when alarms are not allowed", async () => {
    jest
      .spyOn(AlarmKitManager.shared, "requestAuthorization")
      .mockResolvedValue(false);

    const error: unknown = await scheduleStartAlarms({
      name: "昼寝",
      ringsAt,
      remindsAt: null,
    }).catch((reason: unknown) => reason);

    expect(isAlarmDenied(error)).toBe(true);
    expect(await scheduledAlarms()).toEqual([]);
  });

  it("takes back the alarm when the reminder cannot be scheduled", async () => {
    const schedule = AlarmKitManager.shared.schedule;
    jest
      .spyOn(AlarmKitManager.shared, "schedule")
      .mockImplementationOnce(schedule)
      .mockRejectedValueOnce(new Error("maximumLimitReached"));

    await expect(
      scheduleStartAlarms({ name: "家を出る", ringsAt, remindsAt }),
    ).rejects.toThrow("maximumLimitReached");
    expect(await scheduledAlarms()).toEqual([]);
  });
});

describe("cancelStartAlarms", () => {
  it("cancels the alarm and the reminder", async () => {
    const alarms = await scheduleStartAlarms({
      name: "家を出る",
      ringsAt,
      remindsAt,
    });

    await cancelStartAlarms(alarms);

    expect(await scheduledAlarms()).toEqual([]);
  });
});
