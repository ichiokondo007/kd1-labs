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