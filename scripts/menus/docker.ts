import { confirm, select } from "@inquirer/prompts";
import {
  appDown,
  appUp,
  cleanAll,
  cleanVolumes,
  getContainerStatus,
  infraDown,
  infraUp,
  appsBuildUp,
  appsBuildDown,
} from "../services/docker.service.js";
import {
  log,
  waitForEnter,
  showScreen,
  createSpinner,
  runForeground,
  SELECT_PAGE_SIZE,
  SELECT_THEME,
} from "@kd1-labs/devtool-cli";
import { printContainerStatus } from "../ui/table.js";

type DockerMenuValue =
  | "docker:ps"
  | "yjs:metrics"
  | "infra:up"
  | "infra:down"
  | "apps:up"
  | "apps:down"
  | "app:down"
  | "full:up"
  | "full:down"
  | "clean:volumes"
  | "clean:all"
  | "back"
  | "exit";

const DOCKER_CHOICES = [

  {
    name: " 📊 KD1 Docker ps",
    description: "",
    value: "docker:ps" as const,
},
  {
    name: " 📈 yjs-server Metrics (top)",
    description: "kd1-yjs-server コンテナの top を表示",
    value: "yjs:metrics" as const,
  },
  {
    name: " 🐳🚀 Infra Up (.env.local/mysql mongodb minio)",
    description: ".env.local の設定でMySQL / MongoDB / MinIOのみUp",
    value: "infra:up" as const,
  },
  {
    name: " 🐳⏹️ Infra Down",
    description: "infra を停止",
    value: "infra:down" as const,
  },
  {
    name: " 🐳🚀 Apps Up (.env.docker/client server yjs-server)",
    description: "client server yjs-server のみdocker Up",
    value: "apps:up" as const,
  },
  {
    name: " 🐳⏹️ Apps Down",
    description: "client server yjs-server を停止",
    value: "apps:down" as const,
  },
  {
    name: " 🐳🚀 Full Docker Up(infra + server / client / yjs-server)",
    description: "Full docker Up",
    value: "full:up" as const,
  },
  {
    name: " 🐳⏹️  Full Docker Down",
    description: "Full docker を停止",
    value: "full:down" as const,
  },
  {
    name: " ⚠️ Docker Volume remove",
    description: "データ初期化",
    value: "clean:volumes" as const,
  },
  {
    name: " ☢️ Docker Image & Volume remove",
    description: "破壊的操作(KD1関連をすべて削除してinstall前の状態に戻します)",
    value: "clean:all" as const,
  },
  { name: " ↩️ TOPへ戻る", value: "back" as const },
  { name: " ❌ EXIT", value: "exit" as const },
];

export async function dockerMenu(): Promise<void> {
  showScreen("🐳 Docker Operation");

  while (true) {
    console.log("");
    const choice = await select<DockerMenuValue>({
      message: "🐳 Select an action\n",
      choices: DOCKER_CHOICES,
      loop: false,
      pageSize: SELECT_PAGE_SIZE,
      theme: SELECT_THEME,
    });

    if (choice === "back") return;
    if (choice === "exit") {
      log.info("\nBye! 👋\n");
      process.exit(0);
    }

    switch (choice) {
      case "docker:ps":
        await showContainerStatus();
        console.log("");
        await waitForEnter();
        break;

      case "yjs:metrics":
        await runForeground({
          label: "yjs-server Metrics (top)",
          cmd: 'docker exec -it kd1-yjs-server sh -c "top"',
        });
        break;

      case "infra:up":
        await executeDockerAction(
          "Infraを起動しています...",
          infraUp,
          "Infraを起動しました",
        );
        break;

      case "infra:down":
        await executeDockerAction(
          "Infraを停止しています...",
          infraDown,
          "Infraを停止しました",
        );
        break;
      case "apps:up":
        await executeDockerAction(
          "appsを起動しています...",
          appsBuildUp,
          "appsを起動しました",
        );
        break;

      case "apps:down":
        await executeDockerAction(
          "appsを停止しています...",
          appsBuildDown,
          "appsを停止しました",
        );
        break;

      case "full:up":
        await executeDockerAction(
          "Full Docker で起動しています...",
          appUp,
          "Full Docker で起動しました",
        );
        break;

      case "full:down":
        await executeDockerAction(
          "Full Docker を停止しています...",
          appDown,
          "Full Docker を停止しました",
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
