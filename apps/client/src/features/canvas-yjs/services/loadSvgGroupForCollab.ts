import { loadSVGFromURL, util, type Group } from "fabric";

/**
 * SVG URL から Group を生成する（表示用の最大幅スケールは適用しない）。
 * Yjs から復元する際は、呼び出し側で left/top/scale 等を上書きする。
 */
export async function loadSvgGroupUnscaled(url: string): Promise<Group | null> {
  const { objects, options } = await loadSVGFromURL(url, undefined, {
    crossOrigin: "anonymous",
  });
  const validObjects = objects.filter(
    (o): o is NonNullable<typeof o> => o != null,
  );
  if (validObjects.length === 0) return null;
  const groupedObj = util.groupSVGElements(validObjects, options) as Group;
  groupedObj.setCoords();
  return groupedObj;
}
