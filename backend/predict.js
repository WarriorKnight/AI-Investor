// predict == paste all data into one GIANT prompt and exec the output

const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const instructions = `
You are an AI investor managing a virtual stock portfolio.

Your task is to analyze the current portfolio, available cash, and market prices. Based on this data, suggest a single or multiple stock trades (either a BUY or a SELL).

⚠️ Respond ONLY with a valid JSON object using this exact structure:

[
{
  "action": "BUY" or "SELL",
  "symbol": "STOCK_SYMBOL",
  "quantity": number,
  "reason": "Your reasoning in one sentence"
},
]
Make risks when possible, no risk no gain, you want to max the profit as much as possible.
Buy many stocks at once, go for max profit.
If the current positions are empty, buy more stocks.
Write the reasons in czech language.
Do NOT include any extra text or explanation outside the JSON.
Make sure the action is possible with the available cash or holdings.
When you want to buy a stock, but don't have enough money, sell some stocks first, and then buy it.
Make atleast 2 actions.
Assume that we buy stocks every 2 hours.
Try to short if possible.
Leave at least 2k dollars as a reserve.
Avoid suggesting fractional quantities.
Be diverse when buying stocks, if you bought some stock in previous transactions, buy it only if it is really worth it.
Do not format the response as a code block.
If no good trade is possible, you may return: { "action": "HOLD" }
`;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

async function predict(input) {
    const response = await client.responses.create({
        model: 'o3-mini',
        instructions,
        input: JSON.stringify(input),
      });
    console.log(`Input: ${JSON.stringify(input)}`);
    console.log(`Output: ${response.output_text}`);
    console.log(`Character count (input): ${JSON.stringify(input).length}`);
    console.log(`Character count (output): ${response.output_text.length}`);
    console.log(response.output_text);
    return response.output_text;
}

module.exports = {predict, filterDataForPrediction};
