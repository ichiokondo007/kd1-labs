import { select } from "@inquirer/prompts";

export async function dockerMenu(): Promise<void> {
  const choice = await select({
    message: "🐳 Docker操作",
    choices: [
      { name: "インフラ起動 (MySQL, MongoDB, MinIO)", value: "infra:up" },
      { name: "インフラ停止", value: "infra:down" },
      { name: "フルApp起動 (infra + server + client)", value: "app:up" },
      { name: "フルApp停止", value: "app:down" },
      { name: "ボリューム削除 (データ初期化)", value: "clean:volumes" },
      { name: "全イメージ・ボリューム削除", value: "clean:all" },
    ],
  });

  switch (choice) {
    case "infra:up":
      // TODO: docker compose up -d
      console.log("\n⚠️  未実装です\n");
      break;

    case "infra:down":
      // TODO: docker compose down
      console.log("\n⚠️  未実装です\n");
      break;

    case "app:up":
      // TODO: docker compose -f ... -f ... --env-file .env.docker up --build -d
      console.log("\n⚠️  未実装です\n");
      break;

    case "app:down":
      // TODO: docker compose -f ... -f ... down
      console.log("\n⚠️  未実装です\n");
      break;

    case "clean:volumes":
      // TODO: docker compose down -v
      console.log("\n⚠️  未実装です\n");
      break;

    case "clean:all":
      // TODO: docker compose down -v --rmi all
      console.log("\n⚠️  未実装です\n");
      break;
  }
}
