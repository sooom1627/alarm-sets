import { getDb } from "@/shared/db/db";

import { insertStart, listStarts } from "../starts";

afterEach(async () => {
  await getDb().execAsync("DELETE FROM starts");
});

describe("starts db", () => {
  it("lists nothing before anything is started", async () => {
    expect(await listStarts()).toEqual([]);
  });

  it("saves a start and returns it with its id", async () => {
    const saved = await insertStart({
      actionId: 3,
      startedAt: 1_000,
      ringsAt: 1_201_000,
    });

    expect(saved).toEqual({
      id: expect.any(Number),
      actionId: 3,
      startedAt: 1_000,
      ringsAt: 1_201_000,
    });
    expect(await listStarts()).toEqual([saved]);
  });

  it("keeps two starts of the same action", async () => {
    await insertStart({ actionId: 3, startedAt: 1_000, ringsAt: 61_000 });
    await insertStart({ actionId: 3, startedAt: 2_000, ringsAt: 62_000 });

    expect(await listStarts()).toHaveLength(2);
  });

  it("lists the one that rings first first", async () => {
    const later = await insertStart({
      actionId: 1,
      startedAt: 1_000,
      ringsAt: 900_000,
    });
    const sooner = await insertStart({
      actionId: 2,
      startedAt: 2_000,
      ringsAt: 300_000,
    });

    expect(await listStarts()).toEqual([sooner, later]);
  });
});
