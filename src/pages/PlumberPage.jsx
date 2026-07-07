import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 4;

const PlumberPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    
    // Grid values: Array of { type: 'I'|'L', rotation: 0|1|2|3 }
    const [grid, setGrid] = useState([]);
    const [wetCells, setWetCells] = useState(new Set()); // cells filled with water
    const [winner, setWinner] = useState(false);
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

    const initGame = () => {
        // Initial scrambled pipes configuration
        const initial = [
            { type: 'L', rotation: 1 }, { type: 'I', rotation: 0 }, { type: 'L', rotation: 2 }, { type: 'L', rotation: 0 },
            { type: 'I', rotation: 1 }, { type: 'L', rotation: 3 }, { type: 'I', rotation: 0 }, { type: 'I', rotation: 1 },
            { type: 'L', rotation: 0 }, { type: 'I', rotation: 1 }, { type: 'L', rotation: 1 }, { type: 'L', rotation: 2 },
            { type: 'I', rotation: 0 }, { type: 'L', rotation: 2 }, { type: 'I', rotation: 1 }, { type: 'L', rotation: 3 }
        ];

        const nextGrid = [];
        for (let r = 0; r < SIZE; r++) {
            const row = [];
            for (let c = 0; c < SIZE; c++) {
                row.push(initial[r * SIZE + c]);
            }
            nextGrid.push(row);
        }

        setGrid(nextGrid);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
        calculateWaterFlow(nextGrid);
    };

    const handlePipeClick = (r, c) => {
        if (winner) return;
        playClick();

        const nextGrid = grid.map((row, rIdx) => 
            rIdx === r ? row.map((pipe, cIdx) => cIdx === c ? { ...pipe, rotation: (pipe.rotation + 1) % 4 } : pipe) : row
        );

        setGrid(nextGrid);
        calculateWaterFlow(nextGrid);
    };

    // Calculate which directions a pipe connects to
    const getPipeConnections = (pipe) => {
        const { type, rotation } = pipe;
        if (type === 'I') {
            // rotation 0/2 = Up, Down. 1/3 = Left, Right
            if (rotation % 2 === 0) return { U: true, D: true, L: false, R: false };
            return { U: false, D: false, L: true, R: true };
        } else if (type === 'L') {
            // Corner connections clockwise
            if (rotation === 0) return { U: true, R: true, D: false, L: false };
            if (rotation === 1) return { R: true, D: true, U: false, L: false };
            if (rotation === 2) return { D: true, L: true, U: false, R: false };
            if (rotation === 3) return { L: true, U: true, R: false, D: false };
        }
        return { U: false, D: false, L: false, R: false };
    };

    const calculateWaterFlow = (currentGrid) => {
        const wet = new Set();
        const queue = [{ r: 0, c: 0 }];
        wet.add('0-0');

        while (queue.length > 0) {
            const curr = queue.shift();
            const currPipe = currentGrid[curr.r][curr.c];
            const currConns = getPipeConnections(currPipe);

            // Neighbors
            const adjs = [
                { dir: 'U', r: curr.r - 1, c: curr.c, opp: 'D' },
                { dir: 'D', r: curr.r + 1, c: curr.c, opp: 'U' },
                { dir: 'L', r: curr.r, c: curr.c - 1, opp: 'R' },
                { dir: 'R', r: curr.r, c: curr.c + 1, opp: 'L' }
            ];

            adjs.forEach(adj => {
                const key = `${adj.r}-${adj.c}`;
                if (adj.r >= 0 && adj.r < SIZE && adj.c >= 0 && adj.c < SIZE && !wet.has(key)) {
                    // Check alignment: current pipe connects to neighbor, and neighbor connects back
                    const neighborConns = getPipeConnections(currentGrid[adj.r][adj.c]);
                    if (currConns[adj.dir] && neighborConns[adj.opp]) {
                        wet.add(key);
                        queue.push({ r: adj.r, c: adj.c });
                    }
                }
            });
        }

        setWetCells(wet);

        // Win if bottom-right (3, 3) is wet
        if (wet.has('3-3')) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('plumber', 'medium', timeElapsed);
            setShowVictory(true);
        }
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
                    Tuberías (Plumber)
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

            {/* Board */}
            <div style={{
                position: 'relative',
                display: 'inline-block',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {/* Water inflow/outflow tags */}
                <div style={{ position: 'absolute', left: '-20px', top: '30px', fontSize: '0.9rem' }}>💧</div>
                <div style={{ position: 'absolute', right: '-20px', bottom: '30px', fontSize: '0.9rem' }}>🏁</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {grid.map((row, r) => (
                        row.map((pipe, c) => {
                            const key = `${r}-${c}`;
                            const isWet = wetCells.has(key);
                            const rotationAngle = pipe.rotation * 90;
                            const pipeColor = isWet ? '#06b6d4' : '#64748b'; // Cyan water, Slate grey dry

                            return (
                                <button
                                    key={c}
                                    onClick={() => handlePipeClick(r, c)}
                                    style={{
                                        width: '56px', height: '56px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        cursor: winner ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: 0, overflow: 'hidden', outline: 'none'
                                    }}
                                >
                                    {/* SVG drawing of the pipe */}
                                    <svg
                                        viewBox="0 0 100 100"
                                        style={{
                                            width: '100%', height: '100%',
                                            transform: `rotate(${rotationAngle}deg)`,
                                            transition: 'transform 0.2s ease',
                                            filter: isWet ? 'drop-shadow(0 0 4px #06b6d4)' : 'none'
                                        }}
                                    >
                                        {pipe.type === 'I' ? (
                                            // Straight line
                                            <line x1="50" y1="0" x2="50" y2="100" stroke={pipeColor} strokeWidth="18" strokeLinecap="square" />
                                        ) : (
                                            // L-shape Corner
                                            <path d="M 50,0 Q 50,50 100,50" fill="none" stroke={pipeColor} strokeWidth="18" />
                                        )}
                                    </svg>
                                </button>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en los tubos para rotarlos 90° e interconectar el agua desde la entrada (arriba a la izquierda) hasta la salida (abajo a la derecha). Los tubos conectados brillan con agua fluyendo en celeste.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Flujo Completado!"
                message="El agua fluye libremente a través del conducto que has conectado."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default PlumberPage;
