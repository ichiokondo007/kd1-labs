# login

- URL: localhost:5173

- すでにSeesion情報でログイン済の場合は、TOP画面へ画面遷移。
- Remembar meは未実装でよい。2g
- userIdとpasswordを入力後"login"button押下。サーバ上でuserテーブルでパスワード✅
  - pssword✅OK + is_initial_passwordが 0
    -sessionに user_id,user_name,is_adminの userInfoを保存。
    - 「Top」画面へ画面遷移。
  - pssword✅OK + is_initial_passwordが 1
    - 「passwordChenge」画面へ遷移。
  - password✅NG
    - login画面でエラーメッセージ表示

## userテーブル

```sql

CREATE TABLE users (
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(64) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_initial_password TINYINT(1) NOT NULL DEFAULT 1,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_users_login_name (user_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
```

## API クライアントからaxiosでAPI実行

- /login post
  - request userID,passwrod
  - response ok → userInfo ng →null

## userInfo

- userId string
- userName string
- isInitialPassword  number
- isAdmin number

