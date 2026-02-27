#!/usr/bin/env node
/**
 * パスワードを bcrypt でハッシュして表示する（DB の password_hash 更新用）。
 * 使用例: node scripts/hash-password.mjs mypassword
 */
import bcrypt from "bcrypt";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log(hash);
