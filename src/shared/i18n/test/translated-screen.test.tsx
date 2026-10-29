import { act, render, screen } from "@testing-library/react-native";
import i18n from "i18next";

import HomeTab from "@/app/index";

afterEach(async () => {
  await act(() => i18n.changeLanguage("ja"));
});

describe("translated screen text", () => {
  it("shows the text in the current language", async () => {
    await render(<HomeTab />);

    expect(screen.getByText("ホーム")).toBeOnTheScreen();
  });

  it("re-renders the text when the language changes", async () => {
    await render(<HomeTab />);

    await act(() => i18n.changeLanguage("en"));

    expect(screen.getByText("Home")).toBeOnTheScreen();
  });
});
