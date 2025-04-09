const { CronJob } = require('cron');
const { calculatePortfolioState } = require('./../actions');

// Executes the main job logic, to evaluate the portfolio
async function runPortfolioEvaluation() {
    console.log("Running Portfolio Evaluation Job.");
    const evaluationResults = await calculatePortfolioState();

    // if (evaluationResults) {
    //     console.log("Portfolio Evaluation Results:");
    //     console.log(`Cash Balance: ${evaluationResults.cashBalance}`);
    //     console.log(`Portfolio Value: ${evaluationResults.portfolioValue}`);
    //     console.log(`Total Value: ${evaluationResults.totalValue}`);
    // } else {
    //     console.error("Failed to calculate portfolio state.");
    // }
}

const portfolioEvaluationJob = new CronJob('0 * * * *', runPortfolioEvaluation);

// (async () => {
//     await runPortfolioEvaluation();
// })();

portfolioEvaluationJob.start();
