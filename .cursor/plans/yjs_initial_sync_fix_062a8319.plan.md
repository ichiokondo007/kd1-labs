---
name: Yjs initial sync fix
overview: B が途中参加した際に、Y.Map に既にある Circle データを Fabric Canvas に描画する初期同期処理を追加する。Yjs の SyncStep1/2 で Y.Doc は自動同期されるが、Y.Map の既存データを Fabric に反映するロジックが欠けている。
todos:
  - id: fix-initial-sync
    content: useYjsCircleSync に Y.Map → Fabric 初期描画処理を追加し、途中参加時に既存 Circle が表示されるようにする
    status: pending
isProject: false
---

# Y.Map 初期データの Fabric Canvas 反映

## 原因

`useYjsCircleSync` の `yCircles.observe()` は **以降の変更イベント** のみを検知する。Yjs の SyncStep1/2 で Y.Doc が同期された時点で Y.Map に既に存在するデータは observe イベントとして発火しないため、Fabric Canvas に描画されない。

## 修正方針

`useYjsCircleSync` の初期化時に、Y.Map に既にあるエントリを Fabric Canvas に Circle として追加する処理を入れる。

修正対象: [useYjsCircleSync.ts](apps/client/src/features/canvas-yjs/hooks/useYjsCircleSync.ts)

### 変更 1: `renderYjsCirclesToCanvas` 関数の追加

Y.Map の全エントリを走査し、Fabric Canvas 上に対応する Circle がなければ追加する関数。

```typescript
function renderYjsCirclesToCanvas(
  canvas: Canvas,
  yCircles: Y.Map<CircleProps>,
): void {
  yCircles.forEach((props, key) => {
    if (findFabricCircleById(canvas, key)) return;
    const circle = new Circle(props);
    setCircleId(circle, key);
    canvas.add(circle);
  });
  canvas.requestRenderAll();
}
```

### 変更 2: 初期化順序の修正

現在の `syncExistingCirclesToYjs` (Fabric → Y.Map) と新しい `renderYjsCirclesToCanvas` (Y.Map → Fabric) を正しい順序で実行する。

ポイント: **Y.Map にデータがあれば Y.Map が正（SSOT）** / Y.Map が空なら Fabric Canvas のデータを Y.Map に投入する（最初に接続したユーザ）。

```typescript
if (yCircles.size > 0) {
  renderYjsCirclesToCanvas(canvas, yCircles);
} else {
  syncExistingCirclesToYjs(canvas, yCircles);
}
```

これにより:

- A（最初のユーザ）: Y.Map 空 → Fabric から Y.Map へ投入
- B（途中参加）: Y.Map にデータあり → Y.Map から Fabric へ描画

### 変更 3: `syncExistingCirclesToYjs` の簡素化

現在の `yCircles.size > 0` ガードは上位で制御するため、関数内のガードは不要になる。

## ファイル変更


| ファイル                                        | 変更                                                |
| ----------------------------------------------- | --------------------------------------------------- |
| `features/canvas-yjs/hooks/useYjsCircleSync.ts` | `renderYjsCirclesToCanvas` 追加、初期化ロジック修正 |


