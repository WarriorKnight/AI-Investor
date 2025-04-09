const express = require('express');
const path = require('path');
const { getPortfolioAll, initializeDatabase, filterDataForPrediction } = require('./db/client');
const app = express();

require('./jobs/portfolioEvaluationScheduler');
require('./jobs/buySellScheduler');

(async () => {
    try {
        await initializeDatabase(100000);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
})();

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/portfolio', async (req, res) => {
    try {
        const portfolioData = await getPortfolioAll();

        if (portfolioData.error) {
            return res.status(404).json({ error: portfolioData.error });
        }

        res.json(portfolioData);
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
});

const staticPath = path.join(__dirname, "dist");
app.use(express.static(staticPath));

app.get("/", (req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    fs.readFile(indexPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading index.html:", err);
            res.status(500).send("Internal Server Error");
        } else {
            res.send(data);
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});