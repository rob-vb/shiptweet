import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use a getter to defer connection until runtime
const getDb = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Optimized for serverless (Vercel)
  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
};

// Lazy initialization - only connects when first used
let _db: ReturnType<typeof getDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    if (!_db) {
      _db = getDb();
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
