import { confirm, select } from "@inquirer/prompts";
import {
  appDown,
  appUp,
  cleanAll,
  cleanVolumes,
  getContainerStatus,
  infraDown,
  infraUp,
} from "../services/docker.service.js";
import { log } from "../ui/logger.js";
import { waitForEnter } from "../ui/pause.js";
import { showScreen } from "../ui/screen.js";
import { createSpinner } from "../ui/spinner.js";
import { printContainerStatus } from "../ui/table.js";

type DockerMenuValue =
  | "infra:up"
  | "infra:down"
  | "app:up"
  | "app:down"
  | "clean:volumes"
  | "clean:all"
  | "back"
  | "exit";

const DOCKER_CHOICES = [
  {
    name: "インフラ起動",
    description: "MySQL / MongoDB / MinIO",
    value: "infra:up" as const,
  },
  {
    name: "インフラ停止",
    description: "infra を停止",
    value: "infra:down" as const,
  },
  {
    name: "フルApp起動",
    description: "infra + server + client",
    value: "app:up" as const,
  },
  {
    name: "フルApp停止",
    description: "app を停止",
    value: "app:down" as const,
  },
  {
    name: "ボリューム削除",
    description: "データ初期化",
    value: "clean:volumes" as const,
  },
  {
    name: "全イメージ・ボリューム削除",
    description: "破壊的操作(KD1関連をすべて削除してinstall前の状態に戻します)",
    value: "clean:all" as const,
  },
  { name: "↩ TOPへ戻る", value: "back" as const },
  { name: "❌ EXIT", value: "exit" as const },
];

export async function dockerMenu(): Promise<void> {
  showScreen("🐳 Docker操作");

  while (true) {
    console.log("");
    const choice = await select<DockerMenuValue>({
      message: "🐳 Docker操作を選択してください",
      choices: DOCKER_CHOICES,
      loop: false,
    });

    if (choice === "back") return;
    if (choice === "exit") {
      log.info("\nBye! 👋\n");
      process.exit(0);
    }

    switch (choice) {
      case "infra:up":
        await executeDockerAction(
          "インフラを起動しています...",
          infraUp,
          "インフラを起動しました",
        );
        break;

      case "infra:down":
        await executeDockerAction(
          "インフラを停止しています...",
          infraDown,
          "インフラを停止しました",
        );
        break;

      case "app:up":
        await executeDockerAction(
          "フルAppを起動しています...",
          appUp,
          "フルAppを起動しました",
        );
        break;

      case "app:down":
        await executeDockerAction(
          "フルAppを停止しています...",
          appDown,
          "フルAppを停止しました",
        );
        break;

      case "clean:volumes": {
        const ok = await confirm({
          message: "ボリュームを削除してデータを初期化します。続行しますか？",
          default: false,
        });

        if (!ok) {
          log.warn("\nキャンセルしました。\n");
          break;
        }

        await executeDockerAction(
          "ボリュームを削除しています...",
          cleanVolumes,
          "ボリュームを削除しました",
        );
        break;
      }

      case "clean:all": {
        const ok = await confirm({
          message: "全イメージ・ボリュームを削除します。破壊的操作です。続行しますか？",
          default: false,
        });

        if (!ok) {
          log.warn("\nキャンセルしました。\n");
          break;
        }

        await executeDockerAction(
          "全イメージ・ボリュームを削除しています...",
          cleanAll,
          "全イメージ・ボリュームを削除しました",
        );
        break;
      }
    }

    showScreen("🐳 Docker操作");
  }
}

async function showContainerStatus(): Promise<void> {
  try {
    const containers = await getContainerStatus();
    console.log("");
    printContainerStatus(containers);
  } catch {
    // docker compose ps が失敗しても致命的ではない
  }
}

async function executeDockerAction(
  loadingMessage: string,
  action: () => Promise<void>,
  successMessage: string,
): Promise<void> {
  const spinner = createSpinner(loadingMessage);

  try {
    await action();
    spinner.succeed(successMessage);
  } catch (error) {
    spinner.fail("Docker操作に失敗しました");

    if (error instanceof Error) {
      log.error(`\n${error.message}`);
    } else {
      log.error("\n不明なエラーが発生しました");
    }
  }

  await showContainerStatus();
  console.log("");
  await waitForEnter();
}
