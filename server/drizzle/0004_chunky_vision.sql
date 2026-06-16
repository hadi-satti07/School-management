CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`class_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` ADD `father_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `academics` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `attendance` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `behaviour` integer DEFAULT 0;