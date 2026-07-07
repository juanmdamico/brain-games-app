import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 6;
const TOTAL_HIT_TARGET = 7; // sum of ship sizes: 3 + 2 + 2

const BattleshipPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    
    // Player grid cells: null (empty), 'S' (Ship), 'H' (Hit), 'M' (Miss)
    const [playerGrid, setPlayerGrid] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    // AI grid cells: null (empty), 'S' (Ship - hidden), 'H' (Hit), 'M' (Miss)
    const [aiGrid, setAiGrid] = useState(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    
    const [turn, setTurn] = useState('player'); // 'player', 'ai'
    const [winner, setWinner] = useState(null); // 'player', 'ai'
    const [statusMessage, setStatusMessage] = useState('Haz clic en el radar enemigo para disparar');
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    useEffect(() => {
        if (turn === 'ai' && !winner) {
            setTimeout(runAIShot, 1000);
        }
    }, [turn]);

    const generateRandomShips = () => {
        const grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        const shipSizes = [3, 2, 2];

        shipSizes.forEach(size => {
            let placed = false;
            while (!placed) {
                const isHorizontal = Math.random() > 0.5;
                const r = Math.floor(Math.random() * (isHorizontal ? SIZE : SIZE - size + 1));
                const c = Math.floor(Math.random() * (isHorizontal ? SIZE - size + 1 : SIZE));

                // Check overlap
                let overlap = false;
                for (let i = 0; i < size; i++) {
                    const checkR = r + (isHorizontal ? 0 : i);
                    const checkC = c + (isHorizontal ? i : 0);
                    if (grid[checkR][checkC] !== null) {
                        overlap = true;
                        break;
                    }
                }

                if (!overlap) {
                    for (let i = 0; i < size; i++) {
                        const targetR = r + (isHorizontal ? 0 : i);
                        const targetC = c + (isHorizontal ? i : 0);
                        grid[targetR][targetC] = 'S';
                    }
                    placed = true;
                }
            }
        });
        return grid;
    };

    const initGame = () => {
        setPlayerGrid(generateRandomShips());
        setAiGrid(generateRandomShips());
        setTurn('player');
        setWinner(null);
        setStatusMessage('Haz clic en el radar enemigo para disparar');
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleRadarClick = (r, c) => {
        if (winner || turn !== 'player' || aiGrid[r][c] === 'H' || aiGrid[r][c] === 'M') return;

        const newAiGrid = aiGrid.map(row => [...row]);
        const target = aiGrid[r][c];

        if (target === 'S') {
            newAiGrid[r][c] = 'H'; // Hit
            playSuccessSfx();
            setStatusMessage('¡Impacto! Has golpeado un barco enemigo.');
        } else {
            newAiGrid[r][c] = 'M'; // Miss
            playClick();
            setStatusMessage('Agua. Disparo fallido.');
        }

        setAiGrid(newAiGrid);

        // Check if player won
        if (countHits(newAiGrid) === TOTAL_HIT_TARGET) {
            setWinner('player');
            playVictorySfx();
            registerGameCompletion('battleship', 'medium', timeElapsed);
            setShowVictory(true);
            return;
        }

        setTurn('ai');
    };

    const runAIShot = () => {
        // AI targets: find random unshot cells
        const targets = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (playerGrid[r][c] !== 'H' && playerGrid[r][c] !== 'M') {
                    targets.push({ r, c });
                }
            }
        }

        if (targets.length === 0) return;

        // Shoot random target
        const select = targets[Math.floor(Math.random() * targets.length)];
        const newPlayerGrid = playerGrid.map(row => [...row]);
        const target = playerGrid[select.r][select.c];

        if (target === 'S') {
            newPlayerGrid[select.r][select.c] = 'H';
            playErrorSfx();
            setStatusMessage(`La IA disparó en (${select.r + 1}, ${select.c + 1}): ¡Impacto!`);
        } else {
            newPlayerGrid[select.r][select.c] = 'M';
            playClick();
            setStatusMessage(`La IA disparó en (${select.r + 1}, ${select.c + 1}): Agua.`);
        }

        setPlayerGrid(newPlayerGrid);

        // Check if AI won
        if (countHits(newPlayerGrid) === TOTAL_HIT_TARGET) {
            setWinner('ai');
            setStatusMessage('La IA ha hundido tu flota. ¡Inténtalo de nuevo!');
            playErrorSfx();
            return;
        }

        setTurn('player');
    };

    const countHits = (grid) => {
        let count = 0;
        grid.forEach(row => {
            row.forEach(cell => {
                if (cell === 'H') count++;
            });
        });
        return count;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '560px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Batalla Naval (Battleship)
                </span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={initGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Status Message Banner */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px',
                padding: '10px 14px', fontSize: '0.9rem', fontWeight: 'bold', color: 'white',
                marginBottom: '20px'
            }}>
                {statusMessage}
            </div>

            {/* Two grids columns */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {/* Player Grid */}
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>
                        TU FLOTA
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px' }}>
                        {playerGrid.map((row, r) => (
                            row.map((cell, c) => {
                                let bg = 'rgba(255,255,255,0.01)';
                                let border = '1px solid rgba(255,255,255,0.02)';
                                let content = '';

                                if (cell === 'S') bg = 'rgba(59, 130, 246, 0.3)'; // player ship
                                else if (cell === 'H') { bg = 'rgba(239, 68, 68, 0.2)'; content = '💥'; }
                                else if (cell === 'M') { bg = 'rgba(59, 130, 246, 0.1)'; content = '💧'; }

                                return (
                                    <div key={`${r}-${c}`} style={{
                                        width: '32px', height: '32px', backgroundColor: bg, border,
                                        borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                                    }}>
                                        {content}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Radar Grid (AI) */}
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '6px' }}>
                        RADAR ENEMIGO
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px' }}>
                        {aiGrid.map((row, r) => (
                            row.map((cell, c) => {
                                let bg = 'rgba(255,255,255,0.02)';
                                let border = '1px solid rgba(255,255,255,0.03)';
                                let content = '';

                                if (cell === 'H') { bg = 'rgba(239, 68, 68, 0.25)'; content = '💥'; }
                                else if (cell === 'M') { bg = 'rgba(59, 130, 246, 0.15)'; content = '💧'; }

                                return (
                                    <button
                                        key={`${r}-${c}`}
                                        onClick={() => handleRadarClick(r, c)}
                                        disabled={cell === 'H' || cell === 'M' || winner || turn !== 'player'}
                                        style={{
                                            width: '32px', height: '32px', backgroundColor: bg, border,
                                            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.9rem', cursor: (cell === 'H' || cell === 'M' || winner || turn !== 'player') ? 'default' : 'pointer'
                                        }}
                                        onMouseOver={e => !cell && (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)')}
                                        onMouseOut={e => !cell && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                                    >
                                        {content}
                                    </button>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Toma turnos disparando al radar de la IA para encontrar y hundir su flota oculta. Tu flota se muestra a la izquierda en azul. El primer almirante en lograr impactar 7 veces los barcos del rival gana.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Flota Enemiga Hundida!"
                message="Has triunfado en la batalla naval destruyendo todos los navíos enemigos."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default BattleshipPage;
