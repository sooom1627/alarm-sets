import { renderRouter } from "expo-router/testing-library";

import { pressTab } from "./native-ui";

// renderRouter returns a promise with the router helpers attached to it, so
// keep that object instead of the awaited render result.
const renderApp = async () => {
  const app = renderRouter("./src/app", { initialUrl: "/" });
  await app;
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
