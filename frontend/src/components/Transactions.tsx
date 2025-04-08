import React from 'react';
import './../App.css';

interface Transaction {
    id: number;
    action: string;
    symbol: string;
    quantity: number;
    price: number;
    timestamp: string;
    reason: string;
}

interface TransactionsProps {
    transactions: Transaction[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <p className="transactions-empty">Žádné poslední transakce nenalezeny.</p>;
    }

    return (
        <div className="transactions-container">
            <h2>Poslední transakce</h2>
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Akce</th>
                        <th>Symbol</th>
                        <th>Množství</th>
                        <th>Cena</th>
                        <th>Čas</th>
                        <th>Důvod</th>
                        <th>Celkem</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr 
                            key={transaction.id} 
                            className={transaction.action === 'BUY' ? 'transaction-buy' : 'transaction-sell'}
                        >
                            <td>{transaction.action === 'BUY' ? 'Koupit' : 'Prodat'}</td>
                            <td>{transaction.symbol}</td>
                            <td>{transaction.quantity}</td>
                            <td>${transaction.price.toFixed(2)}</td>
                            <td>{new Date(transaction.timestamp).toLocaleString('cs-CZ')}</td>
                            <td>{transaction.reason}</td>
                            <td>${(transaction.quantity * transaction.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Transactions;