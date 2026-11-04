import dotenv from 'dotenv';
import path from 'path';

// Carrega o arquivo .env tanto da raiz quanto da pasta do pacote
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import bcrypt from 'bcryptjs';
import { createDbClient } from './client';
import { adminUsers, categories, tags } from './schema';

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required to run database seed.');
    process.exit(1);
  }

  const db = createDbClient(databaseUrl);

  const adminId = '01918a20-0000-7000-8000-000000000001';
  const adminEmail = (process.env.ADMIN_EMAIL || 'daviafonso5894@gmail.com').trim().toLowerCase();
  // O seed sobrescreve a senha do admin: sem esta variável, gravaria uma senha conhecida no banco.
  const rawPassword = process.env.ADMIN_PASSWORD;
  if (!rawPassword) {
    console.error('ADMIN_PASSWORD environment variable is required to run database seed.');
    process.exit(1);
  }
  const passwordHash = bcrypt.hashSync(rawPassword, 10);

  console.log(`Seeding admin user (${adminEmail})...`);
  await db
    .insert(adminUsers)
    .values({
      id: adminId,
      email: adminEmail,
      passwordHash,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: adminUsers.id,
      set: {
        email: adminEmail,
        passwordHash,
        updatedAt: new Date(),
      },
    });

  console.log('Seeding default categories...');
  const defaultCategories = [
    {
      id: '01918a20-0000-7000-8000-000000000011',
      namePtBr: 'Arquitetura',
      nameEn: 'Architecture',
      slugPtBr: 'arquitetura',
      slugEn: 'architecture',
    },
    {
      id: '01918a20-0000-7000-8000-000000000012',
      namePtBr: 'Backend',
      nameEn: 'Backend',
      slugPtBr: 'backend',
      slugEn: 'backend',
    },
    {
      id: '01918a20-0000-7000-8000-000000000013',
      namePtBr: 'Automação',
      nameEn: 'Automation',
      slugPtBr: 'automacao',
      slugEn: 'automation',
    },
    {
      id: '01918a20-0000-7000-8000-000000000014',
      namePtBr: 'Processo',
      nameEn: 'Process',
      slugPtBr: 'processo',
      slugEn: 'process',
    },
  ];

  for (const cat of defaultCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  console.log('Seeding default tags...');
  const defaultTags = [
    {
      id: '01918a20-0000-7000-8000-000000000021',
      namePtBr: 'nextjs',
      nameEn: 'nextjs',
      slugPtBr: 'nextjs',
      slugEn: 'nextjs',
    },
    {
      id: '01918a20-0000-7000-8000-000000000022',
      namePtBr: 'drizzle',
      nameEn: 'drizzle',
      slugPtBr: 'drizzle',
      slugEn: 'drizzle',
    },
    {
      id: '01918a20-0000-7000-8000-000000000023',
      namePtBr: 'postgresql',
      nameEn: 'postgresql',
      slugPtBr: 'postgresql',
      slugEn: 'postgresql',
    },
    {
      id: '01918a20-0000-7000-8000-000000000024',
      namePtBr: 'arquitetura-hexagonal',
      nameEn: 'hexagonal-architecture',
      slugPtBr: 'arquitetura-hexagonal',
      slugEn: 'hexagonal-architecture',
    },
    {
      id: '01918a20-0000-7000-8000-000000000025',
      namePtBr: 'serverless',
      nameEn: 'serverless',
      slugPtBr: 'serverless',
      slugEn: 'serverless',
    },
  ];

  for (const tag of defaultTags) {
    await db.insert(tags).values(tag).onConflictDoNothing();
  }

  console.log('[✓] Database seed completed successfully!');
}

runSeed().catch((err) => {
  console.error('Database seed failed with error:', err);
  process.exit(1);
});
