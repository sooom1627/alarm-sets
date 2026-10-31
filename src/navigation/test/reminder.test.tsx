import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import { listActions } from "@/features/actions/db/actions";
import { getDb } from "@/shared/db/db";

import { flipToggle, pressHeaderButtonInTab } from "./native-ui";

const openCreateSheet = async (name: string) => {
  await renderRouter("./src/app", { initialUrl: "/" });
  await screen.findByText("最初の行動を作りましょう");
  await pressHeaderButtonInTab("ホーム", "作る");
  await fireEvent.changeText(screen.getByPlaceholderText("例: 家を出る"), name);
};

const saveAndWaitForList = async (spoken: string) => {
  await fireEvent.press(screen.getByRole("button", { name: "保存" }));
  await screen.findByLabelText(spoken);
};

const chooseTargetTime = () =>
  fireEvent.press(screen.getByRole("radio", { name: "目標時間の" }));

afterEach(async () => {
  await getDb().execAsync("DELETE FROM actions");
});

describe("saving a reminder", () => {
  it("keeps a 10 minute reminder with a target time action", async () => {
    await openCreateSheet("家を出る");
    await chooseTargetTime();
    await flipToggle();

    await saveAndWaitForList("家を出る、目標時間の30分前に鳴る");

    expect(await listActions()).toEqual([
      expect.objectContaining({ name: "家を出る", remindMinutes: 10 }),
    ]);
  });

  it("saves a target time action without a reminder", async () => {
    await openCreateSheet("会議");
    await chooseTargetTime();

    await saveAndWaitForList("会議、目標時間の30分前に鳴る");

    expect(await listActions()).toEqual([
      expect.objectContaining({ name: "会議", remindMinutes: null }),
    ]);
  });

  it("drops the reminder when switched back to after pressing", async () => {
    await openCreateSheet("昼寝");
    await chooseTargetTime();
    await flipToggle();
    await fireEvent.press(screen.getByRole("radio", { name: "押してから" }));

    await saveAndWaitForList("昼寝、押してから30分後に鳴る");

    expect(await listActions()).toEqual([
      expect.objectContaining({ name: "昼寝", remindMinutes: null }),
    ]);
  });
});
