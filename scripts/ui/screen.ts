import { printBanner } from "./banner.js";

export function showScreen(title = "Main Menu") {
  console.clear();
  printBanner();

  console.log("────────────────────────────────────────────────────────────────");
  console.log(`【${title}】`);
  console.log("────────────────────────────────────────────────────────────────");
  console.log("");
}
