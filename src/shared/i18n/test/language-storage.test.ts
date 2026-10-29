import { getLocales } from "expo-localization";

import { getInitialLanguage, saveLanguage } from "../language";

// SQLite is out of process: replace the key-value store with an in-memory map.
const mockStore = new Map<string, string>();
jest.mock("expo-sqlite/kv-store", () => ({
  Storage: {
    getItemSync: (key: string) => mockStore.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStore.set(key, value),
  },
}));

jest.mock("expo-localization", () => ({ getLocales: jest.fn() }));

const setDeviceLanguages = (...languageCodes: (string | null)[]) => {
  jest
    .mocked(getLocales)
    .mockReturnValue(
      languageCodes.map((languageCode) => ({ languageCode })) as ReturnType<
        typeof getLocales
      >,
    );
};

beforeEach(() => {
  mockStore.clear();
  setDeviceLanguages("ja");
});

describe("getInitialLanguage", () => {
  it("uses the device language when nothing is saved", () => {
    expect(getInitialLanguage()).toBe("ja");
  });

  it("prefers the saved language over the device language", () => {
    saveLanguage("en");

    expect(getInitialLanguage()).toBe("en");
  });

  it("ignores an invalid saved value", () => {
    mockStore.set("language", "fr");

    expect(getInitialLanguage()).toBe("ja");
  });

  it("falls back to en when neither is usable", () => {
    setDeviceLanguages("fr");

    expect(getInitialLanguage()).toBe("en");
  });
});
