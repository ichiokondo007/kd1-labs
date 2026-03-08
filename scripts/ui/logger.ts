import { color } from "./color.js";

export const log = {
  info: (msg: string) => console.log(`${color.cyan}${msg}${color.reset}`),

  success: (msg: string) => console.log(`${color.green}${msg}${color.reset}`),

  warn: (msg: string) => console.log(`${color.orange}${msg}${color.reset}`),

  error: (msg: string) => console.log(`${color.red}${msg}${color.reset}`),
};
