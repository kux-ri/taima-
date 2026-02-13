# TAIMA HUD Timer (Electron)

常に最前面で表示できる、小型のフレームレスカウントダウンタイマーです。

## フォルダ構成

```text
.
├── index.html      # UIレイアウト
├── main.js         # Electronメインプロセス（ウィンドウ作成/always-on-top/IPC）
├── package.json
├── preload.js      # rendererへ必要最小限のAPIを公開
├── renderer.js     # タイマー挙動、ボタンイベント、UI更新
├── styles.css      # HUD見た目
└── README.md
```

## Windowsでの起動手順

```bash
npm i
npm start
```

## 実装済み機能

- MVP
  - 小さいウィンドウ（240x110）
  - 枠なしHUD風 (`frame: false`)
  - 常に最前面 (`alwaysOnTop` + `setAlwaysOnTop(true, 'screen-saver', 1)`)
  - カウントダウン（デフォルト20:00）
  - Start / Pause / Reset
  - 0秒で点滅通知
- A: ドラッグ移動（フレームレスでも移動可能）
- B: 位置 + 時間設定のローカル保存 / 復元
- C: クリック透過モード切替
  - `setIgnoreMouseEvents(true, { forward: true })`
  - 復帰ショートカット: `Ctrl/Cmd + Shift + X`
- D: 0秒時に見た目を明確に変更（赤系強調 + 拡大 + 点滅）

## オプション: 配布ビルド（electron-builder）

未導入ですが、必要なら以下で対応できます。

1. 依存追加

```bash
npm i -D electron-builder
```

2. `package.json` に例として以下を追加

```json
{
  "scripts": {
    "build:win": "electron-builder --win"
  },
  "build": {
    "appId": "com.example.taima-hud",
    "productName": "TAIMA HUD Timer",
    "win": {
      "target": "nsis"
    }
  }
}
```

3. ビルド実行

```bash
npm run build:win
```

