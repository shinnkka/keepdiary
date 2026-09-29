CREATE TABLE `custom_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`color` text,
	`repeat_rule` text DEFAULT 'none' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `diary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`title` text,
	`content` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diary_date_unique` ON `diary` (`date`);--> statement-breakpoint
CREATE TABLE `diary_status` (
	`diary_id` integer NOT NULL,
	`status_id` integer NOT NULL,
	PRIMARY KEY(`diary_id`, `status_id`),
	FOREIGN KEY (`diary_id`) REFERENCES `diary`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `diary_status_status_idx` ON `diary_status` (`status_id`);--> statement-breakpoint
CREATE TABLE `image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diary_id` integer NOT NULL,
	`path` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`width` integer,
	`height` integer,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`diary_id`) REFERENCES `diary`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `image_diary_idx` ON `image` (`diary_id`);--> statement-breakpoint
CREATE TABLE `status` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
