const { CronJob } = require('cron');
const { getPortfolio, getPositions, getLastTransactions } = require('../db/client');
const { fetchAllStocks } = require('../stocks/stocks');
const { predict } = require('../predict');
const { loadActions } = require('../actions');

async function executeJob() {
    console.log("Executing job logic.");
    const stocksData = await fetchAllStocks();
    const portfolioData = await getPortfolio();
    const positionsData = await getPositions();
    const transactionsData = await getLastTransactions();

    const actions = await predict({
        stocksAvaibleToBuy: stocksData,
        myPortfolio: portfolioData,
        stocksInPosition: positionsData,
        lastTransactions: transactionsData
    });

    loadActions(actions);
}

const job = new CronJob('30 */2 * * *', async () => {
    console.log("Starting job.");
    await executeJob();
});

// (async () => {
//     console.log("Running job at startup.");
//     await executeJob();
// })();

job.start();
