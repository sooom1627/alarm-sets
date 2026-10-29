import { renderRouter } from "expo-router/testing-library";

import {
  headerButtonLabelsInTab,
  isSheetShown,
  pressHeaderButtonInTab,
  swipeSheetDown,
} from "./native-ui";

const renderApp = async () => {
  const app = renderRouter("./src/app", { initialUrl: "/" });
  await app;
  return { app };
};

describe("create sheet", () => {
  it("has a create button only in the home header", async () => {
    await renderApp();

    expect(headerButtonLabelsInTab("ホーム")).toContain("作る");
    expect(headerButtonLabelsInTab("実行中")).not.toContain("作る");
  });

  it("opens from the home tab and closes when swiped down", async () => {
    const { app } = await renderApp();

    await pressHeaderButtonInTab("ホーム", "作る");

    expect(app.getPathname()).toBe("/create");
    expect(isSheetShown("create")).toBe(true);

    await swipeSheetDown("create");

    expect(app.getPathname()).toBe("/");
    expect(isSheetShown("create")).toBe(false);
  });
});
