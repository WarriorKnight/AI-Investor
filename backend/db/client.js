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


async function getPortfolio() {
  try {
    const portfolio = await prisma.portfolioState.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    if (!portfolio) {
      return { error: 'Portfolio not found' };
    }
    console.log('Portfolio fetched:',{portfolio: portfolio});
    return {
      portfolio:{
        cashBalance: portfolio.cashBalance,
        portfolioValue: portfolio.portfolioValue,
        totalValue: portfolio.totalValue,
      }
    };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return { error: 'Error fetching portfolio' };
  } finally {
    await prisma.$disconnect();
  }
}

async function getPositions(){
  try {
    const positions = await prisma.position.findMany();
    if (positions.length === 0) {
      return { positions: 'Currently no stocks in your position.' };
    }
    console.log('Positions fetched:', {positions: positions});
    return {positions: positions}
  } catch (error) {
    console.error('Error fetching positions', error);
  }
}

getPortfolio();
getPositions();
module.exports = {initializeDatabase};