CREATE TABLE `draws` (
	`id` integer PRIMARY KEY NOT NULL,
	`shopifyId` text NOT NULL,
	`startedEventId` text NOT NULL,
	`startTime` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `draws_shopifyId_unique` ON `draws` (`shopifyId`);