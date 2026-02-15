# Feature Login

この feature は「関心の分離」を守るための最小テンプレです。

## レイヤー責務

- ui/ : Presentational（描画のみ、I/O禁止、業務判断は最小）
- hooks/ : state + 副作用 + 画面イベント（I/Oは services に委譲）
- services/ : API/Storage 等のI/O（fetch/axios等はここ）
- domain/ : 純関数（判定/変換/整形/計算）。React依存禁止。
- types.ts : feature 内で閉じる型（外部公開が必要なら packages/types へ）

## 禁止

- ui/ から services/ を直接呼ばない
- domain/ で React import しない