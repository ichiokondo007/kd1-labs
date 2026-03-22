#!/usr/bin/env tsx

import { createCli } from "@kd1-labs/devtool-cli";

import { devMenu } from "./menus/dev.js";
import { dockerMenu } from "./menus/docker.js";
import { buildMenu } from "./menus/build.js";
import { helpMenu } from "./menus/help.js";
import { techstackMenu } from "./menus/techstack.js";

createCli({
  title: "Main Menu",
  menus: [
    {
      name: "🚀 Open Development Environment",
      value: "dev",
      handler: devMenu,
    },
    {
      name: "🐳 Docker Operation",
      value: "docker",
      handler: dockerMenu,
    },
    {
      name: "🔨 Build / DB Migration (Build / DB Migration)",
      value: "build",
      handler: buildMenu,
    },
    {
      name: "📦 Tech Stack",
      value: "techstack",
      handler: techstackMenu,
    },
    {
      name: "🧪 HELP / Cheat Sheet",
      value: "help",
      handler: helpMenu,
    },
  ],
});
