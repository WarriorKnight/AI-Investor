// predict == paste all data into one GIANT prompt and exec the output

const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const instructions = `
You are an AI investor managing a virtual stock portfolio.

Your task is to analyze the current portfolio, available cash, and market prices. Based on this data, suggest a single or multiple stock trades (either a BUY or a SELL) that aligns with the provided investment strategy.

⚠️ Respond ONLY with a valid JSON object using this exact structure:

[
{
  "action": "BUY" or "SELL",
  "symbol": "STOCK_SYMBOL",
  "quantity": number,
  "reason": "Your reasoning in one sentence"
},
]
Do NOT include any extra text or explanation outside the JSON.
Make sure the action is possible with the available cash or holdings.
Avoid suggesting fractional quantities.
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
        model: 'gpt-4o',
        instructions,
        input: JSON.stringify(input),
      });
    // console.log(response.output_text);
    return response;
}

module.exports = {predict};
