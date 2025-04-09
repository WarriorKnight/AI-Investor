import React from 'react';
import './../App.css';

const InfoTab: React.FC = () => {
    return (
        <div className="info-tab">
            <p>
                <strong>AI Investor</strong> je projekt, který simuluje základní podmínky trhu pro 
                umělou inteligenci. Ta má přístup ke zprávám o firmách, o které se zajímá, a na základě těchto zpráv 
                a změn cen akcií provádí nákupy a prodeje.
            </p>
            <p>
                Projekt je dostupný na {" "}
                <a href="https://github.com/WarriorKnight/AI-Investor" target="_blank" rel="noopener noreferrer">
                GitHubu
                </a>
            </p>
        </div>
    );
};

export default InfoTab;