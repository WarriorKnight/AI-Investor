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

    const startingCashBalance = portfolio[portfolio.length - 1].cashBalance;
    const currentCashBalance = portfolio[0].cashBalance;
    const currentPortfolioValue = portfolio[0].portfolioValue;
    const currentTotalValue = portfolio[0].totalValue;
    const percentageChange = ((currentTotalValue - startingCashBalance) / startingCashBalance) * 100;

    return (
        <div className="stats-container">
            <h2>Statistiky portfolia</h2>
            <p>Aktuální hotovostní zůstatek: <strong>${currentCashBalance.toFixed(2)}</strong></p>
            <p>Aktuální hodnota portfolia: <strong>${currentPortfolioValue.toFixed(2)}</strong></p>
            <p>Celková hodnota portfolia: <strong>${currentTotalValue.toFixed(2)}</strong></p>
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