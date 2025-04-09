const { CronJob } = require('cron');
const { getPortfolio, getPositions, getLastTransactions, filterDataForPrediction } = require('../db/client');
const { fetchAllStocks } = require('../stocks/stocks');
const { predict } = require('../predict');
const { loadActions } = require('../actions');

async function executeJob() {
    console.log("Executing job logic.");
    const stocksData = await fetchAllStocks();
    const portfolioData = await getPortfolio();
    const positionsData = await getPositions();
    const transactionsData = await getLastTransactions();

    
    
    const rawData = {
        stocksAvaibleToBuy: stocksData,
        myPortfolio: portfolioData,
        stocksInPosition: positionsData,
        lastTransactions: transactionsData,
    };
    
    const filteredData = filterDataForPrediction(rawData);
    
    const actions = await predict(filteredData);

    loadActions(actions);
}

const job = new CronJob('30 */1 * * *', async () => {
    console.log("Starting job.");
    await executeJob();
});

// (async () => {
//     console.log("Running job at startup.");
//     await executeJob();
// })();

job.start();
