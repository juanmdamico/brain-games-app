import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, Zap, RotateCcw, AlertTriangle } from 'lucide-react';

const TOTAL_ROUNDS = 5;

const ReactionPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    
    // States: 'idle', 'waiting', 'clickable', 'result', 'completed'
    const [gameState, setGameState] = useState('idle');
    const [round, setRound] = useState(0);
    const [times, setTimes] = useState([]);
    const [currentReactionTime, setCurrentReactionTime] = useState(null);
    const [showVictory, setShowVictory] = useState(false);
    const [averageTime, setAverageTime] = useState(null);

    const timerRef = useRef(null);
    const greenTimeRef = useRef(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const resetGame = () => {
        playClick();
        if (timerRef.current) clearTimeout(timerRef.current);
        setGameState('idle');
        setRound(0);
        setTimes([]);
        setCurrentReactionTime(null);
        setAverageTime(null);
        setShowVictory(false);
    };

    const handleScreenClick = () => {
        if (gameState === 'idle') {
            playClick();
            startRound(0);
        } 
        else if (gameState === 'waiting') {
            // Foul! Clicked too early
            playErrorSfx();
            if (timerRef.current) clearTimeout(timerRef.current);
            setGameState('result');
            setCurrentReactionTime('foul');
        } 
        else if (gameState === 'clickable') {
            // Success! Measure reaction time
            const reaction = Date.now() - greenTimeRef.current;
            playSuccessSfx();
            setCurrentReactionTime(reaction);
            
            const newTimes = [...times, reaction];
            setTimes(newTimes);

            const nextRound = round + 1;
            setRound(nextRound);

            if (nextRound >= TOTAL_ROUNDS) {
                // Game over
                const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / TOTAL_ROUNDS);
                setAverageTime(avg);
                setGameState('completed');
                handleGameEnd(avg);
            } else {
                setGameState('result');
            }
        } 
        else if (gameState === 'result') {
            playClick();
            startRound(round);
        }
    };

    const startRound = (roundIndex) => {
        setGameState('waiting');
        setCurrentReactionTime(null);
        
        // Random wait between 1.5s and 4.5s
        const randomWait = Math.random() * 3000 + 1500;
        
        timerRef.current = setTimeout(() => {
            setGameState('clickable');
            greenTimeRef.current = Date.now();
        }, randomWait);
    };

    const handleGameEnd = (avg) => {
        playVictorySfx();
        // Register completion with average time in milliseconds
        registerGameCompletion('reflejos', 'medium', avg);
        setShowVictory(true);
    };

    const calculateBrainAge = (ms) => {
        if (!ms) return '-';
        if (ms < 190) return '18 años (Reflejos de Élite)';
        if (ms < 220) return '23 años';
        if (ms < 250) return '28 años';
        if (ms < 280) return '35 años';
        if (ms < 320) return '42 años';
        if (ms < 380) return '50 años';
        return '60+ años';
    };

    // Color definitions based on state
    const getScreenStyles = () => {
        if (gameState === 'idle') {
            return {
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Translucent primary color
                border: '2px dashed var(--primary)',
                cursor: 'pointer'
            };
        }
        if (gameState === 'waiting') {
            return {
                backgroundColor: 'rgba(239, 68, 68, 0.15)', // Neon red wait
                border: '2px solid #ef4444',
                cursor: 'pointer'
            };
        }
        if (gameState === 'clickable') {
            return {
                backgroundColor: '#10b981', // Solid bright green
                border: '2px solid #059669',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                color: 'white',
                cursor: 'pointer'
            };
        }
        if (gameState === 'result') {
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '2px solid var(--border)',
                cursor: 'pointer'
            };
        }
        return {
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '2px solid var(--border)'
        };
    };

    return (
        <div style={{
            maxWidth: '620px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Zap Test de Reflejos
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                    Intento {Math.min(TOTAL_ROUNDS, times.length + 1)} / {TOTAL_ROUNDS}
                </span>
                <button onClick={resetGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Reaction Click Area */}
            <div 
                onClick={gameState !== 'completed' ? handleScreenClick : undefined}
                style={{
                    width: '100%',
                    height: '280px',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: '20px',
                    padding: '20px',
                    ...getScreenStyles()
                }}
            >
                {gameState === 'idle' && (
                    <>
                        <Zap size={60} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite', marginBottom: '12px' }} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 6px 0', color: 'var(--text-main)' }}>¿Qué tan rápidos son tus reflejos?</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Haz clic en cualquier parte de este recuadro para empezar.</p>
                    </>
                )}

                {gameState === 'waiting' && (
                    <>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fca5a5', margin: 0 }}>ESPERA...</h2>
                        <p style={{ color: '#fca5a5', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Haz clic en cuanto cambie a color verde.</p>
                    </>
                )}

                {gameState === 'clickable' && (
                    <>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)', margin: 0 }}>¡PULSA YA!</h2>
                    </>
                )}

                {gameState === 'result' && (
                    <>
                        {currentReactionTime === 'foul' ? (
                            <>
                                <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '10px' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>¡Fallo de Salida!</h2>
                                <p style={{ color: 'var(--text-muted)', margin: '6px 0 0 0', fontSize: '0.9rem' }}>Pulsaste antes de tiempo. Haz clic para reintentar.</p>
                            </>
                        ) : (
                            <>
                                <Zap size={48} color="#10b981" style={{ marginBottom: '10px' }} />
                                <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, fontFamily: 'monospace' }}>
                                    {currentReactionTime} ms
                                </h2>
                                <p style={{ color: 'var(--text-muted)', margin: '6px 0 0 0', fontSize: '0.9rem' }}>Haz clic en el recuadro para el siguiente intento.</p>
                            </>
                        )}
                    </>
                )}

                {gameState === 'completed' && (
                    <>
                        <Zap size={60} color="#fbbf24" style={{ marginBottom: '12px' }} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 6px 0', color: 'var(--text-main)' }}>Test Completado</h2>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', margin: '4px 0', fontFamily: 'monospace' }}>
                            {averageTime} ms
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            Edad cerebral: <span style={{ color: 'var(--primary)' }}>{calculateBrainAge(averageTime)}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Previous Times History list */}
            {times.length > 0 && (
                <div style={{ textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '16px', padding: '15px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Historial de Intentos
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {times.map((t, idx) => (
                            <div 
                                key={idx} 
                                style={{ 
                                    padding: '6px 12px', borderRadius: '8px', 
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace'
                                }}
                            >
                                #{idx + 1}: <strong style={{ color: '#10b981' }}>{t} ms</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Pulsar antes de que cambie a verde invalidará la ronda actual. El promedio se calcula sobre 5 intentos válidos.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Test Completado!"
                message={`Tu promedio de reacción fue de ${averageTime} ms. Edad cerebral estimada: ${calculateBrainAge(averageTime)}.`}
                timeElapsed={Math.round(averageTime)} // Pass milliseconds score as value
                onPlayAgain={resetGame}
            />

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.08); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default ReactionPage;
