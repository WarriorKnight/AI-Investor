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

module.exports = { predict };