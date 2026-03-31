-- マイグレーション後に実行されるシード（INSERT）用 SQL。
-- ファイル名の昇順で実行される。開発用の初期データなどを記述する。
--
-- 例: 開発用ユーザーを追加する場合
-- パスワードハッシュは apps/server の scripts/hash-password.mjs で生成し、下の <PASSWORD_HASH> を置き換える。
--
-- INSERT INTO users (user_id, user_name, screen_name, password_hash, is_initial_password, is_admin, avatar_color)
-- VALUES ('dev-user-1', 'devuser', '開発ユーザー', '<PASSWORD_HASH>', true, true, 'zinc-900');
INSERT IGNORE INTO
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
VALUES 
    (
        'd1',
        'd1',
        'd1',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        0,
        NULL,
        '#e80bcb',
        '2026-03-23 14:37:44.40000'
    ),
    (
        'd2',
        'd2',
        'd2',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        0,
        NULL,
        '#e80bcb',
        '2026-03-23 14:37:44.40000'
    ),
    (
        'd3',
        'd3',
        'd3',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        0,
        NULL,
        '#e80bcb',
        '2026-03-23 14:37:44.40000'
    ),
    (
        'd4',
        'd4',
        'd4',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        0,
        NULL,
        '#e80bcb',
        '2026-03-23 14:37:44.40000'
    ),
    (
        'd5',
        'd5',
        'd5',
        '$2b$10$hBgWA9H1XZQmBNxdlhT2POyOpSZxiU6wXEg.J99xxfoYOpTDFDC0e',
        0,
        0,
        NULL,
        '#e80bcb',
        '2026-03-23 14:37:44.40000'
    );
