CREATE TABLE `drawSignups` (
	`id` integer PRIMARY KEY NOT NULL,
	`drawId` text NOT NULL,
	`email` text NOT NULL,
	`firstName` text,
	`lastName` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drawSignups_email_unique` ON `drawSignups` (`email`);

