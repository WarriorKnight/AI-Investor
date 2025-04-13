import React from 'react';
import './../App.css';
import {
    AreaChart,
    Area,
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

    const chartData = portfolio.map((state) => ({
        timestamp: new Date(state.timestamp).getTime(),
        cashBalance: state.cashBalance,
        portfolioValue: state.portfolioValue,
    }));
    chartData.reverse();

    return (
        <div className="portfolio-container">
            <h2>Stavy portfolia</h2>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                        formatter={(value, name, props) => {
                            const namesInCzech = {
                                cashBalance: 'Hotovostní zůstatek',
                                portfolioValue: 'Hodnota portfolia',
                            };
                        
                            const startingValue = 100000; // Define the starting value for percentage calculation
                        
                            // Calculate totalValue for the current data point
                            const totalValue = props.payload.cashBalance + props.payload.portfolioValue;
                        
                            if (name === 'portfolioValue') {
                                const percentage = ((totalValue / startingValue) * 100).toFixed(2); // Calculate percentage
                                return [`$${Math.round(Number(value))} (${percentage}%)`, namesInCzech[name as keyof typeof namesInCzech]];
                            }
                        
                            return [`$${Math.round(Number(value))}`, namesInCzech[name as keyof typeof namesInCzech] || name];
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => {
                            const namesInCzech = {
                                cashBalance: 'Hotovostní zůstatek',
                                portfolioValue: 'Hodnota portfolia',
                            };
                            return namesInCzech[value as keyof typeof namesInCzech] || value;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="cashBalance"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                    />
                    <Area
                        type="monotone"
                        dataKey="portfolioValue"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Portfolio;