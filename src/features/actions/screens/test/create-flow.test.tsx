import { QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";

import { flipToggle, selectPickerOption } from "@/navigation/test/native-ui";
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

const flowSteps = () =>
  within(screen.getByLabelText("使うときの流れ"))
    .getAllByRole("text")
    .map((step) => step.props.children as string);

describe("CreateScreen usage flow", () => {
  it("shows the three steps after pressing, with this action as the name", async () => {
    await renderCreateScreen();

    expect(flowSteps()).toEqual([
      "一覧で「この行動」を押す",
      "確認なしで、その場でスタートする",
      "30 分後に鳴る",
    ]);
  });

  it("uses the name and the minutes as they are entered", async () => {
    const { user } = await renderCreateScreen();

    await user.type(screen.getByPlaceholderText("例: 家を出る"), " 昼寝 ");
    await selectPickerOption("20 分後", "分");

    expect(flowSteps()).toEqual([
      "一覧で「昼寝」を押す",
      "確認なしで、その場でスタートする",
      "20 分後に鳴る",
    ]);
  });

  it("switches to the target time steps and back", async () => {
    const { user } = await renderCreateScreen();

    await user.press(screen.getByRole("radio", { name: "目標時間の" }));
    expect(flowSteps()).toEqual([
      "一覧で「この行動」を押す",
      "目標時間を入れる（前回の時間が入っています）",
      "目標時間の 30 分前に鳴る",
    ]);

    await user.press(screen.getByRole("radio", { name: "押してから" }));
    expect(flowSteps()[2]).toBe("30 分後に鳴る");
  });

  it("adds the reminder to the last step when it is on", async () => {
    const { user } = await renderCreateScreen();
    await user.press(screen.getByRole("radio", { name: "目標時間の" }));

    await flipToggle();

    expect(flowSteps()[2]).toBe(
      "目標時間の 30 分前に鳴る。その 10 分前にリマインド",
    );
  });
});
