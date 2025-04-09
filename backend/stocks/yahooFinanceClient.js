const yahooFinance = require('yahoo-finance2').default;

// Fetches hourly stock data for the past day for a given symbol.
async function getWeeklyStocksData(symbol) {
    const today = new Date();
    const startInterval = new Date();
    startInterval.setDate(today.getDate() - 1);
  
    const results = await yahooFinance.chart(symbol, {
      period1: startInterval,
      period2: today,
      interval: '1h',
    });
    return results;
}

// Fetches the latest news articles related to a given stock symbol.
async function getNews(symbol) {
  try {
    const news = await yahooFinance.search(symbol);
    if (!news || !news.news) {
      throw new Error('No news data received from API');
    }
    return news.news;
  } catch (error) {
    console.error('Error fetching news:', error.message || error);
    return [];
  }
}

// Fetches the current market price of a given stock symbol.
async function getCurrentPrice(symbol) {
  try {
    const results = await yahooFinance.quote(symbol);
    if (!results || results.regularMarketPrice === undefined) {
      throw new Error('Invalid data received from API');
    }
    return results.regularMarketPrice;
  } catch (error) {
    console.error('Error fetching current price:', error.message || error);
    return null;
  }
}

// Checks if the market is currently open for a given stock symbol.
async function isMarketOpened(symbol){
  try {
    const quote = await yahooFinance.quote(symbol);
    const marketState = quote.marketState;
    return marketState === 'REGULAR';
  } catch (error) {
    return false;
  }
}

// Fetches all stocks saved in /.conf file
async function fetchAllStocks(){
  try {
    conf = JSON.parse(await fs.promises.readFile(path.resolve(__dirname, '../.conf'), 'utf8'));
    var stocksData = [];
    for (var stock in conf.stocks){
      prices = await getWeeklyStocksData(conf.stocks[stock]);
      news = await getNews(conf.stocks[stock]);

      // Check if the market is open for the current stock
      if (await isMarketOpened(conf.stocks[stock])) {
        stocksData.push({
          information: prices.meta,
          quotes: prices.quotes,
          news: news.map(item => item.title),
        });
        console.log(`Market is open for: ${conf.stocks[stock]}`);
      } else {
        console.log(`Market is not open for: ${conf.stocks[stock]}`);
      }
    }
    return stocksData;
  } catch (error) {
    console.error('Error fetching stocks data:', error);
  }
}

module.exports = {getWeeklyStocksData, getNews, getCurrentPrice, isMarketOpened, fetchAllStocks};