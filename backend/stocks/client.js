const yahooFinance = require('yahoo-finance2').default;

async function getWeeklyStocksData(symbol) {
    const today = new Date();
    const startInterval = new Date();
    startInterval.setDate(today.getDate() - 1);
  
    const results = await yahooFinance.chart(symbol, {
      period1: startInterval,
      period2: today,
      interval: '1h',
    });
    // console.log(results);
    return results;
}

async function getNews(symbol){
    const news = await yahooFinance.search(symbol);
    return news.news;
}

async function getCurrentPrice(symbol){
  const results = await yahooFinance.quote(symbol);
  // console.log(JSON.stringify(results, null, 2));
  return results.regularMarketPrice;
}

async function isMarketOpened(symbol){
  try {
    const quote = await yahooFinance.quote(symbol);
    const marketState = quote.marketState;
    // console.log(JSON.stringify(quote));
    // console.log(marketState);
    // console.log(`Market state for ${symbol}: ${marketState}`);
    return marketState === 'REGULAR';
  } catch (error) {
    // console.error(`Error fetching market state for ${symbol}:`, error);
    return false;
  }
}

module.exports = {getWeeklyStocksData, getNews, getCurrentPrice, isMarketOpened};