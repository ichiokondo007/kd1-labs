/**
 * Rect の Yjs 同期用プレーン型（Fabric 非依存）
 */
export interface RectYjsProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  skewX: number;
  skewY: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  visible: boolean;
}

export const RECT_YJS_KEYS: (keyof RectYjsProps)[] = [
  "left",
  "top",
  "width",
  "height",
  "fill",
  "stroke",
  "strokeWidth",
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
