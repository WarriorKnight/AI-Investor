const yahooFinance = require('yahoo-finance2').default;

async function getWeeklyStocksData(symbol) {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
  
    const results = await yahooFinance.chart(symbol, {
      period1: oneWeekAgo,
      period2: today,
      interval: '1d',
    });
    // console.log(results);
    return results;
}

async function getNews(symbol){
    const news = await yahooFinance.search(symbol);
    return news.news;
}

module.exports.default = {getWeeklyStocksData, getNews};