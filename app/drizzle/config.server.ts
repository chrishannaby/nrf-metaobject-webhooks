import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

export const db = drizzle(new Database(process.env.DATABASE_URL));
// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
});
