-- マイグレーション後に実行されるシード（INSERT）用 SQL。
-- ファイル名の昇順で実行される。開発用の初期データなどを記述する。
--
-- 例: 開発用ユーザーを追加する場合
-- パスワードハッシュは apps/server の scripts/hash-password.mjs で生成し、下の <PASSWORD_HASH> を置き換える。
--
-- INSERT INTO users (user_id, user_name, screen_name, password_hash, is_initial_password, is_admin, avatar_color)
-- VALUES ('dev-user-1', 'devuser', '開発ユーザー', '<PASSWORD_HASH>', true, true, 'zinc-900');
INSERT INTO
    kd1.users (
        user_id,
        user_name,
        screen_name,
        password_hash,
        is_initial_password,
        is_admin,
        avatar_url,
        avatar_color,
        updated_at
    )
VALUES (
        '1',
        'admin',
        '管理 太郎',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        1,
        NULL,
        '#8b5cf6',
        '2026-02-25 14:37:44.40000'
    );