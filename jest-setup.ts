import "react-native-gesture-handler/jestSetup";

import { initI18n } from "@/shared/i18n/i18n";

jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/src/mock"),
);
// The mock lacks useReducedMotion, which sonner-native reads. Patch the mock
// module itself: expo-router/testing-library mocks reanimated again with it.
jest.mock("react-native-reanimated", () => {
  const reanimatedMock = require("react-native-reanimated/mock");
  reanimatedMock.useReducedMotion = () => false;
  return reanimatedMock;
});
require("react-native-reanimated/mock").useReducedMotion = () => false;

jest.mock("uniwind", () => ({
  withUniwind: <T>(Component: T) => Component,
  useCSSVariable: () => "#f97316",
  useResolveClassNames: () => ({
    backgroundColor: "#ffffff",
    color: "#1e293b",
  }),
}));

// Acceptance criteria are written in Japanese, so tests render in ja: the
// device prefers ja (read by the root layout) and i18n starts in ja.
jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "ja-JP", languageCode: "ja" }],
  // Times read as 14:20, as on a device set to the 24-hour clock.
  getCalendars: () => [{ uses24hourClock: true }],
}));
initI18n("ja");

// SQLite is out of process. Tables run on Node's SQLite in memory
// (__mocks__/expo-sqlite.ts, applied automatically); the key-value store is
// backed by an in-memory map.
jest.mock("expo-sqlite/kv-store", () => {
  const store = new Map<string, string>();
  return {
    Storage: {
      getItemSync: (key: string) => store.get(key) ?? null,
      setItemSync: (key: string, value: string) => store.set(key, value),
    },
  };
});
