import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 6;
const MINE_COUNT = 8;

const MinesweeperDuelPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    
    // Grid values: null (unrevealed), 'M' (Mine), Number (Adjacent mines count)
    const [mineGrid, setMineGrid] = useState([]);
    const [revealed, setRevealed] = useState([]); // Array of arrays of bool
    
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [turn, setTurn] = useState('player'); // 'player', 'ai'
    const [winner, setWinner] = useState(null); // 'player', 'ai', 'tie'
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

    const initGame = () => {
        // 1. Generate empty grid
        const grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        const tempRevealed = Array(SIZE).fill(null).map(() => Array(SIZE).fill(false));

        // 2. Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < MINE_COUNT) {
            const r = Math.floor(Math.random() * SIZE);
            const c = Math.floor(Math.random() * SIZE);
            if (grid[r][c] !== 'M') {
                grid[r][c] = 'M';
                minesPlaced++;
            }
        }

        // 3. Calculate adjacent counts
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 'M') continue;
                let count = 0;
                const adjs = [
                    [-1,-1], [-1,0], [-1,1],
                    [0,-1],          [0,1],
                    [1,-1],  [1,0],  [1,1]
                ];
                adjs.forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid[nr][nc] === 'M') {
                        count++;
                    }
                });
                grid[r][c] = count;
            }
        }

        setMineGrid(grid);
        setRevealed(tempRevealed);
        setPlayerScore(0);
        setAiScore(0);
        setTurn('player');
        setWinner(null);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleCellClick = (r, c) => {
        if (winner || turn !== 'player' || revealed[r][c]) return;
        executeReveal(r, c, 'player');
    };

    const executeReveal = (r, c, actor) => {
        const newRevealed = revealed.map(row => [...row]);
        newRevealed[r][c] = true;
        setRevealed(newRevealed);

        const target = mineGrid[r][c];

        if (target === 'M') {
            // Found a mine! Award point and keep turn
            playSuccessSfx();
            if (actor === 'player') {
                const nextScore = playerScore + 1;
                setPlayerScore(nextScore);
                if (nextScore >= 5) {
                    // Win (majority of 8 mines)
                    setWinner('player');
                    playVictorySfx();
                    registerGameCompletion('buscaminas_duel', 'medium', timeElapsed, nextScore);
                    setShowVictory(true);
                    return;
                }
                // Keep turn
                setTurn('player');
            } else {
                const nextScore = aiScore + 1;
                setAiScore(nextScore);
                if (nextScore >= 5) {
                    setWinner('ai');
                    playErrorSfx();
                    return;
                }
                setTurn('ai');
            }
        } else {
            // Normal number: pass turn
            playClick();
            
            // Check if all cells revealed
            if (checkDraw(newRevealed)) {
                evaluateFinalWinner(playerScore, aiScore);
                return;
            }

            setTurn(actor === 'player' ? 'ai' : 'player');
        }
    };

    const checkDraw = (currentRevealed) => {
        // If all cells revealed or all mines found
        let unrevealedCount = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!currentRevealed[r][c]) unrevealedCount++;
            }
        }
        return unrevealedCount === 0;
    };

    const evaluateFinalWinner = (p, a) => {
        if (p > a) {
            setWinner('player');
            playVictorySfx();
            registerGameCompletion('buscaminas_duel', 'medium', timeElapsed, p);
            setShowVictory(true);
        } else if (a > p) {
            setWinner('ai');
            playErrorSfx();
        } else {
            setWinner('tie');
            playSuccessSfx();
        }
    };

    const runAIShot = () => {
        // Smart AI: find unrevealed cells adjacent to numbers
        const candidates = [];
        const fallbacks = [];

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (!revealed[r][c]) {
                    fallbacks.push({ r, c });

                    // Check if adjacent to any revealed number
                    let adjToNumber = false;
                    const adjs = [
                        [-1,-1], [-1,0], [-1,1],
                        [0,-1],          [0,1],
                        [1,-1],  [1,0],  [1,1]
                    ];
                    for (let [dr, dc] of adjs) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && revealed[nr][nc] && mineGrid[nr][nc] !== 'M') {
                            adjToNumber = true;
                            break;
                        }
                    }

                    if (adjToNumber) {
                        candidates.push({ r, c });
                    }
                }
            }
        }

        if (fallbacks.length === 0) return;

        // Choose from candidates if any, else fallback
        const select = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * candidates.length)] 
            : fallbacks[Math.floor(Math.random() * fallbacks.length)];

        executeReveal(select.r, select.c, 'ai');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '480px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Duelo de Buscaminas
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

            {/* Scoreboard HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
                <span style={{ color: 'var(--primary)' }}>Tus Minas: <strong>{playerScore}</strong></span>
                <div style={{ fontSize: '0.85rem', color: turn === 'player' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                    {turn === 'player' ? '🟢 Tu Turno' : '⚙️ Turno IA...'}
                </div>
                <span>IA Minas: <strong>{aiScore}</strong></span>
            </div>

            {/* Board */}
            <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {mineGrid.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {row.map((cell, c) => {
                            const rev = revealed[r]?.[c];
                            const isMine = cell === 'M';

                            let bg = 'rgba(255, 255, 255, 0.02)';
                            let border = '1px solid rgba(255, 255, 255, 0.03)';
                            let content = '';

                            if (rev) {
                                if (isMine) {
                                    bg = 'rgba(239, 68, 68, 0.25)';
                                    border = '1px solid #ef4444';
                                    content = '💣';
                                } else {
                                    bg = 'rgba(255, 255, 255, 0.06)';
                                    border = '1px solid rgba(255, 255, 255, 0.1)';
                                    content = cell > 0 ? cell : '';
                                }
                            }

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    disabled={rev || winner || turn !== 'player'}
                                    style={{
                                        width: '46px', height: '46px', margin: '2px',
                                        backgroundColor: bg, border,
                                        borderRadius: '8px',
                                        cursor: (rev || winner || turn !== 'player') ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 'bold', color: 'white',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => !rev && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                                    onMouseOut={e => !rev && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                                >
                                    {content}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Toma turnos revelando casillas en el campo de minas. Encontrar una mina 💣 te otorga 1 punto y mantienes tu turno. Revelar un número normal pasa el turno al rival. El primer jugador en encontrar 5 minas gana el duelo.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Duelo de Minas Ganado!"
                message={`Has vencido a la Inteligencia Artificial encontrando ${playerScore} minas en el tablero.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default MinesweeperDuelPage;
