import type { MutableRefObject } from "react";

/** 共有 depth ref が 0 より大きいとき、Fabric→Y のローカル反映をスキップする */
export function isApplyingRemote(
  remoteApplyDepthRef: MutableRefObject<number>,
): boolean {
  return remoteApplyDepthRef.current > 0;
}
