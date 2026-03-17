import Table from "cli-table3";
import type { ContainerInfo } from "../services/docker.service.js";
import { color } from "./color.js";

export function printTable(headers: string[], rows: string[][]) {
  const table = new Table({ head: headers });
  for (const r of rows) table.push(r);
  console.log(table.toString());
}

function colorizeState(state: string): string {
  switch (state) {
    case "running":
      return `${color.green}${state}${color.reset}`;
    case "down":
    case "exited":
    case "dead":
      return `${color.red}${state}${color.reset}`;
    default:
      return `${color.orange}${state}${color.reset}`;
  }
}

export function printContainerStatus(containers: ContainerInfo[]) {
  if (containers.length === 0) {
    console.log(`${color.gray}  稼働中のコンテナはありません${color.reset}`);
    return;
  }

  const table = new Table({
    head: ["サービス", "コンテナ名", "状態", "ステータス"],
    style: { head: ["cyan"] },
  });

  for (const c of containers) {
    table.push([c.service, c.name, colorizeState(c.state), c.status]);
  }

  console.log(table.toString());
}
