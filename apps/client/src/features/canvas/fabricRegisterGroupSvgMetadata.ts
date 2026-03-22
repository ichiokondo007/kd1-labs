import { FabricObject, Group } from "fabric";

const GROUP_KEYS = ["svgAssetKey", "svgAssetUrl"] as const;

/**
 * Fabric の toObject / loadFromJSON にカスタムプロパティを含める。
 * - FabricObject（全オブジェクト共通）: yjsId
 * - Group: svgAssetKey, svgAssetUrl
 * モジュール読み込み時に 1 回だけ拡張する。
 */
let registered = false;

export function registerGroupSvgMetadata(): void {
  if (registered) return;
  registered = true;

  const baseObj = FabricObject.ownDefaults as Record<string, unknown>;
  if (!("yjsId" in baseObj)) {
    baseObj.yjsId = undefined;
  }
  const objState = FabricObject.stateProperties ?? [];
  if (!objState.includes("yjsId")) {
    FabricObject.stateProperties = [...objState, "yjsId"];
  }

  const baseGroup = Group.stateProperties ?? [];
  const next = [...baseGroup];
  for (const k of GROUP_KEYS) {
    if (!next.includes(k)) next.push(k);
  }
  Group.stateProperties = next;
}
