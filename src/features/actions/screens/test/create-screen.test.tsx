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

describe("CreateScreen inputs", () => {
  it("shows the name, the minutes and when to ring on one screen", async () => {
    await renderCreateScreen();

    expect(screen.getByPlaceholderText("例: 家を出る")).toBeOnTheScreen();
    expect(selectedPickerOptionLabel()).toBe("30 分");
    expect(screen.getByText("いつ鳴らしますか？")).toBeOnTheScreen();
    // Both kinds are offered right away; the kind is not chosen first.
    expect(
      screen.getByRole("radio", { name: /押してから 30 分後に鳴らす/ }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /目標時間の 30 分前に鳴らす/ }),
    ).not.toBeChecked();
  });

  it("offers every minute from 1 to 240 on the wheel", async () => {
    await renderCreateScreen();

    const labels = pickerOptionLabels();
    expect(labels).toHaveLength(240);
    expect(labels[0]).toBe("1 分");
    expect(labels.at(-1)).toBe("240 分");
  });

  it("puts the chosen minutes into both choices", async () => {
    await renderCreateScreen();

    await selectPickerOption("45 分");

    expect(selectedPickerOptionLabel()).toBe("45 分");
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
