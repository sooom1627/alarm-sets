import "react-native-gesture-handler/jestSetup";

import { initI18n } from "@/shared/i18n/i18n";

jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/src/mock"),
);
jest.mock("react-native-reanimated", () => {
  return jest.requireActual("react-native-reanimated/mock");
});

jest.mock("uniwind", () => ({
  withUniwind: <T>(Component: T) => Component,
  useCSSVariable: () => "#f97316",
  useResolveClassNames: () => ({
    backgroundColor: "#ffffff",
    color: "#1e293b",
  }),
}));

// Acceptance criteria are written in Japanese, so tests render in ja.
initI18n("ja");
