CREATE TABLE `member_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`platform` text NOT NULL,
	`source_url` text,
	`checked_at` text NOT NULL,
	`surfaces_checked` text DEFAULT '' NOT NULL,
	`result` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mention_observations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_account_id` text NOT NULL,
	`target_account_id` text,
	`target_handle` text NOT NULL,
	`source_url` text NOT NULL,
	`platform` text NOT NULL,
	`surface` text NOT NULL,
	`evidence_text` text NOT NULL,
	`captured_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mention_source_target_surface_unique` ON `mention_observations` (`source_account_id`,`source_url`,`target_handle`,`surface`);