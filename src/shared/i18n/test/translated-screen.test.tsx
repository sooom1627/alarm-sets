import { act, renderRouter, screen } from "expo-router/testing-library";

import i18n from "i18next";

const tabTitles = () =>
  screen.container
    .queryAll((node) => node.type === "RNSTabsScreenIOS")
    .map((tab) => tab.props.title);

afterEach(async () => {
  await act(() => i18n.changeLanguage("ja"));
});

describe("translated screen text", () => {
  it("shows the text in the current language", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    expect(tabTitles()).toEqual(["ホーム", "実行中"]);
  });

  it("re-renders the text when the language changes", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    await act(() => i18n.changeLanguage("en"));

    expect(tabTitles()).toEqual(["Home", "Running"]);
  });
});
