const { fetchAllStocks } = require("./stocks/stocks.js");
const {predict} = require('./predict.js');
const {loadActions} = require('./actions.js');
(async () => {
    // const output = await fetchAllStocks();
    // console.log(output);
    // console.log(predict(output));
    loadActions('[{  "action": "BUY",  "symbol": "AAPL",  "quantity": 10,  "reason": "Apples stock is undervalued based on recent earnings."},{  "action": "SELL",  "symbol": "TSLA",  "quantity": 5,  "reason": "Teslas stock has reached a short-term high and is overvalued."},{  "action": "BUY",  "symbol": "MSFT",  "quantity": 15,  "reason": "Microsoft shows strong growth potential in cloud computing."}]')
})();