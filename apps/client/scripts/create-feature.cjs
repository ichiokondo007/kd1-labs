#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const featureName = process.argv[2];

if (!featureName) {
  console.error("❌ Usage: pnpm feature:new <feature-name>");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const FEATURES_DIR = path.join(ROOT, "src", "features");
const TEMPLATE_DIR = path.join(FEATURES_DIR, "_template");
const TARGET_DIR = path.join(FEATURES_DIR, featureName);

if (!fs.existsSync(TEMPLATE_DIR)) {
  console.error("❌ _template directory not found.");
  process.exit(1);
}

if (fs.existsSync(TARGET_DIR)) {
  console.error(`❌ Feature "${featureName}" already exists.`);
  process.exit(1);
}

const pascal = featureName.charAt(0).toUpperCase() + featureName.slice(1);

function transformFileName(name) {
  // ファイル名の Template を Feature に変換（例: TemplatePage.tsx -> LoginPage.tsx）
  return name.replace(/Template/g, pascal).replace(/template/g, featureName);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    const transformedName = transformFileName(entry.name);
    const destPath = path.join(dest, transformedName);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");

      // 内容置換
      content = content
        .replace(/Template/g, pascal)
        .replace(/template/g, featureName);

      fs.writeFileSync(destPath, content);
    }
  }
}

copyDir(TEMPLATE_DIR, TARGET_DIR);

console.log(`✅ Feature "${featureName}" created successfully.`);
console.log(`📁 ${TARGET_DIR}`);

// 便利: 次にやることを表示
console.log("");
console.log("Next:");
console.log(`- Add route/page entry to render ${pascal}Page (keep pages thin)`);
console.log(`- Check Storybook: title "pages/${pascal}Page"`);