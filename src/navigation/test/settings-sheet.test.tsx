import { renderRouter } from "expo-router/testing-library";

import {
  headerButtonLabelsInTab,
  isSheetShown,
  pressHeaderButtonInTab,
  pressTab,
  swipeSheetDown,
} from "./native-ui";

const renderApp = async () => {
  const app = renderRouter("./src/app", { initialUrl: "/" });
  await app;
  return { app };
};

describe("settings sheet", () => {
  it("has a settings button in the header of both tabs", async () => {
    await renderApp();

    expect(headerButtonLabelsInTab("ホーム")).toContain("設定");
    expect(headerButtonLabelsInTab("実行中")).toContain("設定");
  });

  it("opens from the home tab and closes when swiped down", async () => {
    const { app } = await renderApp();

    await pressHeaderButtonInTab("ホーム", "設定");

    expect(app.getPathname()).toBe("/settings");
    expect(isSheetShown("settings")).toBe(true);

    await swipeSheetDown("settings");

    expect(app.getPathname()).toBe("/");
    expect(isSheetShown("settings")).toBe(false);
  });

  it("opens from the running tab and returns there when closed", async () => {
    const { app } = await renderApp();
    await pressTab("実行中");

    await pressHeaderButtonInTab("実行中", "設定");

    expect(isSheetShown("settings")).toBe(true);

    await swipeSheetDown("settings");

    expect(app.getPathname()).toBe("/running");
  });
});
