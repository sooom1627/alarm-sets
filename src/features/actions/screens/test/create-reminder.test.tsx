import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent } from "@testing-library/react-native";

import {
  flipToggle,
  isToggleOn,
  isToggleShown,
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

const chooseTargetTime = (user: ReturnType<typeof userEvent.setup>) =>
  user.press(screen.getByRole("radio", { name: "目標時間の" }));

const remindValue = () =>
  screen.getByLabelText("リマインド").props["aria-valuetext"] as string;

describe("CreateScreen reminder", () => {
  it("has no reminder when it rings after pressing", async () => {
    await renderCreateScreen();

    expect(isToggleShown()).toBe(false);
    expect(screen.queryByText("リマインド")).toBeNull();
  });

  it("offers a reminder, off at first, for a target time", async () => {
    const { user } = await renderCreateScreen();

    await chooseTargetTime(user);

    expect(isToggleShown()).toBe(true);
    expect(isToggleOn()).toBe(false);
    expect(screen.queryByText("鳴る時間の")).toBeNull();
  });

  it("shows 10 minutes before once switched on", async () => {
    const { user } = await renderCreateScreen();
    await chooseTargetTime(user);

    await flipToggle();

    expect(isToggleOn()).toBe(true);
    expect(screen.getByText("鳴る時間の")).toBeOnTheScreen();
    expect(remindValue()).toBe("10 分前");
  });

  it("steps the reminder by 5 between 5 and 60", async () => {
    const { user } = await renderCreateScreen();
    await chooseTargetTime(user);
    await flipToggle();
    const decrease = screen.getByRole("button", { name: "リマインドを減らす" });
    const increase = screen.getByRole("button", { name: "リマインドを増やす" });

    await user.press(decrease);
    expect(remindValue()).toBe("5 分前");
    expect(decrease).toBeDisabled();

    for (let i = 0; i < 11; i++) await user.press(increase);
    expect(remindValue()).toBe("60 分前");
    expect(increase).toBeDisabled();
  });

  it("hides the reminder again when switched back to after pressing", async () => {
    const { user } = await renderCreateScreen();
    await chooseTargetTime(user);
    await flipToggle();

    await user.press(screen.getByRole("radio", { name: "押してから" }));

    expect(isToggleShown()).toBe(false);
    expect(screen.queryByText("鳴る時間の")).toBeNull();
  });
});
