# DB を初期状態から作り直す

マイグレーションがループする・カラムが反映されない場合は、テーブルと履歴を消して 0000 だけやり直す。

## 1. テーブルとマイグレーション履歴を削除

MySQL に接続して実行（例: `docker compose exec mysql mysql -u kd1 -pkd1 kd1`）:

```sql
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `__drizzle_migrations`;
```

## 2. マイグレーションを実行

```bash
pnpm --filter @kd1-labs/db-client run db:migrate
```

0000 が 1 回だけ実行され、`users` が `screen_name` 含めて作成される。

## 3. 必要なら初期データを投入

（シードや admin ユーザーなどは別途用意する）
