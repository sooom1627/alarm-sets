# alarm-sets

アラーム、もう並べない。

1つのアクションに必要なアラームを「セット」として保存し、タップ1つで呼び出す iOS アプリです。

## Documentation

- [docs/product.md](docs/product.md) — プロダクト定義（概要・原則・基盤・Epic）
- [docs/design.md](docs/design.md) — IA・画面定義
- [GitHub Issues](https://github.com/sooom1627/alarm-sets/issues) — Story / Task（Epic 一覧は [docs/product.md](docs/product.md) §3）

## Requirements

- [pnpm](https://pnpm.io/) `10.11.0`（`packageManager` フィールド参照）
- Node.js 22（CI は `22.13.0`）
- iOS 26 以降のシミュレータまたは実機

## Get started

```bash
pnpm install
pnpm start
```

ルートは [`src/app`](src/app)（Expo Router）です。

## Quality

```bash
pnpm run check
```

format → lint → typecheck → test をまとめて実行します。pre-commit（husky）でも同じゲートが走ります。
