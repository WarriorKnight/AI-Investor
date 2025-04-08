import React from 'react';
import './../App.css';

interface Position {
    symbol: string;
    quantity: number;
    avgBuyPrice: number;
}

interface PositionsProps {
    positions: Position[];
}

const Positions: React.FC<PositionsProps> = ({ positions }) => {
    if (!positions || positions.length === 0) {
        return <p className="positions-empty">Žádné pozice nejsou k dispozici.</p>;
    }

    return (
        <div className="positions-container">
            <h2>Pozice</h2>
            <table className="positions-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Množství</th>
                        <th>Průměrná nákupní cena</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map((position, index) => (
                        <tr key={index}>
                            <td>{position.symbol}</td>
                            <td>{position.quantity}</td>
                            <td>${position.avgBuyPrice.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Positions;