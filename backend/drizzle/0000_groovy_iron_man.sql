CREATE TABLE `games` (
	`app_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`steam_id` text NOT NULL,
	`app_id` integer NOT NULL,
	`playtime_forever` integer NOT NULL,
	`playtime_2_weeks` integer,
	`cached_at` integer NOT NULL,
	FOREIGN KEY (`steam_id`) REFERENCES `users`(`steam_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`app_id`) REFERENCES `games`(`app_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`steam_id` text PRIMARY KEY NOT NULL,
	`persona_name` text NOT NULL,
	`avatar_hash` text NOT NULL,
	`cached_at` integer NOT NULL
);
