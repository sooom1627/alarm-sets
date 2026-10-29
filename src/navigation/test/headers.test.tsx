import { renderRouter } from "expo-router/testing-library";

import { headerTitlesInTab, shownHeaderTitles } from "./native-ui";

describe("tab headers", () => {
  it("shows the tab name as the native header title of each tab", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    expect(headerTitlesInTab("ホーム")).toEqual(["ホーム"]);
    expect(headerTitlesInTab("実行中")).toEqual(["実行中"]);
  });

  it("does not show a header above the tabs", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    expect(shownHeaderTitles()).not.toContain("(tabs)");
  });
});
