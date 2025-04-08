const {PrismaClient} = require('./../generated/client/index.js');
const prisma = new PrismaClient()

async function fetchTransactions() {
    try {
      const transactions = await prisma.transaction.findMany();
      console.log(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

async function getPortfolioAll() {
  try {
    // Fetch all portfolio states, positions, and transactions in parallel
    const [portfolioStates, positions, transactions] = await Promise.all([
      prisma.portfolioState.findMany({
        orderBy: { timestamp: 'desc' },
      }),
      prisma.position.findMany(),
      prisma.transaction.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    // Return combined portfolio data
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

async function getLastTransactions(){
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
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

// getPortfolio();
// getPositions();
// getLastTransactions();
module.exports = {initializeDatabase, getPositions, getLastTransactions, getPortfolio, fetchTransactions, getPortfolioAll};