const {getWeeklyStocksData, getNews, isMarketOpened} = require('./client');
const fs = require('fs');
const path = require('path');

async function fetchAllStocks(){
  try {
    conf = JSON.parse(await fs.promises.readFile(path.resolve(__dirname, '../.conf'), 'utf8'));
    var stocksData = [];
    for (var stock in conf.stocks){
      prices = await getWeeklyStocksData(conf.stocks[stock]);
      news = await getNews(conf.stocks[stock]);
      // console.log(JSON.stringify(prices));
      // console.log(prices);
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
    // console.log(JSON.stringify(stocksData, null, 2));
    return stocksData;

  } catch (error) {
    console.error('Error fetching stocks data:', error);
  }
}


module.exports = {fetchAllStocks};