import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./app/drizzle/schema.server.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH || "",
  },
} satisfies Config;
