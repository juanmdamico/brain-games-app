import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const GRID_SIZE = 10;
const WORDS_POOL = ['CEREBRO', 'LOGICA', 'MEMORIA', 'INGENIO', 'PIENSA', 'SUDOKU', 'MINAS', 'SNAKE', 'JUEGOS', 'MENTAL'];

const WordSearchPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [grid, setGrid] = useState([]);
    const [words, setWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]); // Array of [r, c]
    const [startCell, setStartCell] = useState(null); // {r, c}
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
        // Select 5 random words
        const shuffledWords = [...WORDS_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);
        setWords(shuffledWords);
        setFoundWords([]);
        setSelectedCells([]);
        setStartCell(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);

        generateGrid(shuffledWords);
    };

    const generateGrid = (wordsList) => {
        let tempGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        
        // Place words
        wordsList.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const direction = Math.floor(Math.random() * 3); // 0: Horiz, 1: Vert, 2: Diag
                const row = Math.floor(Math.random() * GRID_SIZE);
                const col = Math.floor(Math.random() * GRID_SIZE);

                if (canPlaceWord(word, row, col, direction, tempGrid)) {
                    placeWord(word, row, col, direction, tempGrid);
                    placed = true;
                }
                attempts++;
            }
        });

        // Fill remaining with random letters
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (tempGrid[r][c] === '') {
                    tempGrid[r][c] = letters.charAt(Math.floor(Math.random() * letters.length));
                }
            }
        }

        setGrid(tempGrid);
    };

    const canPlaceWord = (word, row, col, direction, tempGrid) => {
        if (direction === 0) { // Horizontal
            if (col + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                const char = tempGrid[row][col + i];
                if (char !== '' && char !== word[i]) return false;
            }
        } else if (direction === 1) { // Vertical
            if (row + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                const char = tempGrid[row + i][col];
                if (char !== '' && char !== word[i]) return false;
            }
        } else if (direction === 2) { // Diagonal
            if (row + word.length > GRID_SIZE || col + word.length > GRID_SIZE) return false;
            for (let i = 0; i < word.length; i++) {
                const char = tempGrid[row + i][col + i];
                if (char !== '' && char !== word[i]) return false;
            }
        }
        return true;
    };

    const placeWord = (word, row, col, direction, tempGrid) => {
        for (let i = 0; i < word.length; i++) {
            if (direction === 0) {
                tempGrid[row][col + i] = word[i];
            } else if (direction === 1) {
                tempGrid[row + i][col] = word[i];
            } else if (direction === 2) {
                tempGrid[row + i][col + i] = word[i];
            }
        }
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        if (!startCell) {
            playClick();
            setStartCell({ r, c });
            setSelectedCells([[r, c]]);
        } else {
            // Check direction compatibility
            const dr = r - startCell.r;
            const dc = c - startCell.c;

            const isHorizontal = dr === 0 && dc !== 0;
            const isVertical = dc === 0 && dr !== 0;
            const isDiagonal = Math.abs(dr) === Math.abs(dc) && dr !== 0;

            if (isHorizontal || isVertical || isDiagonal) {
                const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
                const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
                const steps = Math.max(Math.abs(dr), Math.abs(dc));

                let path = [];
                let wordString = '';
                for (let i = 0; i <= steps; i++) {
                    const currR = startCell.r + i * stepR;
                    const currC = startCell.c + i * stepC;
                    path.push([currR, currC]);
                    wordString += grid[currR][currC];
                }

                // Check if word string is in the list
                const reversedWord = wordString.split('').reverse().join('');
                let matchedWord = null;

                if (words.includes(wordString) && !foundWords.includes(wordString)) {
                    matchedWord = wordString;
                } else if (words.includes(reversedWord) && !foundWords.includes(reversedWord)) {
                    matchedWord = reversedWord;
                }

                if (matchedWord) {
                    playSuccessSfx();
                    const newFound = [...foundWords, matchedWord];
                    setFoundWords(newFound);

                    if (newFound.length === words.length) {
                        setWinner(true);
                        playVictorySfx();
                        registerGameCompletion('sopadeletras', 'medium', timeElapsed);
                        setShowVictory(true);
                    }
                } else {
                    playErrorSfx();
                }
            } else {
                playErrorSfx();
            }

            // Reset selection
            setStartCell(null);
            setSelectedCells([]);
        }
    };

    const isCellSelected = (r, c) => {
        return selectedCells.some(([sr, sc]) => sr === r && sc === c);
    };

    const isCellInFoundWord = (r, c) => {
        // Simple visual marker: we can skip saving exact path for all found words to keep it simple,
        // or just let them highlighted.
        return false;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '520px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Sopa de Letras
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

            {/* Word List Tracker */}
            <div style={{
                display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)'
            }}>
                {words.map(w => {
                    const isFound = foundWords.includes(w);
                    return (
                        <span key={w} style={{
                            fontSize: '0.85rem', padding: '4px 10px', borderRadius: '20px',
                            backgroundColor: isFound ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                            border: isFound ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                            color: isFound ? '#10b981' : 'var(--text-main)',
                            textDecoration: isFound ? 'line-through' : 'none',
                            fontWeight: 'bold', transition: 'all 0.3s'
                        }}>
                            {w}
                        </span>
                    );
                })}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '6px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '12px',
                aspectRatio: '1'
            }}>
                {grid.map((row, rIdx) => (
                    row.map((letter, cIdx) => {
                        const isSelected = isCellSelected(rIdx, cIdx);
                        const isStart = startCell && startCell.r === rIdx && startCell.c === cIdx;
                        return (
                            <button
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                style={{
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    backgroundColor: isStart 
                                        ? 'var(--primary)' 
                                        : isSelected 
                                            ? 'rgba(59, 130, 246, 0.3)' 
                                            : 'rgba(255, 255, 255, 0.03)',
                                    color: isStart ? 'white' : 'var(--text-main)',
                                    cursor: winner ? 'default' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    aspectRatio: '1',
                                    border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.01)'
                                }}
                            >
                                {letter}
                            </button>
                        );
                    })
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en la primera letra de la palabra y luego en la última letra para seleccionarla.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Sopa Completada!"
                message="Has encontrado todas las palabras ocultas en la cuadrícula."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default WordSearchPage;
