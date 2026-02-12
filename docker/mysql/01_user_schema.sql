CCREATE TABLE users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;REATE TABLE users (
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
