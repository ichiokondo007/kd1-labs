import { Group } from "fabric";

const KEYS = ["svgAssetKey", "svgAssetUrl"] as const;

/**
 * Fabric Group の toObject / loadFromJSON に SVG メタを含める。
 * モジュール読み込み時に 1 回だけ拡張する。
 */
let registered = false;

export function registerGroupSvgMetadata(): void {
  if (registered) return;
  registered = true;
  const base = Group.stateProperties ?? [];
  const next = [...base];
  for (const k of KEYS) {
    if (!next.includes(k)) next.push(k);
  }
  Group.stateProperties = next;
}
