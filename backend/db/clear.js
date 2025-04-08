const { PrismaClient } = require('./../generated/client/index.js');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.transaction.deleteMany();
    await prisma.position.deleteMany();
    await prisma.portfolioState.deleteMany();

    console.log('All models cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();