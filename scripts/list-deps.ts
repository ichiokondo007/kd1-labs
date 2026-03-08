#!/usr/bin/env tsx
/**
 * list-deps.ts
 * monorepo 全 package.json から依存を収集し、重複排除してターミナル表示する
 *
 * 使い方:
 *   pnpm tsx scripts/list-deps.ts
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

// ── 型定義 ──────────────────────────────────────────────────────────────────

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface DepEntry {
  version: string;
  sources: string[]; // どの workspace に含まれるか
  isDev: boolean;    // devDependencies のみなら true
}

// ── package.json 探索対象ディレクトリ ──────────────────────────────────────

const ROOT = process.cwd();

const SCAN_DIRS = ["apps", "packages"];

function findPackageJsonPaths(): string[] {
  const paths: string[] = [];

  // root 自身
  const rootPkg = join(ROOT, "package.json");
  if (existsSync(rootPkg)) paths.push(rootPkg);

  // apps/* / packages/*
  for (const dir of SCAN_DIRS) {
    const base = join(ROOT, dir);
    if (!existsSync(base)) continue;

    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(base, entry.name, "package.json");
      if (existsSync(pkgPath)) paths.push(pkgPath);
    }
  }

  return paths;
}

// ── 収集 ───────────────────────────────────────────────────────────────────

function collectDeps(): Map<string, DepEntry> {
  const map = new Map<string, DepEntry>();
  const paths = findPackageJsonPaths();

  for (const pkgPath of paths) {
    const raw = readFileSync(pkgPath, "utf-8");
    const pkg: PackageJson = JSON.parse(raw);
    const label = pkg.name ?? relative(ROOT, pkgPath);

    const add = (deps: Record<string, string>, isDev: boolean) => {
      for (const [name, version] of Object.entries(deps)) {
        // workspace: プロトコルは内部パッケージなのでスキップ
        if (version.startsWith("workspace:")) continue;

        const existing = map.get(name);
        if (existing) {
          if (!existing.sources.includes(label)) {
            existing.sources.push(label);
          }
          // dev/prod 両方に存在するなら prod 扱いに昇格
          if (!isDev) existing.isDev = false;
        } else {
          map.set(name, { version, sources: [label], isDev });
        }
      }
    };

    if (pkg.dependencies)    add(pkg.dependencies, false);
    if (pkg.devDependencies) add(pkg.devDependencies, true);
  }

  return map;
}

// ── 表示 ───────────────────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";
const CYAN   = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN  = "\x1b[32m";
const GRAY   = "\x1b[90m";

function printTable(
  title: string,
  entries: [string, DepEntry][],
  color: string
): void {
  if (entries.length === 0) return;

  // カラム幅を動的計算
  const nameW    = Math.max(20, ...entries.map(([n]) => n.length)) + 2;
  const versionW = Math.max(10, ...entries.map(([, e]) => e.version.length)) + 2;

  const hr = "─".repeat(nameW + versionW + 28);

  console.log(`\n${color}${BOLD}${title}${RESET} ${GRAY}(${entries.length} packages)${RESET}`);
  console.log(GRAY + hr + RESET);
  console.log(
    `${BOLD}${"Package".padEnd(nameW)}${"Version".padEnd(versionW)}Sources${RESET}`
  );
  console.log(GRAY + hr + RESET);

  for (const [name, { version, sources }] of entries) {
    const src = sources.join(", ");
    console.log(
      `${color}${name.padEnd(nameW)}${RESET}` +
      `${GREEN}${version.padEnd(versionW)}${RESET}` +
      `${GRAY}${src}${RESET}`
    );
  }

  console.log(GRAY + hr + RESET);
}

function main(): void {
  console.log(`\n${BOLD}${CYAN}📦 kd1-labs — 依存ライブラリ一覧${RESET}`);
  console.log(`${DIM}ROOT: ${ROOT}${RESET}`);

  const all = collectDeps();

  // prod / dev に分類してアルファベット順ソート
  const prod = [...all.entries()]
    .filter(([, e]) => !e.isDev)
    .sort(([a], [b]) => a.localeCompare(b));

  const dev = [...all.entries()]
    .filter(([, e]) => e.isDev)
    .sort(([a], [b]) => a.localeCompare(b));

  printTable("🟢 dependencies (本番)", prod, CYAN);
  printTable("🔧 devDependencies (開発)", dev, YELLOW);

  const total = prod.length + dev.length;
  console.log(`\n${BOLD}合計: ${total} packages${RESET} (prod: ${prod.length} / dev: ${dev.length})\n`);
}

main();