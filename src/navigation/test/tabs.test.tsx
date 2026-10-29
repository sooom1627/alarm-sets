import {
  act,
  fireEvent,
  renderRouter,
  screen,
} from "expo-router/testing-library";

// renderRouter returns a promise with the router helpers attached to it, so
// keep that object instead of the awaited render result.
const renderApp = async () => {
  const app = renderRouter("./src/app", { initialUrl: "/" });
  await app;
  return { app };
};

// The tab bar is native (NativeTabs): find a tab by its label and fire the
// selection event the native tab bar sends when it is tapped.
const pressTab = async (label: string) => {
  const [host] = screen.container.queryAll(
    (node) => node.type === "RNSTabsHostIOS",
  );
  const [tab] = screen.container.queryAll(
    (node) => node.type === "RNSTabsScreenIOS" && node.props.title === label,
  );
  await act(async () => {
    fireEvent(host, "tabSelected", {
      nativeEvent: { selectedScreenKey: tab.props.screenKey, provenance: 0 },
    });
  });
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
