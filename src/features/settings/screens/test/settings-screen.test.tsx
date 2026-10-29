import { act, render, screen } from "@testing-library/react-native";
import i18n from "i18next";

import {
  pickerOptionLabels,
  selectedPickerOptionLabel,
  selectPickerOption,
} from "@/navigation/test/native-ui";
import { getInitialLanguage, saveLanguage } from "@/shared/i18n/language";

import { SettingsScreen } from "../settings-screen";

afterEach(async () => {
  saveLanguage("ja");
  await act(() => i18n.changeLanguage("ja"));
});

describe("SettingsScreen language", () => {
  it("shows English and 日本語 with the current language selected", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText("言語")).toBeOnTheScreen();
    expect(pickerOptionLabels()).toEqual(["English", "日本語"]);
    expect(selectedPickerOptionLabel()).toBe("日本語");
  });

  it("switches the app text to English right away", async () => {
    await render(<SettingsScreen />);

    await selectPickerOption("English");

    expect(screen.getByText("Language")).toBeOnTheScreen();
    expect(selectedPickerOptionLabel()).toBe("English");
  });

  it("keeps English when the app is opened again", async () => {
    await render(<SettingsScreen />);

    await selectPickerOption("English");

    expect(getInitialLanguage()).toBe("en");
  });
});
