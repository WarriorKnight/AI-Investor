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
Make risks when possible, no risk no gain.
Buy many stocks at once, go for max profit.
If the current positions are empty, buy more stocks.
Write the reasons in czech language.
Do NOT include any extra text or explanation outside the JSON.
Make sure the action is possible with the available cash or holdings.
When you want to buy a stock, but don't have enough money, sell some stocks first, and then buy it.
Make atleast 2 actions.
Avoid suggesting fractional quantities.
Be diverse when buying stocks, if you bought some stock in previous transactions, buy it only if it is really worth it.
Do not format the response as a code block.
If no good trade is possible, you may return: { "action": "HOLD" }
`;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function predict(input) {
    //  input = {
    //     portfolio: {
    //       cash: 37500,
    //       holdings: [
    //         { symbol: "AAPL", quantity: 15, avgBuyPrice: 170.25 },
    //         { symbol: "TSLA", quantity: 10, avgBuyPrice: 232.10 }
    //       ]
    //     },
    //     prices: [
    //       { symbol: "AAPL", currentPrice: 174.50, changePercent: 2.4 },
    //       { symbol: "TSLA", currentPrice: 229.20, changePercent: -1.6 },
    //       { symbol: "MSFT", currentPrice: 312.40, changePercent: 0.7 },
    //       { symbol: "AMZN", currentPrice: 143.80, changePercent: 3.2 }
    //     ],
    //     strategy: "You are a moderately conservative investor. Prioritize stable, growing stocks and avoid high-risk trades. Avoid trading more than 20% of available cash or holdings."
    //   };

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

module.exports = {predict};
