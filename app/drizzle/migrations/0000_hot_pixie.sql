CREATE TABLE `drops` (
	`id` integer PRIMARY KEY NOT NULL,
	`shopifyId` text NOT NULL,
	`startedEventId` text NOT NULL,
	`startTime` text NOT NULL,
	`endedEventId` text,
	`endTime` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drops_shopifyId_unique` ON `drops` (`shopifyId`);