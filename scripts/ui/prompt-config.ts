/** select メニューの初期表示行数（これを超えるとスクロール）。全メニュー共通。 */
export const SELECT_PAGE_SIZE = 10;

/** select メニュー共通テーマ。選択行を反転表示で目立たせる。 */
export const SELECT_THEME = {
  icon: { cursor: "▸" },
  style: {
    highlight: (text: string) => `\x1b[1;7m ${text} \x1b[0m`,
  },
} as const;
