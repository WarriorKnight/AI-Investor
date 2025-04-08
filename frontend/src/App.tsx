import { useEffect, useState } from 'react';
import axios from 'axios';
import InfoTab from './components/InfoTab';
import Stats from './components/Stats';
import Portfolio from './components/Portfolio';
import Positions from './components/Positions';
import Transactions from './components/Transactions';
import './App.css';

function App() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('/api/portfolio');
                setData(response.data);
            } catch (err) {
                setError('Nepodařilo se načíst data portfolia');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div>Načítání...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <InfoTab />
            <h1>AI Investor</h1>
            <Stats portfolio={data.portfolio} />
            <Positions positions={data.positions} />
            <Portfolio portfolio={data.portfolio} />
            <Transactions transactions={data.transactions} />
        </div>
    );
}

export default App;