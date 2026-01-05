import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For migrations and direct queries
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
