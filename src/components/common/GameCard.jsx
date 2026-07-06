import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ to, icon, title, description, isActive = true }) => {
    if (!isActive) {
        return (
            <div className="game-card" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.5))', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '30px 25px', opacity: 0.6 }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '20px', filter: 'grayscale(100%)' }}>{icon}</div>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>{title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '25px' }}>{description}</p>
                </div>
                <div style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginTop: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                    Próximamente
                </div>
            </div>
        );
    }

    return (
        <Link to={to} className="game-card active" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '20px', padding: '30px 25px', textDecoration: 'none', color: 'var(--text-main)', transition: 'all 0.3s' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{icon}</div>
            <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '10px' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '25px' }}>{description}</p>
            </div>
            <div style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginTop: 'auto', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Jugar ahora
            </div>
        </Link>
    );
};

export default GameCard;
