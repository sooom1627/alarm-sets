import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";

import {
  nativeTexts,
  pickerOptionLabels,
  selectedPickerOptionLabel,
  selectPickerOption,
} from "@/navigation/test/native-ui";
import { createQueryClient } from "@/shared/query/query-client";

import { CreateScreen } from "../create-screen";

jest.useFakeTimers();

const renderCreateScreen = async () => {
  const user = userEvent.setup();
  await render(
    <QueryClientProvider client={createQueryClient()}>
      <CreateScreen />
    </QueryClientProvider>,
  );
  return { user };
};

// The hours and minutes wheels with the units beside them, read together as
// "0 時間 30 分後".
const wheelTime = () => {
  const [hoursUnit, minutesUnit] = nativeTexts();
  return `${selectedPickerOptionLabel("時")} ${hoursUnit} ${selectedPickerOptionLabel("分")} ${minutesUnit}`;
};

describe("CreateScreen inputs", () => {
  it("shows the name, when to ring and the time on one screen", async () => {
    await renderCreateScreen();

    expect(screen.getByPlaceholderText("例: 家を出る")).toBeOnTheScreen();
    expect(screen.getByText("いつ鳴らしますか？")).toBeOnTheScreen();
    // Both kinds are offered right away; "after pressing" is chosen first.
    expect(screen.getByRole("radio", { name: "押してから" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "目標時間の" })).not.toBeChecked();
    expect(wheelTime()).toBe("0 時間 30 分後");
    expect(screen.getByText("押してから 30 分後に鳴らす")).toBeOnTheScreen();
    expect(screen.getByText("例: 昼寝して 30 分後に起こす")).toBeOnTheScreen();
  });

  it("splits the time into an hours wheel and a minutes wheel", async () => {
    await renderCreateScreen();

    expect(pickerOptionLabels("時")).toEqual(["0", "1", "2", "3", "4"]);
    const minuteLabels = pickerOptionLabels("分");
    expect(minuteLabels).toHaveLength(60);
    expect(minuteLabels[0]).toBe("0");
    expect(minuteLabels.at(-1)).toBe("59");
    // The rows are numbers only; the units sit fixed beside the wheels.
    expect(nativeTexts()).toEqual(["時間", "分後"]);
  });

  it("adds the hours and the minutes", async () => {
    await renderCreateScreen();

    await selectPickerOption("1", "時");
    await selectPickerOption("15", "分");

    expect(wheelTime()).toBe("1 時間 15 分後");
    expect(screen.getByText("押してから 75 分後に鳴らす")).toBeOnTheScreen();
  });

  it("keeps the time between 1 and 240 minutes", async () => {
    await renderCreateScreen();

    await selectPickerOption("0", "分");
    expect(wheelTime()).toBe("0 時間 1 分後");

    await selectPickerOption("4", "時");
    expect(wheelTime()).toBe("4 時間 0 分後");
    await selectPickerOption("30", "分");
    expect(wheelTime()).toBe("4 時間 0 分後");
  });

  it("reads the time as minutes before once a target time is chosen", async () => {
    const { user } = await renderCreateScreen();

    await user.press(screen.getByRole("radio", { name: "目標時間の" }));

    expect(screen.getByRole("radio", { name: "目標時間の" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "押してから" })).not.toBeChecked();
    expect(wheelTime()).toBe("0 時間 30 分前");
    expect(screen.getByText("目標時間の 30 分前に鳴らす")).toBeOnTheScreen();
    expect(
      screen.getByText("例: 家を出る 30 分前に知らせる"),
    ).toBeOnTheScreen();
  });

  it("cannot be saved while the name is empty or blank", async () => {
    const { user } = await renderCreateScreen();
    const save = screen.getByRole("button", { name: "保存" });
    const name = screen.getByPlaceholderText("例: 家を出る");

    expect(save).toBeDisabled();

    await user.type(name, "   ");
    expect(save).toBeDisabled();

    await user.clear(name);
    await user.type(name, "家を出る");
    expect(save).toBeEnabled();
  });

  it("limits the name to 16 characters", async () => {
    await renderCreateScreen();

    expect(screen.getByPlaceholderText("例: 家を出る").props.maxLength).toBe(
      16,
    );
  });
});
