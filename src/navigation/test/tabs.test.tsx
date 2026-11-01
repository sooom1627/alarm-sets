import { renderRouter } from "expo-router/testing-library";

import { pressTab } from "./native-ui";

const renderApp = async () => {
  const app = await renderRouter("./src/app", { initialUrl: "/" });
  return { app };
};

describe("tabs", () => {
  it("opens on the home tab", async () => {
    const { app } = await renderApp();

    expect(app.getSegments()).toEqual(["(tabs)", "(home)"]);
  });

  it("switches to the running tab", async () => {
    const { app } = await renderApp();

    await pressTab("実行中");

    expect(app.getPathname()).toBe("/running");
  });
});
