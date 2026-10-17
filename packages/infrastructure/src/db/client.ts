import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

export type DbClient = NeonHttpDatabase<typeof schema>;

export function createDbClient(databaseUrl?: string): DbClient {
  const url = databaseUrl || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required to create Neon DB client.');
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}
