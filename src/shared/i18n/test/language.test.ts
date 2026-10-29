import { languageSchema, resolveDeviceLanguage } from "../language";

describe("languageSchema", () => {
  it("accepts en and ja", () => {
    expect(languageSchema.parse("en")).toBe("en");
    expect(languageSchema.parse("ja")).toBe("ja");
  });

  it("rejects other values", () => {
    expect(languageSchema.safeParse("fr").success).toBe(false);
    expect(languageSchema.safeParse("").success).toBe(false);
    expect(languageSchema.safeParse(null).success).toBe(false);
  });
});

describe("resolveDeviceLanguage", () => {
  it("uses the first supported language in device order", () => {
    expect(
      resolveDeviceLanguage([{ languageCode: "ja" }, { languageCode: "en" }]),
    ).toBe("ja");
    expect(
      resolveDeviceLanguage([{ languageCode: "en" }, { languageCode: "ja" }]),
    ).toBe("en");
  });

  it("skips unsupported languages", () => {
    expect(
      resolveDeviceLanguage([
        { languageCode: "fr" },
        { languageCode: null },
        { languageCode: "ja" },
      ]),
    ).toBe("ja");
  });

  it("falls back to en when no supported language is found", () => {
    expect(
      resolveDeviceLanguage([{ languageCode: "fr" }, { languageCode: "de" }]),
    ).toBe("en");
    expect(resolveDeviceLanguage([])).toBe("en");
  });
});
