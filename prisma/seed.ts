import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const roles = [
    { code: 'ADMIN', name: 'Admin', description: 'Administrator of the system with full access' },
    { code: 'WRITER', name: 'Writer', description: 'Can write and manage own articles' },
    { code: 'EDITOR', name: 'Editor', description: 'Can review, edit, and publish articles' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {}, 
      create: role,
    });
  }
  console.log('Roles seeded successfully.');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminFullName = process.env.ADMIN_FULLNAME || 'Administrator';

  if (!adminEmail || !adminPassword) {
    console.warn('  ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env. Skipping Admin seed.');
    return;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: adminEmail }, { username: adminUsername }]
    }
  });

  if (!existingAdmin) {
    const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
    
    if (adminRole) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await prisma.user.create({
        data: {
          email: adminEmail,
          username: adminUsername,
          password: hashedPassword,
          fullName: adminFullName,
          roleId: adminRole.id,
        },
      });
      console.log('Admin user created successfully.');
    } else {
      console.error(' Could not find ADMIN role. Admin creation failed.');
    }
  } else {
    console.log('  Admin user already exists. Skipping creation.');
  }
  const defaultCategories = [
    { name: 'Politics', slug: 'politics', description: 'Political news and articles' },
    { name: 'Sports', slug: 'sports', description: 'Sports news globally' },
    { name: 'Technology', slug: 'technology', description: 'Tech related news' },
    { name: 'Economy', slug: 'economy', description: 'Global and local economics' },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(' Default Categories seeded successfully.');}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
