const {PrismaClient} = require('./../generated/client/index.js');
const prisma = new PrismaClient()

async function fetchTransactions() {
    try {
      const transactions = await prisma.transaction.findMany();
      console.log(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      await prisma.$disconnect();
    }
}

async function initializeDatabase(cashBalance) {
  try {
    const existingBalance = await prisma.portfolioState.findUnique({
      where: { id: 1 },
    });

    if (!existingBalance) {
      await prisma.portfolioState.create({
        data: { id: 1, cashBalance, portfolioValue: 0, totalValue: cashBalance },
      });
      console.log('Database initialized with cash balance of ', cashBalance, '.');
    } else {
      console.log('Database already initialized.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {initializeDatabase};