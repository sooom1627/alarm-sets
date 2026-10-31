import type * as DbModule from "@/shared/db/db";
import { getDb } from "@/shared/db/db";

import type * as ActionsDbModule from "../actions";
import { insertAction, listActions } from "../actions";

afterEach(async () => {
  await getDb().execAsync("DELETE FROM actions");
});

describe("actions db", () => {
  it("keeps the reminder minutes of a target time action", async () => {
    const saved = await insertAction({
      name: "家を出る",
      minutes: 30,
      kind: "before",
      remindMinutes: 10,
    });

    expect(saved.remindMinutes).toBe(10);
    expect(await listActions()).toEqual([saved]);
  });

  it("lists nothing before anything is saved", async () => {
    expect(await listActions()).toEqual([]);
  });

  it("saves an action and returns it with its id", async () => {
    const saved = await insertAction({
      name: "家を出る",
      minutes: 30,
      kind: "before",
      remindMinutes: null,
    });

    expect(saved).toEqual({
      id: expect.any(Number),
      name: "家を出る",
      minutes: 30,
      kind: "before",
      remindMinutes: null,
    });
    expect(await listActions()).toEqual([saved]);
  });

  it("lists actions in the order they were made", async () => {
    await insertAction({
      name: "昼寝",
      minutes: 20,
      kind: "after",
      remindMinutes: null,
    });
    await insertAction({
      name: "家を出る",
      minutes: 30,
      kind: "before",
      remindMinutes: null,
    });
    await insertAction({
      name: "お茶を淹れる",
      minutes: 4,
      kind: "after",
      remindMinutes: null,
    });

    const names = (await listActions()).map(({ name }) => name);
    expect(names).toEqual(["昼寝", "家を出る", "お茶を淹れる"]);
  });
});

describe("actions db upgrade", () => {
  it("keeps actions saved before reminders existed", async () => {
    await jest.isolateModulesAsync(async () => {
      // A fresh connection, as on a device that ran the earlier version.
      const { getDb: getFreshDb } =
        require("@/shared/db/db") as typeof DbModule;
      const { listActions: listFreshActions } =
        require("../actions") as typeof ActionsDbModule;
      await getFreshDb().execAsync(`
        CREATE TABLE actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          minutes INTEGER NOT NULL,
          kind TEXT NOT NULL
        );
        INSERT INTO actions (name, minutes, kind) VALUES ('昼寝', 20, 'after');
      `);

      expect(await listFreshActions()).toEqual([
        {
          id: 1,
          name: "昼寝",
          minutes: 20,
          kind: "after",
          remindMinutes: null,
        },
      ]);
    });
  });
});
