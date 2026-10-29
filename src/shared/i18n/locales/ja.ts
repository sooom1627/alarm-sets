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
    minutesValue: "{{minutes}} 分",
    minutesUnit: "分",
    decrease: "減らす",
    increase: "増やす",
    whenToRing: "いつ鳴らしますか？",
    kinds: {
      after: {
        label: "押してから {{minutes}} 分後に鳴らす",
        example: "例: 昼寝して {{minutes}} 分後に起こす",
      },
      before: {
        label: "目標時間の {{minutes}} 分前に鳴らす",
        example: "例: 家を出る {{minutes}} 分前に知らせる",
      },
    },
    save: "保存",
  },
  settings: {
    title: "設定",
    language: "言語",
  },
};
