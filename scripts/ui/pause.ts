import { color } from "./color.js";

export function waitForEnter(message = "Enter で戻る..."): Promise<void> {
  return new Promise((resolve) => {
    process.stdout.write(`${color.gray}  ${message}${color.reset}`);

    const onData = () => {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode?.(false);
      process.stdin.pause();
      resolve();
    };

    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.once("data", onData);
  });
}
