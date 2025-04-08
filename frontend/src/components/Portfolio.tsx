import React from 'react';
import './../App.css';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PortfolioState {
    timestamp: string;
    cashBalance: number;
    portfolioValue: number;
    totalValue: number;
}

interface PortfolioProps {
    portfolio: PortfolioState[];
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio }) => {
    if (!portfolio || portfolio.length === 0) {
        return <p className="portfolio-empty">Žádné stavy portfolia nejsou k dispozici.</p>;
    }

    // Prepare data for the chart
    const chartData = portfolio.map((state) => ({
        timestamp: new Date(state.timestamp).getTime(), // Convert timestamp to Unix time
        cashBalance: state.cashBalance,
        portfolioValue: state.portfolioValue,
        totalValue: state.totalValue,
    }));
    chartData.reverse(); // Ensure chronological order

    return (
        <div className="portfolio-container">
            <h2>Stavy portfolia</h2>
            <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => new Date(tick).toLocaleString('cs-CZ')}
            />
            <YAxis />
            <Tooltip
            labelFormatter={(label) => `Čas: ${new Date(label).toLocaleString('cs-CZ')}`}
            formatter={(value, name) => {
                const namesInCzech = {
                cashBalance: 'Hotovostní zůstatek',
                portfolioValue: 'Hodnota portfolia',
                totalValue: 'Celková hodnota',
                };
                return [`${value}`, namesInCzech[name as keyof typeof namesInCzech] || name];
            }}
            />
            <Legend
            formatter={(value) => {
                const namesInCzech = {
                cashBalance: 'Hotovostní zůstatek',
                portfolioValue: 'Hodnota portfolia',
                totalValue: 'Celková hodnota',
                };
                return namesInCzech[value as keyof typeof namesInCzech] || value;
            }}
            />
            <Line type="monotone" dataKey="cashBalance" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="portfolioValue" stroke="#82ca9d" />
            <Line type="monotone" dataKey="totalValue" stroke="#ffc658" />
            </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Portfolio;