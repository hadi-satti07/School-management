CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`section` text NOT NULL,
	`class_teacher` text NOT NULL,
	`teacher_subject` text NOT NULL,
	`room_number` text NOT NULL,
	`schedule` text NOT NULL,
	`status` text DEFAULT 'active',
	`students_count` integer DEFAULT 0
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`subject` text,
	`role` text NOT NULL,
	`pin_code` text,
	`password` text,
	`is_activated` integer DEFAULT false,
	`created_at` text DEFAULT '2026-06-04T07:36:57.337Z'
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "phone", "subject", "role", "pin_code", "password", "is_activated", "created_at") SELECT "id", "name", "email", "phone", "subject", "role", "pin_code", "password", "is_activated", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);