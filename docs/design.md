# Design

画面と情報設計（IA）の正。プロダクト原則は [product.md](./product.md)、Story / Task は [GitHub Issues](https://github.com/sooom1627/alarm-sets/issues)。この文書は現在の仕様（目標を含む）だけを書き、Story ごとの判断やスコープ外は Issue に書く。

Figma は使わない。色・余白・トークンはコード（Uniwind）側。この文書は配置・遷移・出す情報だけを決める。

## 書き方

画面ごとに `docs/screens/<kebab>.md` を置く。画面を足す・変える Story は、この文書を先に `master` へ入れる（[agile-workflow](../.cursor/rules/agile-workflow.mdc)）。

画面 Markdown の型:

- 目的 / 対応 Story
- 入りと出（ルート案）
- レイアウト（ASCII）
- 出すデータ
- 空 / 読込 / エラー
- 未決事項

既存画面は「現状 → 目標」を書く。着手前の画面は骨格（配置・遷移・空状態）まででよい。

## IA

2 領域はボトムタブ（行動の一覧 / 動いているもの）。タブの名前は「ホーム」「実行中」（英語: Home / Running）。タブバーはネイティブ（`NativeTabs`）を使い、自前のバーは作らない。

- タブルートはネイティブのヘッダーにタイトルを出す。文言はタブの名前と同じ
- ヘッダーの右に設定のボタンを置く。両方のタブに置く
- 作るボタンは行動の一覧のヘッダーの右に置く（`NativeTabs` には浮いたボタンを足せないため）
- 作る、目標時刻を聞く、設定 はシートで出す

## 画面一覧

| 画面                                   | 出し方 |
| -------------------------------------- | ------ |
| [行動の一覧](./screens/action-list.md) | タブ   |
| [動いているもの](./screens/running.md) | タブ   |
| [作る](./screens/create.md)            | シート |
| 目標時刻を聞く                         | シート |
| [設定](./screens/settings.md)          | シート |
