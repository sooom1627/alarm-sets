import type * as DbModule from "@/shared/db/db";
import { getDb } from "@/shared/db/db";

import type * as StartsDbModule from "../starts";
import { insertStart, listStarts } from "../starts";

const noAlarms = { alarmId: null, remindAlarmId: null };

afterEach(async () => {
  await getDb().execAsync("DELETE FROM starts");
});

describe("starts db", () => {
  it("lists nothing before anything is started", async () => {
    expect(await listStarts()).toEqual([]);
  });

  it("saves a start and returns it with its id", async () => {
    const saved = await insertStart(
      {
        actionId: 3,
        startedAt: 1_000,
        ringsAt: 1_201_000,
        remindsAt: null,
      },
      noAlarms,
    );

    expect(saved).toEqual({
      id: expect.any(Number),
      actionId: 3,
      startedAt: 1_000,
      ringsAt: 1_201_000,
      remindsAt: null,
      alarmId: null,
      remindAlarmId: null,
    });
    expect(await listStarts()).toEqual([saved]);
  });

  it("keeps the reminder time of a target time start", async () => {
    const saved = await insertStart(
      {
        actionId: 3,
        startedAt: 1_000,
        ringsAt: 1_201_000,
        remindsAt: 601_000,
      },
      noAlarms,
    );

    expect(saved.remindsAt).toBe(601_000);
    expect(await listStarts()).toEqual([saved]);
  });

  it("keeps the ids of the alarms it scheduled", async () => {
    const saved = await insertStart(
      { actionId: 3, startedAt: 1_000, ringsAt: 1_201_000, remindsAt: 601_000 },
      { alarmId: "alarm-uuid", remindAlarmId: "remind-uuid" },
    );

    expect(saved).toMatchObject({
      alarmId: "alarm-uuid",
      remindAlarmId: "remind-uuid",
    });
    expect(await listStarts()).toEqual([saved]);
  });

  it("keeps two starts of the same action", async () => {
    await insertStart(
      {
        actionId: 3,
        startedAt: 1_000,
        ringsAt: 61_000,
        remindsAt: null,
      },
      noAlarms,
    );
    await insertStart(
      {
        actionId: 3,
        startedAt: 2_000,
        ringsAt: 62_000,
        remindsAt: null,
      },
      noAlarms,
    );

    expect(await listStarts()).toHaveLength(2);
  });

  it("lists the one that rings first first", async () => {
    const later = await insertStart(
      {
        actionId: 1,
        startedAt: 1_000,
        ringsAt: 900_000,
        remindsAt: null,
      },
      noAlarms,
    );
    const sooner = await insertStart(
      {
        actionId: 2,
        startedAt: 2_000,
        ringsAt: 300_000,
        remindsAt: null,
      },
      noAlarms,
    );

    expect(await listStarts()).toEqual([sooner, later]);
  });
});

describe("starts db upgrade", () => {
  it("keeps starts saved before reminder times and alarms existed", async () => {
    await jest.isolateModulesAsync(async () => {
      // A fresh connection, as on a device that ran S-005.
      const { getDb: getFreshDb } =
        require("@/shared/db/db") as typeof DbModule;
      const { listStarts: listFreshStarts } =
        require("../starts") as typeof StartsDbModule;
      await getFreshDb().execAsync(`
        CREATE TABLE starts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_id INTEGER NOT NULL,
          started_at INTEGER NOT NULL,
          rings_at INTEGER NOT NULL
        );
        INSERT INTO starts (action_id, started_at, rings_at)
          VALUES (3, 1000, 1201000);
      `);

      expect(await listFreshStarts()).toEqual([
        {
          id: 1,
          actionId: 3,
          startedAt: 1000,
          ringsAt: 1201000,
          remindsAt: null,
          alarmId: null,
          remindAlarmId: null,
        },
      ]);
    });
  });
});
