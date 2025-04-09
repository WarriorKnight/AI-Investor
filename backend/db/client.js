const {PrismaClient} = require('./../generated/client/index.js');
const prisma = new PrismaClient()

const MAX_TRANSACTIONS = 10; //max transactions from history to fetch

// Initializes the database with a default portfolio state if it doesn't exist.
async function initializeDatabase(cashBalance) {
  try {
    const existingBalance = await prisma.portfolioState.findUnique({
      where: { id: 1 },
    });

    if (!existingBalance) {
      await prisma.portfolioState.create({
        data: { id: 1, cashBalance, portfolioValue: 0, totalValue: cashBalance },
      });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Clears all data from the database tables.
async function clearDatabase() {
  try {
    await prisma.transaction.deleteMany();
    await prisma.position.deleteMany();
    await prisma.portfolioState.deleteMany();

    console.log('All models cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

// Fetches all transactions from the database.
async function fetchTransactions() {
    try {
      const transactions = await prisma.transaction.findMany();
      console.log(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
}

// Fetches the latest portfolio state from the database.
async function getPortfolio() {
  try {
    const portfolio = await prisma.portfolioState.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    if (!portfolio) {
      return { error: 'Portfolio not found' };
    }
    return {
        cashBalance: portfolio.cashBalance,
        portfolioValue: portfolio.portfolioValue,
        totalValue: portfolio.totalValue,
    };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return { error: 'Error fetching portfolio' };
  }
}

// Fetches all portfolio states, positions, and transactions from the database.
async function getPortfolioAll() {
  try {
    const [portfolioStates, positions, transactions] = await Promise.all([
      prisma.portfolioState.findMany({
      orderBy: { timestamp: 'desc' },
      }),
      prisma.position.findMany(),
      prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      }),
    ]);
    return {
      portfolio: portfolioStates.length > 0 ? portfolioStates : 'No portfolio states available.',
      positions: positions.length > 0 ? positions : 'No positions available.',
      transactions: transactions.length > 0 ? transactions : 'No recent transactions found.',
      info: portfolioStates.length > 0
        ? {
            cashBalance: portfolioStates[0].cashBalance,
            portfolioValue: portfolioStates[0].portfolioValue,
            totalValue: portfolioStates[0].totalValue,
          }
        : 'No portfolio states available.',
    };
  } catch (error) {
    console.error('Error fetching complete portfolio data:', error);
    return { error: 'Error fetching portfolio data' };
  }
}

// Fetches all positions from the database.
async function getPositions(){
  try {
    const positions = await prisma.position.findMany();
    if (positions.length === 0) {
      return { positions: 'Currently no stocks in your position.' };
    }
    return positions
  } catch (error) {
    console.error('Error fetching positions', error);
  }
}

// Fetches the most recent transactions from the database, limited by MAX_TRANSACTIONS.
async function getLastTransactions(){
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: MAX_TRANSACTIONS,
    });

    if (transactions.length === 0) {
      return { transactions: 'No recent transactions found.' };
    }
    return transactions;
  } catch (error) {
    console.error('Error fetching last transactions:', error);
    return { error: 'Error fetching last transactions' };
  }
}

module.exports = {initializeDatabase, getPositions, getLastTransactions, getPortfolio, fetchTransactions, getPortfolioAll};