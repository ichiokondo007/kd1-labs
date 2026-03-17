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

const COMPOSE_ARGS = ["compose", "-f", BASE_COMPOSE_FILE, "-f", APP_COMPOSE_FILE];

async function getComposeServiceNames(): Promise<string[]> {
  const { stdout } = await runCommand(
    "docker",
    [...COMPOSE_ARGS, "config", "--services"],
    PROJECT_ROOT,
  );
  if (!stdout.trim()) return [];
  return stdout.trim().split("\n").filter(Boolean);
}

export async function getContainerStatus(): Promise<ContainerInfo[]> {
  const serviceNames = await getComposeServiceNames();
  if (serviceNames.length === 0) return [];

  const { stdout: psStdout } = await runCommand(
    "docker",
    [...COMPOSE_ARGS, "ps", "-a", "--format", "json"],
    PROJECT_ROOT,
  );

  const containerByService = new Map<string, ContainerInfo>();
  if (psStdout) {
    const lines = psStdout.split("\n").filter(Boolean);
    for (const line of lines) {
      const c = JSON.parse(line) as {
        Name?: string;
        Service?: string;
        State?: string;
        Status?: string;
        Publishers?: { PublishedPort: number; TargetPort: number; Protocol: string }[];
      };
      const publishers = c.Publishers ?? [];
      const ports = publishers
        .map((p) => `${p.PublishedPort}/${p.Protocol}`)
        .filter(Boolean)
        .join(", ");
      const state = c.State === "running" ? "running" : "down";
      containerByService.set(c.Service ?? "", {
        name: c.Name ?? "",
        service: c.Service ?? "",
        state,
        status: c.Status ?? "",
        ports,
      });
    }
  }

  return serviceNames.map((serviceName) => {
    const existing = containerByService.get(serviceName);
    if (existing) return existing;
    return {
      service: serviceName,
      name: "-",
      state: "down",
      status: "-",
      ports: "",
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
