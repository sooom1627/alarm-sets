import { render, screen, userEvent } from "@testing-library/react-native";

import { CreateScreen } from "../create-screen";

jest.useFakeTimers();

const renderCreateScreen = async () => {
  const user = userEvent.setup();
  await render(<CreateScreen />);
  return { user };
};

const minutesValue = () =>
  screen.getByLabelText("時間").props["aria-valuetext"] as string;

describe("CreateScreen inputs", () => {
  it("shows the name, the minutes and when to ring on one screen", async () => {
    await renderCreateScreen();

    expect(screen.getByPlaceholderText("例: 家を出る")).toBeOnTheScreen();
    expect(minutesValue()).toBe("30 分");
    expect(screen.getByText("いつ鳴らしますか？")).toBeOnTheScreen();
    // Both kinds are offered right away; the kind is not chosen first.
    expect(
      screen.getByRole("radio", { name: /押してから 30 分後に鳴らす/ }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /目標時間の 30 分前に鳴らす/ }),
    ).not.toBeChecked();
  });

  it("puts the chosen minutes into both choices", async () => {
    const { user } = await renderCreateScreen();

    await user.press(screen.getByRole("button", { name: "45" }));

    expect(minutesValue()).toBe("45 分");
    expect(
      screen.getByRole("radio", { name: /押してから 45 分後に鳴らす/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("radio", { name: /目標時間の 45 分前に鳴らす/ }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("例: 家を出る 45 分前に知らせる"),
    ).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "45" })).toBeSelected();
  });

  it("steps by 5 from 10 up and by 1 below 10", async () => {
    const { user } = await renderCreateScreen();
    const increase = screen.getByRole("button", { name: "増やす" });
    const decrease = screen.getByRole("button", { name: "減らす" });

    await user.press(increase);
    expect(minutesValue()).toBe("35 分");

    await user.press(screen.getByRole("button", { name: "10" }));
    await user.press(decrease);
    expect(minutesValue()).toBe("9 分");

    await user.press(increase);
    expect(minutesValue()).toBe("10 分");
  });

  it("keeps the minutes between 1 and 240", async () => {
    const { user } = await renderCreateScreen();
    const decrease = screen.getByRole("button", { name: "減らす" });

    await user.press(screen.getByRole("button", { name: "5" }));
    for (let i = 0; i < 5; i++) await user.press(decrease);

    expect(minutesValue()).toBe("1 分");
    expect(decrease).toBeDisabled();
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
