import { getDb } from "@/shared/db/db";

import { insertAction, listActions } from "../actions";

afterEach(async () => {
  await getDb().execAsync("DELETE FROM actions");
});

describe("actions db", () => {
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
