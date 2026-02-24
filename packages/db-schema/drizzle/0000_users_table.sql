CREATE TABLE `users` (
	`user_id` varchar(64) NOT NULL,
	`user_name` varchar(64) NOT NULL,
	`screen_name` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`is_initial_password` boolean NOT NULL DEFAULT true,
	`is_admin` boolean NOT NULL DEFAULT false,
	`avatar_url` varchar(512),
	`avatar_color` varchar(20) NOT NULL DEFAULT 'zinc-900',
	`updated_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_user_name_unique` UNIQUE(`user_name`)
);
