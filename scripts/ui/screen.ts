import { printBanner } from "./banner.js";

export function showScreen(title = "KD1 CLI  メインメニュー") {
  console.clear();
  printBanner();

  console.log("────────────────────────────────────────");
  console.log(`  ${title}`);
  console.log("────────────────────────────────────────");
  console.log("");
}
