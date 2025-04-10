const OpenAI = require('openai');
const dotenv = require('dotenv');
const instructions = require('./prompt');
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function predict(input) {
    const response = await client.responses.create({
        model: 'o3-mini',
        instructions,
        input: JSON.stringify(input),
      });
    return response.output_text;
}

function filterDataForPrediction(data) {
  const filteredStocks = data.stocksAvaibleToBuy.map(stock => ({
      symbol: stock.information.symbol,
      price: stock.information.regularMarketPrice,
      high52Week: stock.information.fiftyTwoWeekHigh,
      low52Week: stock.information.fiftyTwoWeekLow,
      dayHigh: stock.information.regularMarketDayHigh,
      dayLow: stock.information.regularMarketDayLow,
      quotes: stock.quotes.map(quote => ({
        date: quote.date,
        close: quote.close,
      })),
      news: stock.news
  }));

  const filteredPortfolio = {
      cashBalance: data.myPortfolio.cashBalance,
      portfolioValue: data.myPortfolio.portfolioValue,
      totalValue: data.myPortfolio.totalValue,
  };

  const filteredPositions = data.stocksInPosition.map(position => ({
      symbol: position.symbol,
      quantity: position.quantity,
      avgBuyPrice: position.avgBuyPrice,
      currentPrice: position.currentPrice,
  }));

  const filteredTransactions = data.lastTransactions.map(transaction => ({
      action: transaction.action,
      symbol: transaction.symbol,
      quantity: transaction.quantity,
      price: transaction.price,
      timestamp: transaction.timestamp,
      reason: transaction.reason,
  }));

  return {
      stocksAvaibleToBuy: filteredStocks,
      myPortfolio: filteredPortfolio,
      stocksInPosition: filteredPositions,
      lastTransactions: filteredTransactions,
  };
}

module.exports = { predict, filterDataForPrediction };