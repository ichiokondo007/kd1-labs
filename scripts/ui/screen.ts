import { printBanner } from "./banner.js";

export function showScreen() {
  console.clear();
  printBanner();

  console.log("────────────────────────────────────────");
  console.log("  KD1 CLI  メインメニュー");
  console.log("────────────────────────────────────────");
  console.log("");
}
