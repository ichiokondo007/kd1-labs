import { runCommand } from "./command.service.js";

const PROJECT_ROOT = process.cwd();
const BASE_COMPOSE_FILE = "docker-compose.yml";
const APP_COMPOSE_FILE = "docker-compose.app.yml";
const DOCKER_ENV_FILE = ".env.docker";
const LOCAL_ENV_FILE = ".env.local";

export interface ContainerInfo {
  name: string;
  service: string;
  state: string;
  status: string;
  ports: string;
}

export async function getContainerStatus(): Promise<ContainerInfo[]> {
  const { stdout } = await runCommand(
    "docker",
    ["compose", "-f", BASE_COMPOSE_FILE, "-f", APP_COMPOSE_FILE, "ps", "--format", "json"],
    PROJECT_ROOT,
  );

  if (!stdout) return [];

  const lines = stdout.split("\n").filter(Boolean);
  return lines.map((line) => {
    const c = JSON.parse(line);
    const publishers: { PublishedPort: number; TargetPort: number; Protocol: string }[] =
      c.Publishers ?? [];

    return {
      name: c.Name ?? "",
      service: c.Service ?? "",
      state: c.State ?? "",
      status: c.Status ?? "",
    };
  });
}

export async function infraUp(): Promise<void> {
  await runCommand(
    "docker",
    ["compose", "-f", BASE_COMPOSE_FILE, "--env-file", LOCAL_ENV_FILE, "up", "-d"],
    PROJECT_ROOT,
  );
}

export async function infraDown(): Promise<void> {
  await runCommand(
    "docker",
    ["compose", "-f", BASE_COMPOSE_FILE, "down"],
    PROJECT_ROOT,
  );
}

export async function appUp(): Promise<void> {
  await runCommand(
    "docker",
    [
      "compose",
      "-f",
      BASE_COMPOSE_FILE,
      "-f",
      APP_COMPOSE_FILE,
      "--env-file",
      DOCKER_ENV_FILE,
      "up",
      "--build",
      "-d",
    ],
    PROJECT_ROOT,
  );
}

export async function appDown(): Promise<void> {
  await runCommand(
    "docker",
    [
      "compose",
      "-f",
      BASE_COMPOSE_FILE,
      "-f",
      APP_COMPOSE_FILE,
      "down",
    ],
    PROJECT_ROOT,
  );
}

export async function cleanVolumes(): Promise<void> {
  await runCommand(
    "docker",
    ["compose", "-f", BASE_COMPOSE_FILE, "down", "-v"],
    PROJECT_ROOT,
  );
}

export async function cleanAll(): Promise<void> {
  await runCommand(
    "docker",
    ["compose", "-f", BASE_COMPOSE_FILE, "down", "-v", "--rmi", "all"],
    PROJECT_ROOT,
  );
}
