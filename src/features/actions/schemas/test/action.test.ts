import { actionSchema, newActionSchema } from "../action";

const valid = { name: "家を出る", minutes: 30, kind: "before" };

describe("newActionSchema", () => {
  it("accepts a name, minutes and kind", () => {
    expect(newActionSchema.parse(valid)).toEqual(valid);
  });

  it("trims the name", () => {
    expect(newActionSchema.parse({ ...valid, name: "  昼寝 " }).name).toBe(
      "昼寝",
    );
  });

  it("rejects an empty or blank name", () => {
    expect(newActionSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
    expect(newActionSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
  });

  it("accepts up to 16 characters of name", () => {
    const name16 = "あ".repeat(16);
    expect(newActionSchema.safeParse({ ...valid, name: name16 }).success).toBe(
      true,
    );
    expect(
      newActionSchema.safeParse({ ...valid, name: `${name16}あ` }).success,
    ).toBe(false);
  });

  it("accepts whole minutes from 1 to 240", () => {
    for (const minutes of [1, 240]) {
      expect(newActionSchema.safeParse({ ...valid, minutes }).success).toBe(
        true,
      );
    }
    for (const minutes of [0, 241, 1.5]) {
      expect(newActionSchema.safeParse({ ...valid, minutes }).success).toBe(
        false,
      );
    }
  });

  it("accepts only the two kinds", () => {
    expect(newActionSchema.parse({ ...valid, kind: "after" }).kind).toBe(
      "after",
    );
    expect(newActionSchema.safeParse({ ...valid, kind: "now" }).success).toBe(
      false,
    );
  });
});

describe("actionSchema", () => {
  it("adds the stored id", () => {
    expect(actionSchema.parse({ ...valid, id: 1 })).toEqual({
      ...valid,
      id: 1,
    });
    expect(actionSchema.safeParse(valid).success).toBe(false);
  });
});
