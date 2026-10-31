import type { Translation } from "./en";

export const ja: Translation = {
  tabs: {
    home: "ホーム",
    running: "実行中",
  },
  create: {
    title: "作る",
    sheetTitle: "新しい行動",
    name: "名前",
    namePlaceholder: "例: 家を出る",
    minutes: "時間",
    hoursLabel: "時",
    minutesLabel: "分",
    hoursValue: "{{hours}} 時間",
    whenToRing: "いつ鳴らしますか？",
    kinds: {
      after: {
        label: "押してから {{minutes}} 分後に鳴らす",
        example: "例: 昼寝して {{minutes}} 分後に起こす",
        choice: "押してから",
        wheelMinutes: "{{minutes}} 分後",
      },
      before: {
        label: "目標時間の {{minutes}} 分前に鳴らす",
        example: "例: 家を出る {{minutes}} 分前に知らせる",
        choice: "目標時間の",
        wheelMinutes: "{{minutes}} 分前",
      },
    },
    remind: "リマインド",
    remindLead: "鳴る時間の",
    remindValue: "{{minutes}} 分前",
    remindDecrease: "リマインドを減らす",
    remindIncrease: "リマインドを増やす",
    flow: {
      title: "使うときの流れ",
      unnamed: "この行動",
      press: "一覧で「{{name}}」を押す",
      after: {
        start: "確認なしで、その場でスタートする",
        rings: "{{minutes}} 分後に鳴る",
      },
      before: {
        enterTarget: "目標時間を入れる（前回の時間が入っています）",
        rings: "目標時間の {{minutes}} 分前に鳴る",
        ringsWithReminder:
          "目標時間の {{minutes}} 分前に鳴る。その {{remindMinutes}} 分前にリマインド",
      },
    },
    save: "保存",
  },
  actionList: {
    kinds: {
      after: {
        tag: "押してから",
        unit: "分後",
        spoken: "{{name}}、押してから{{minutes}}分後に鳴る",
      },
      before: {
        tag: "目標時間の",
        unit: "分前",
        spoken: "{{name}}、目標時間の{{minutes}}分前に鳴る",
      },
    },
    empty: {
      title: "最初の行動を作りましょう",
      body: "「昼寝」「家を出る」のように、タイマーを鳴らしたい行動を作っておくと、次からはここで押すだけで鳴らせます。",
      create: "行動を作る",
    },
    loadError: {
      title: "行動を読み込めませんでした",
      retry: "もう一度",
    },
    started: {
      title: "{{name}} {{time}} に鳴ります",
      failed: "スタートできませんでした",
    },
  },
  settings: {
    title: "設定",
    language: "言語",
  },
};
