import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import { getDb } from "@/shared/db/db";

import {
  isSheetShown,
  pressHeaderButtonInTab,
  selectPickerOption,
} from "./native-ui";

const renderApp = async () => {
  const app = renderRouter("./src/app", { initialUrl: "/" });
  await app;
  return { app };
};

const createAction = async (name: string) => {
  await pressHeaderButtonInTab("ホーム", "作る");
  await fireEvent.changeText(screen.getByPlaceholderText("例: 家を出る"), name);
  await fireEvent.press(screen.getByRole("button", { name: "保存" }));
};

afterEach(async () => {
  await getDb().execAsync("DELETE FROM actions");
});

describe("action list", () => {
  it("invites you to create the first action when there are none", async () => {
    const { app } = await renderApp();

    expect(
      await screen.findByText("最初の行動を作りましょう"),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole("button", { name: "行動を作る" }));

    expect(app.getPathname()).toBe("/create");
  });

  it("closes the sheet on save and lists the action", async () => {
    const { app } = await renderApp();
    await screen.findByText("最初の行動を作りましょう");

    await createAction("家を出る");

    expect(
      await screen.findByLabelText("家を出る、押してから30分後に鳴る"),
    ).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/");
    expect(isSheetShown("create")).toBe(false);
    expect(screen.queryByText("最初の行動を作りましょう")).toBeNull();
  });

  it("lists target time actions with their minutes before", async () => {
    await renderApp();
    await screen.findByText("最初の行動を作りましょう");
    await pressHeaderButtonInTab("ホーム", "作る");

    await fireEvent.changeText(
      screen.getByPlaceholderText("例: 家を出る"),
      "会議の準備",
    );
    await selectPickerOption("15 分後", "分");
    await fireEvent.press(screen.getByRole("radio", { name: "目標時間の" }));
    await fireEvent.press(screen.getByRole("button", { name: "保存" }));

    expect(
      await screen.findByLabelText("会議の準備、目標時間の15分前に鳴る"),
    ).toBeOnTheScreen();
  });

  it("keeps the actions when the app is opened again", async () => {
    await renderApp();
    await screen.findByText("最初の行動を作りましょう");
    await createAction("昼寝");
    await screen.findByLabelText("昼寝、押してから30分後に鳴る");

    await screen.unmount();
    await renderApp();

    expect(
      await screen.findByLabelText("昼寝、押してから30分後に鳴る"),
    ).toBeOnTheScreen();
  });
});
