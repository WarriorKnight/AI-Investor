import React from 'react';
import './../App.css';

interface PortfolioState {
    cashBalance: number;
    portfolioValue: number;
    totalValue: number;
    timestamp: string;
}

interface StatsProps {
    portfolio: PortfolioState[];
}

const Stats: React.FC<StatsProps> = ({ portfolio }) => {
    if (!portfolio || portfolio.length === 0) {
        return <p className="stats-empty">Žádné informace o portfoliu nejsou k dispozici.</p>;
    }

    // Get the first portfolio state (starting cash balance)
    const startingCashBalance = portfolio[portfolio.length - 1].cashBalance;

    // Get the current total value (latest portfolio state)
    const currentTotalValue = portfolio[0].totalValue;

    // Calculate the percentage change
    const percentageChange = ((currentTotalValue - startingCashBalance) / startingCashBalance) * 100;

    return (
        <div className="stats-container">
            <h2>Statistiky portfolia</h2>
            <p>Počáteční hotovostní zůstatek: <strong>${startingCashBalance.toFixed(2)}</strong></p>
            <p>Hodnota portfolia: <strong>${currentTotalValue.toFixed(2)}</strong></p>
            <p>
                Změna portfolia: 
                <strong style={{ color: percentageChange >= 0 ? 'green' : 'red' }}>
                    {percentageChange.toFixed(2)}%
                </strong>
            </p>
        </div>
    );
};

export default Stats;