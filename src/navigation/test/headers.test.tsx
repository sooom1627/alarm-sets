import { renderRouter, screen } from "expo-router/testing-library";

// Native headers render as RNSScreenStackHeaderConfig.
const isShownHeader = (node: { type: unknown; props: Record<string, any> }) =>
  node.type === "RNSScreenStackHeaderConfig" && !node.props.hidden;

const headerTitleInTab = (tabLabel: string) => {
  const [tab] = screen.container.queryAll(
    (node) => node.type === "RNSTabsScreenIOS" && node.props.title === tabLabel,
  );
  return tab.queryAll(isShownHeader).map((header) => header.props.title);
};

describe("tab headers", () => {
  it("shows the tab name as the native header title of each tab", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    expect(headerTitleInTab("ホーム")).toEqual(["ホーム"]);
    expect(headerTitleInTab("実行中")).toEqual(["実行中"]);
  });

  it("does not show a header above the tabs", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    const titles = screen.container
      .queryAll(isShownHeader)
      .map((header) => header.props.title);
    expect(titles).not.toContain("(tabs)");
  });
});
