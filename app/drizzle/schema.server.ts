import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const drops = sqliteTable("drops", {
  id: integer("id").primaryKey(),
  shopifyId: text("shopifyId").notNull().unique(),
  startedEventId: text("startedEventId").notNull(),
  startTime: text("startTime").notNull(),
  endedEventId: text("endedEventId"),
  endTime: text("endTime"),
});

export const draws = sqliteTable("draws", {
  id: integer("id").primaryKey(),
  shopifyId: text("shopifyId").notNull().unique(),
  startedEventId: text("startedEventId").notNull(),
  startTime: text("startTime").notNull(),
});

export const drawSignups = sqliteTable("drawSignups", {
  id: integer("id").primaryKey(),
  drawId: text("drawId").notNull(),
  email: text("email").notNull().unique(),
});
