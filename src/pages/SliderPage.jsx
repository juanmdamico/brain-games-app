import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, ArrowRight } from 'lucide-react';

const SIZE = 4; // 4x4 Grid

const SliderPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [board, setBoard] = useState([]);
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);

    // Initialize board
    useEffect(() => {
        initBoard();
    }, []);

    // Timer logic
    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const initBoard = () => {
        let initialArray = Array.from({ length: SIZE * SIZE - 1 }, (_, i) => i + 1);
        initialArray.push(null); // The empty cell

        // Shuffle board until solvable
        let shuffled = shuffle(initialArray);
        while (!isSolvable(shuffled)) {
            shuffled = shuffle(initialArray);
        }

        setBoard(shuffled);
        setMoves(0);
        setStartTime(Date.now());
        setTimeElapsed(0);
        setWinner(false);
        setShowVictory(false);
    };

    const shuffle = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Solvability check for 15-puzzle
    const isSolvable = (arr) => {
        let inversions = 0;
        const cleanArr = arr.filter(x => x !== null);
        for (let i = 0; i < cleanArr.length; i++) {
            for (let j = i + 1; j < cleanArr.length; j++) {
                if (cleanArr[i] > cleanArr[j]) {
                    inversions++;
                }
            }
        }
        
        // Find empty cell row index from bottom
        const emptyIndex = arr.indexOf(null);
        const emptyRowFromBottom = SIZE - Math.floor(emptyIndex / SIZE);

        if (SIZE % 2 !== 0) {
            return inversions % 2 === 0;
        } else {
            if (emptyRowFromBottom % 2 === 0) {
                return inversions % 2 !== 0;
            } else {
                return inversions % 2 === 0;
            }
        }
    };

    const moveTile = (index) => {
        if (winner) return;

        const emptyIndex = board.indexOf(null);
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const emptyRow = Math.floor(emptyIndex / SIZE);
        const emptyCol = emptyIndex % SIZE;

        // Check if clicked cell is adjacent to empty cell
        const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;

        if (isAdjacent) {
            playClick();
            const newBoard = [...board];
            [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
            setBoard(newBoard);
            setMoves(prev => prev + 1);

            // Check win
            if (checkWin(newBoard)) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('deslizante', 'medium', timeElapsed, moves + 1);
                setShowVictory(true);
            }
        } else {
            playErrorSfx();
        }
    };

    const checkWin = (arr) => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== i + 1) return false;
        }
        return arr[arr.length - 1] === null;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '460px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Movimientos: <span style={{ color: 'var(--text-main)' }}>{moves}</span>
                </div>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1rem' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={initBoard} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Sliding Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
                gap: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '12px',
                aspectRatio: '1',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
            }}>
                {board.map((tile, idx) => {
                    const isEmpty = tile === null;
                    const isCorrect = tile === idx + 1;

                    return (
                        <button
                            key={idx}
                            onClick={() => moveTile(idx)}
                            disabled={isEmpty || winner}
                            style={{
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.4rem',
                                fontWeight: 'bold',
                                color: isCorrect ? '#fff' : 'var(--text-main)',
                                backgroundColor: isEmpty 
                                    ? 'transparent' 
                                    : isCorrect 
                                        ? 'rgba(16, 185, 129, 0.25)' // Bright green translucent
                                        : 'rgba(255, 255, 255, 0.04)',
                                border: isEmpty 
                                    ? 'none' 
                                    : isCorrect 
                                        ? '1px solid rgba(16, 185, 129, 0.4)' 
                                        : '1px solid var(--border)',
                                cursor: isEmpty || winner ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isEmpty ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseOver={(e) => {
                                if (!isEmpty && !winner) {
                                    e.currentTarget.style.backgroundColor = isCorrect ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isEmpty) {
                                    e.currentTarget.style.backgroundColor = isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)';
                                }
                            }}
                        >
                            {!isEmpty && tile}
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en las baldosas adyacentes al espacio vacío para deslizarlas. Ordénalas del 1 al 15.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Rompecabezas Resuelto!"
                message={`Has ordenado el tablero en ${moves} movimientos.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initBoard}
            />
        </div>
    );
};

export default SliderPage;
