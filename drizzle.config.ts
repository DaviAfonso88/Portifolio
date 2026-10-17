import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './packages/infrastructure/src/db/schema.ts',
  out: './packages/infrastructure/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://user:pass@ep-empty.neon.tech/neondb?sslmode=require',
  },
});
