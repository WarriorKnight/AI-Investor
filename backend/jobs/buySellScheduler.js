const { CronJob } = require('cron');
const { getPortfolio, getPositions, getLastTransactions } = require('../db/client');
const { fetchAllStocks } = require('../stocks/yahooFinanceClient');
const { predict, filterDataForPrediction } = require('../predict/predict');
const { loadActions } = require('../portfolioActions');

// Executes the main job logic to fetch data, filter it, predict actions, and load them.
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

// Schedules the job to run at a specified interval using a cron expression.
const job = new CronJob('0 8,14,23 * * *', async () => {
    console.log("Starting job.");
    await executeJob();
    console.log("Finished job");
});

// (async () => {
//     console.log("Running job at startup.");
//     await executeJob();
// })();

job.start();