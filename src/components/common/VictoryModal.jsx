import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, X, Award, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const gameNameToId = (name) => {
    const map = {
        'Sudoku': 'sudoku',
        'Buscaminas': 'buscaminas',
        '2048': '2048',
        'Nonogramas': 'nonogramas',
        'Kakuro': 'kakuro',
        'KenKen': 'kenken',
        'Hitori': 'hitori',
        'Slitherlink': 'slitherlink',
        'Wordle': 'wordle',
        'Memory Match': 'memorymatch',
        'Snake': 'snake',
        'Tres en línea': 'tictactoe',
        'Simon Says': 'simonsays'
    };
    return map[name] || name.toLowerCase();
};

const VictoryModal = ({ isOpen, onClose, time, gameName, difficulty = 'medium', extraScore = 0 }) => {
    const { playVictorySfx, registerGameCompletion, records } = useApp();
    const [leaderboard, setLeaderboard] = useState([]);
    const [personalBest, setPersonalBest] = useState(null);

    const gameId = gameNameToId(gameName);

    useEffect(() => {
        if (isOpen) {
            // 1. Play synthesized victory music
            playVictorySfx();

            // 2. Register completion in context (this updates streaks, achievements, local records)
            registerGameCompletion(gameId, difficulty, time, extraScore);

            // 3. Setup simulated leaderboard
            const key = `${gameId}_${difficulty}`;
            const localBestTimes = records[key] || [];
            const currentBest = localBestTimes[0] || time;
            setPersonalBest(currentBest);

            // Generate virtual rivals
            // To make it look real, we generate times centered around typical speeds
            const baseTimes = {
                sudoku: { easy: 120, medium: 240, hard: 480 },
                buscaminas: { beginner: 45, intermediate: 180, expert: 400 },
                wordle: { medium: 90 },
                nonogramas: { easy: 60, medium: 180, hard: 300 },
                kakuro: { easy: 150, medium: 300, hard: 600 },
                kenken: { easy: 100, medium: 200, hard: 400 },
                hitori: { easy: 80, medium: 160, hard: 320 },
                slitherlink: { easy: 180, medium: 360, hard: 720 },
                'memory match': { easy: 40, medium: 70, hard: 120 },
                tictactoe: { medium: 15 },
                'simon says': { medium: 30 }
            };

            const gameBase = baseTimes[gameId]?.[difficulty] || 120;
            const rivals = [
                { name: 'Einstein99', time: Math.round(gameBase * 0.5) },
                { name: 'MenteMaestra', time: Math.round(gameBase * 0.75) },
                { name: 'ReactCoder', time: Math.round(gameBase * 1.25) },
                { name: 'PixelPlayer', time: Math.round(gameBase * 1.5) }
            ];

            // Add player
            rivals.push({ name: 'Tú (Actual)', time: time, isPlayer: true });
            
            // Sort leaderboard
            rivals.sort((a, b) => a.time - b.time);
            setLeaderboard(rivals);

            // 4. Confetti Blast!
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#60a5fa', '#a78bfa', '#34d399']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#60a5fa', '#a78bfa', '#34d399']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen, gameId, difficulty, time, extraScore]);

    if (!isOpen) return null;

    const playerRank = leaderboard.findIndex(r => r.isPlayer) + 1;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="modal-container" style={{
                backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.95))',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '24px',
                padding: '30px 24px',
                maxWidth: '460px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
                position: 'relative',
                textAlign: 'center',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ 
                        backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                        padding: '16px', borderRadius: '50%',
                        border: '2px solid rgba(16, 185, 129, 0.3)'
                    }}>
                        <Trophy size={40} color="#34d399" />
                    </div>
                </div>

                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                    ¡Victoria!
                </h2>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '20px' }}>
                    Has resuelto el juego <strong>{gameName}</strong> ({difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'})
                </p>

                {/* Score / Time box */}
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: personalBest && personalBest !== time ? '1fr 1fr' : '1fr',
                    gap: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
                    padding: '16px', 
                    borderRadius: '16px',
                    border: '1px solid var(--border)', 
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Clock size={20} color="#60a5fa" />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Tiempo</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                {formatTime(time)}
                            </div>
                        </div>
                    </div>

                    {personalBest && personalBest !== time && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '12px' }}>
                            <Award size={20} color="#fbbf24" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Record Personal</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                                    {formatTime(personalBest)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Leaderboard simulation */}
                <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '8px' }}>
                        <Users size={16} />
                        <span>Tabla de Posiciones Virtual:</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '10px 14px' }}>
                        {leaderboard.map((rival, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    fontSize: '0.85rem', 
                                    padding: '4px 0',
                                    borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                    color: rival.isPlayer ? '#34d399' : 'var(--text-main)',
                                    fontWeight: rival.isPlayer ? 'bold' : 'normal'
                                }}
                            >
                                <span>{index + 1}. {rival.name}</span>
                                <span style={{ fontFamily: 'monospace' }}>{formatTime(rival.time)}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                        🏆 ¡Quedaste en la posición #{playerRank} de la tabla virtual!
                    </p>
                </div>

                <button 
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#10b981', color: 'white',
                        border: 'none', borderRadius: '12px',
                        fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 8px 15px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                    Continuar
                </button>
            </div>
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default VictoryModal;
