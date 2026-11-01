import { getDb } from "@/shared/db/db";

import { getLastTarget, saveLastTarget } from "../last-targets";

afterEach(async () => {
  await getDb().execAsync("DELETE FROM last_targets");
});

describe("last targets db", () => {
  it("has none before a target is saved", async () => {
    expect(await getLastTarget(3)).toBeNull();
  });

  it("keeps the target of each action", async () => {
    await saveLastTarget(3, { hour: 8, minute: 0 });
    await saveLastTarget(4, { hour: 21, minute: 45 });

    expect(await getLastTarget(3)).toEqual({ hour: 8, minute: 0 });
    expect(await getLastTarget(4)).toEqual({ hour: 21, minute: 45 });
  });

  it("replaces the action's previous target", async () => {
    await saveLastTarget(3, { hour: 8, minute: 0 });
    await saveLastTarget(3, { hour: 7, minute: 30 });

    expect(await getLastTarget(3)).toEqual({ hour: 7, minute: 30 });
  });
});
