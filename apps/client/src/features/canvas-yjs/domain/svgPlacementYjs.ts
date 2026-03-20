/**
 * 登録 SVG 配置の Yjs 同期用プレーン型。
 *
 * A 案ベース: svgAssetKey + 変形でリアルタイム同期。
 * fabricSnapshot に Group.toObject() の完全 JSON を保持し、
 * Mongo 永続化時に Fabric が loadFromJSON で復元できるようにする。
 */
export interface SvgPlacementYjsProps {
  svgAssetKey: string;
  svgAssetUrl: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  skewX: number;
  skewY: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  visible: boolean;
  /** Group.toObject() の完全 JSON（Mongo 永続化・通常エディタ復元用） */
  fabricSnapshot: Record<string, unknown> | null;
}

export const SVG_PLACEMENT_TRANSFORM_KEYS: (keyof Omit<
  SvgPlacementYjsProps,
  "svgAssetKey" | "svgAssetUrl" | "fabricSnapshot"
>)[] = [
  "left",
  "top",
  "scaleX",
  "scaleY",
  "angle",
  "skewX",
  "skewY",
  "opacity",
  "flipX",
  "flipY",
  "visible",
];
