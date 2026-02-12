# React + Express 認証サンプル設計（Fit & Gap 評価用）

## 1. 目的・位置づけ

本設計は **ライブラリ評価（Fit & Gap）用のサンプルアプリケーション** を想定し、
本番相当のセキュリティを過剰に盛り込まず、**構造が理解しやすく説明可能な最小構成** を目的とする。

- フロントエンド：React（SPA）
- バックエンド：Express（API）
- 認証方式：ID / パスワード（ローカル認証）
- セッション管理：サーバサイドセッション
- メール連携：行わない（管理者が初期情報を手動通知）

---

## 2. 採用技術スタック

### 認証・セッション

- `passport`
- `passport-local`
- `express-session`
- `express-mysql-session`

### セキュリティ

- パスワードハッシュ：`bcrypt`（不可逆）

### DB

- MySQL 8.x
- ストレージエンジン：InnoDB
- 文字コード：utf8mb4

---

## 3. ユーザ管理方針

### ユーザ作成

- ユーザ作成は **管理者のみ** がユーザ登録画面で行う。
- 初期ログイン情報（ID / 初期パスワード）は **手動通知**
- メール送信・自己登録機能は実装しない（サンプル用途）

### 初期パスワード運用

- 初回ログイン時は **パスワード変更を必須**
- DBに `is_initial_password` フラグを保持
- パスワード変更完了後にフラグをOFF

---

## 4. データベース設計

### users テーブル

#### 設計意図

- UUIDは **BINARY(16)** を使用し、サイズ効率とインデックス性能を優先
- `login_name` をログインIDとして利用（ユニーク）
- `created_at` に統一し、冗長な日付カラムは持たない
- 初期パスワード判定用フラグを追加

#### DDL

```sql
CREATE TABLE users (
  user_id             BINARY(16) NOT NULL,
  login_name          VARCHAR(64) NOT NULL,
  mail_address        VARCHAR(254) NULL,
  password_hash       VARCHAR(255) NOT NULL,
  is_initial_password TINYINT(1) NOT NULL DEFAULT 1,
  created_at          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                        ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (user_id),
  UNIQUE KEY uk_users_login_name (login_name),
  UNIQUE KEY uk_users_mail_address (mail_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;