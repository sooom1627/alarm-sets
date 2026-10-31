import { startAfterPress, startSchema } from "../start";

describe("startAfterPress", () => {
  it("rings the action's minutes after it was pressed", () => {
    const pressedAt = new Date(2026, 9, 31, 14, 0);

    expect(startAfterPress({ id: 3, minutes: 20 }, pressedAt)).toEqual({
      actionId: 3,
      startedAt: pressedAt.getTime(),
      ringsAt: new Date(2026, 9, 31, 14, 20).getTime(),
    });
  });

  it("rings on the next day when the minutes cross midnight", () => {
    const pressedAt = new Date(2026, 9, 31, 23, 50);

    expect(startAfterPress({ id: 1, minutes: 30 }, pressedAt).ringsAt).toBe(
      new Date(2026, 10, 1, 0, 20).getTime(),
    );
  });
});

describe("startSchema", () => {
  const valid = { id: 1, actionId: 3, startedAt: 1000, ringsAt: 61000 };

  it("accepts an action, when it started and when it rings", () => {
    expect(startSchema.parse(valid)).toEqual(valid);
  });

  it("rejects a start that rings before it started", () => {
    expect(startSchema.safeParse({ ...valid, ringsAt: 999 }).success).toBe(
      false,
    );
  });

  it("rejects times that are not whole milliseconds", () => {
    expect(startSchema.safeParse({ ...valid, ringsAt: 1.5 }).success).toBe(
      false,
    );
  });
});
