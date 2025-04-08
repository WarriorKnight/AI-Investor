import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('/api/portfolio');
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch portfolio data');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Prepare data for the chart
    // Prepare data for the chart
const chartData = Array.isArray(data.portfolio)
? data.portfolio.map((state) => ({
      timestamp: new Date(state.timestamp).getTime(), // Convert timestamp to Unix time in milliseconds
      cashBalance: state.cashBalance,
      portfolioValue: state.portfolioValue,
      totalValue: state.totalValue,
  }))
: [];
chartData.reverse(); // Ensure the data is in chronological order
    return (
        <div>
            <h1>Ai</h1>
            <h2>Portfolio Summary</h2>
            {data.info ? (
                <div>
                    <p>Cash Balance: ${data.info.cashBalance}</p>
                    <p>Portfolio Value: ${data.info.portfolioValue}</p>
                    <p>Total Value: ${data.info.totalValue}</p>
                </div>
            ) : (
                <p>No portfolio information available.</p>
            )}

<h2>Portfolio States Chart</h2>
{chartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                dataKey="timestamp"
                type="number" // Use a numeric scale for relative spacing
                domain={['dataMin', 'dataMax']} // Automatically adjust the domain based on the data
                tickFormatter={(tick) => new Date(tick).toLocaleString()} // Format timestamp for display
            />
            <YAxis />
            <Tooltip
                labelFormatter={(label) => `Time: ${new Date(label).toLocaleString()}`} // Format tooltip timestamp
            />
            <Legend />
            <Line type="monotone" dataKey="cashBalance" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="portfolioValue" stroke="#82ca9d" />
            <Line type="monotone" dataKey="totalValue" stroke="#ffc658" />
        </LineChart>
    </ResponsiveContainer>
) : (
    <p>No portfolio states available for the chart.</p>
)}

            <h2>Positions</h2>
            {Array.isArray(data.positions) && data.positions.length > 0 ? (
                <ul>
                    {data.positions.map((position, index) => (
                        <li key={index}>
                            {position.symbol}: {position.quantity} shares at an average price of ${position.avgBuyPrice}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{data.positions}</p>
            )}

            <h2>Recent Transactions</h2>
            {Array.isArray(data.transactions) && data.transactions.length > 0 ? (
                <ul>
                    {data.transactions.map((transaction, index) => (
                        <li key={index}>
                            {transaction.action} {transaction.quantity} of {transaction.symbol} at ${transaction.price} on{' '}
                            {new Date(transaction.timestamp).toLocaleString()}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{data.transactions}</p>
            )}
        </div>
    );
}

export default App;