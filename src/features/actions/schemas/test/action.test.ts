import { actionSchema, newActionSchema } from "../action";

const valid = {
  name: "家を出る",
  minutes: 30,
  kind: "before",
  remindMinutes: null,
};

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

describe("newActionSchema reminder", () => {
  it("accepts a reminder of 5 to 60 minutes in steps of 5 before a target time", () => {
    for (const remindMinutes of [5, 10, 45, 60]) {
      expect(
        newActionSchema.safeParse({ ...valid, remindMinutes }).success,
      ).toBe(true);
    }
    for (const remindMinutes of [0, 4, 7, 65]) {
      expect(
        newActionSchema.safeParse({ ...valid, remindMinutes }).success,
      ).toBe(false);
    }
  });

  it("allows a reminder longer than the minutes before", () => {
    expect(
      newActionSchema.safeParse({ ...valid, minutes: 30, remindMinutes: 45 })
        .success,
    ).toBe(true);
  });

  it("has no reminder when it rings after pressing", () => {
    expect(
      newActionSchema.safeParse({
        ...valid,
        kind: "after",
        remindMinutes: null,
      }).success,
    ).toBe(true);
    expect(
      newActionSchema.safeParse({ ...valid, kind: "after", remindMinutes: 10 })
        .success,
    ).toBe(false);
  });
});

describe("actionSchema", () => {
  it("adds the stored id", () => {
    expect(actionSchema.parse({ ...valid, id: 1 })).toEqual({
      ...valid,
      id: 1,
    });
    expect(actionSchema.safeParse(valid).success).toBe(false);
    expect(
      actionSchema.safeParse({
        ...valid,
        id: 1,
        kind: "after",
        remindMinutes: 10,
      }).success,
    ).toBe(false);
  });
});
