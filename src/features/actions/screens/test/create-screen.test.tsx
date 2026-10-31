import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";

import {
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

// The hours and minutes wheels, read together as "0 時間 30 分".
const wheelTime = () =>
  `${selectedPickerOptionLabel("時")} ${selectedPickerOptionLabel("分")}`;

describe("CreateScreen inputs", () => {
  it("shows the name, the minutes and when to ring on one screen", async () => {
    await renderCreateScreen();

    expect(screen.getByPlaceholderText("例: 家を出る")).toBeOnTheScreen();
    expect(wheelTime()).toBe("0 時間 30 分");
    expect(screen.getByText("いつ鳴らしますか？")).toBeOnTheScreen();
    // Both kinds are offered right away; the kind is not chosen first.
    expect(
      screen.getByRole("radio", { name: /押してから 30 分後に鳴らす/ }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /目標時間の 30 分前に鳴らす/ }),
    ).not.toBeChecked();
  });

  it("splits the time into an hours wheel and a minutes wheel", async () => {
    await renderCreateScreen();

    expect(pickerOptionLabels("時")).toEqual([
      "0 時間",
      "1 時間",
      "2 時間",
      "3 時間",
      "4 時間",
    ]);
    const minuteLabels = pickerOptionLabels("分");
    expect(minuteLabels).toHaveLength(60);
    expect(minuteLabels[0]).toBe("0 分");
    expect(minuteLabels.at(-1)).toBe("59 分");
  });

  it("adds the hours and the minutes", async () => {
    await renderCreateScreen();

    await selectPickerOption("1 時間", "時");
    await selectPickerOption("15 分", "分");

    expect(wheelTime()).toBe("1 時間 15 分");
    expect(
      screen.getByRole("radio", { name: /押してから 75 分後に鳴らす/ }),
    ).toBeOnTheScreen();
  });

  it("keeps the time between 1 and 240 minutes", async () => {
    await renderCreateScreen();

    await selectPickerOption("0 分", "分");
    expect(wheelTime()).toBe("0 時間 1 分");

    await selectPickerOption("4 時間", "時");
    expect(wheelTime()).toBe("4 時間 0 分");
    await selectPickerOption("30 分", "分");
    expect(wheelTime()).toBe("4 時間 0 分");
  });

  it("puts the chosen minutes into both choices", async () => {
    await renderCreateScreen();

    await selectPickerOption("45 分", "分");

    expect(wheelTime()).toBe("0 時間 45 分");
    expect(
      screen.getByRole("radio", { name: /押してから 45 分後に鳴らす/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("radio", { name: /目標時間の 45 分前に鳴らす/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("例: 家を出る 45 分前に知らせる"),
    ).toBeOnTheScreen();
  });

  it("turns the wheel to a chip's minutes", async () => {
    const { user } = await renderCreateScreen();

    await user.press(screen.getByRole("button", { name: "15" }));

    expect(wheelTime()).toBe("0 時間 15 分");
    expect(screen.getByRole("button", { name: "15" })).toBeSelected();
    expect(screen.getByRole("button", { name: "30" })).not.toBeSelected();
  });

  it("selects the chip that matches the wheel", async () => {
    await renderCreateScreen();

    await selectPickerOption("45 分", "分");

    expect(screen.getByRole("button", { name: "45" })).toBeSelected();
  });

  it("chooses the target time kind", async () => {
    const { user } = await renderCreateScreen();

    await user.press(
      screen.getByRole("radio", { name: /目標時間の 30 分前に鳴らす/ }),
    );

    expect(
      screen.getByRole("radio", { name: /目標時間の 30 分前に鳴らす/ }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /押してから 30 分後に鳴らす/ }),
    ).not.toBeChecked();
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
