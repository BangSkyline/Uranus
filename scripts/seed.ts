import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@uranus.com' },
    update: {},
    create: {
      email: 'test@uranus.com',
      username: 'testuser',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log('Created test user:', user);

  // Create an admin user
  const adminHashedPassword = bcrypt.hashSync('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@uranus.com' },
    update: {},
    create: {
      email: 'admin@uranus.com',
      username: 'admin',
      password: adminHashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

