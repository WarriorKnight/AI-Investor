const client = require('./client').default;
const fs = require('fs');



async function fetchAllStocks(){
  
  try {
    const results = await client.getWeeklyStocksData('AAPL');
    console.log(results);

    fs.readFile('./../.conf', 'utf8', function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);
      for (var stock in obj.stocks){
        console.log(obj.stocks[stock]);
      }
    });


  } catch (error) {
    console.error('Error fetching weekly stocks data:', error);
  }
}

fetchAllStocks();