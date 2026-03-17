/**
 * E2E（Playwright）用: 画面単位の main 要素に付与する data-testid のマッピング。
 * URL pathname から page 用 testid を返す。
 */
const PATH_TO_PAGE_TEST_ID: Array<{ match: (path: string) => boolean; testId: string }> = [
  { match: (p) => p === '/example/canvas', testId: 'page-canvas-list' },
  { match: (p) => p.startsWith('/example/canvas/'), testId: 'page-canvas-editor' },
  { match: (p) => p === '/example/canvas-yjs', testId: 'page-canvas-yjs-list' },
  { match: (p) => /^\/example\/canvas-yjs\/[^/]+$/.test(p), testId: 'page-canvas-yjs-editor' },
]

/**
 * pathname に対応するページ用 data-testid を返す。
 * マッチしない場合は undefined（testid を付けない）。
 */
export function getPageTestId(pathname: string): string | undefined {
  const entry = PATH_TO_PAGE_TEST_ID.find(({ match }) => match(pathname))
  return entry?.testId
}
