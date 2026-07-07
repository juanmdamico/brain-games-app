import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, Send, Delete, Shuffle } from 'lucide-react';

const LETTERS_POOL = ['A', 'C', 'O', 'M', 'E', 'R'];

const TARGET_WORDS = [
    { word: 'COMER', length: 5, found: false },
    { word: 'MARCO', length: 5, found: false },
    { word: 'CREMA', length: 5, found: false },
    { word: 'AMOR', length: 4, found: false },
    { word: 'MORA', length: 4, found: false },
    { word: 'RAMO', length: 4, found: false },
    { word: 'ROMA', length: 4, found: false },
    { word: 'COMA', length: 4, found: false },
    { word: 'MERO', length: 4, found: false },
    { word: 'ROCE', length: 4, found: false },
    { word: 'ACRE', length: 4, found: false },
    { word: 'MAR', length: 3, found: false },
    { word: 'REO', length: 3, found: false },
    { word: 'ECO', length: 3, found: false },
    { word: 'AMO', length: 3, found: false }
];

const AnagramPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [scrambled, setScrambled] = useState([]);
    const [currentGuess, setCurrentGuess] = useState([]);
    const [wordsList, setWordsList] = useState(TARGET_WORDS.map(w => ({ ...w })));
    const [score, setScore] = useState(0);
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
        setScrambled(shuffleArray([...LETTERS_POOL]));
        setCurrentGuess([]);
        setWordsList(TARGET_WORDS.map(w => ({ ...w })));
        setScore(0);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const shuffleArray = (arr) => {
        return arr.sort(() => 0.5 - Math.random());
    };

    const handleShuffle = () => {
        playClick();
        setScrambled(shuffleArray([...scrambled]));
    };

    const handleLetterClick = (letter, idx) => {
        if (winner) return;
        playClick();

        // Add to guess
        setCurrentGuess([...currentGuess, { letter, idx }]);
    };

    const handleRemoveGuessLetter = (guessIdx) => {
        if (winner) return;
        playClick();
        setCurrentGuess(currentGuess.filter((_, idx) => idx !== guessIdx));
    };

    const handleClear = () => {
        playClick();
        setCurrentGuess([]);
    };

    const handleSubmit = () => {
        if (winner || currentGuess.length === 0) return;

        const guessWord = currentGuess.map(g => g.letter).join('');
        const wordIdx = wordsList.findIndex(w => w.word === guessWord && !w.found);

        if (wordIdx !== -1) {
            playSuccessSfx();
            const updated = [...wordsList];
            updated[wordIdx].found = true;
            setWordsList(updated);
            setCurrentGuess([]);
            setScore(prev => prev + guessWord.length * 10);

            // Win if found at least 8 words
            const foundCount = updated.filter(w => w.found).length;
            if (foundCount >= 8) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('anagrama', 'medium', timeElapsed, score + guessWord.length * 10);
                setShowVictory(true);
            }
        } else {
            playErrorSfx();
        }
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
                    Anagramas (Text Twist)
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

            {/* Score HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Puntos: <strong style={{ color: 'var(--primary)' }}>{score}</strong></span>
                <span>Palabras descubiertas: <strong>{wordsList.filter(w => w.found).length} / 8</strong></span>
            </div>

            {/* Words Grid Placeholder display */}
            <div style={{
                maxHeight: '160px', overflowY: 'auto',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.3)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '12px', marginBottom: '20px'
            }}>
                {wordsList.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '6px', borderRadius: '8px',
                            backgroundColor: item.found ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: item.found ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                            color: item.found ? '#34d399' : 'var(--text-muted)',
                            fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px'
                        }}
                    >
                        {item.found ? item.word : '_ '.repeat(item.length)}
                    </div>
                ))}
            </div>

            {/* Current Guess Slot Rack */}
            <div style={{
                height: '52px', borderBottom: '2px solid var(--border)',
                display: 'flex', justifyContent: 'center', gap: '8px',
                alignItems: 'center', marginBottom: '20px'
            }}>
                {currentGuess.map((g, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleRemoveGuessLetter(idx)}
                        style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            border: '1.5px solid var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
                        }}
                    >
                        {g.letter}
                    </button>
                ))}
            </div>

            {/* Scrambled Letter dock */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                {scrambled.map((letter, idx) => {
                    const isUsed = currentGuess.some(g => g.idx === idx);
                    return (
                        <button
                            key={idx}
                            onClick={() => !isUsed && handleLetterClick(letter, idx)}
                            disabled={isUsed}
                            style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                border: '1px solid var(--border)',
                                backgroundColor: isUsed ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                                color: isUsed ? 'rgba(255,255,255,0.1)' : 'white',
                                fontWeight: 'bold', fontSize: '1.3rem',
                                cursor: isUsed ? 'default' : 'pointer',
                                transition: 'all 0.15s',
                                transform: isUsed ? 'scale(0.95)' : 'none'
                            }}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                    onClick={handleShuffle}
                    style={{
                        padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(255,255,255,0.03)', color: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Shuffle size={16} /> Mezclar
                </button>
                <button
                    onClick={handleClear}
                    style={{
                        padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Delete size={16} /> Limpiar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={currentGuess.length === 0}
                    style={{
                        padding: '10px 18px', borderRadius: '10px', border: 'none',
                        backgroundColor: currentGuess.length === 0 ? 'rgba(255,255,255,0.02)' : 'var(--primary)',
                        color: currentGuess.length === 0 ? 'var(--text-muted)' : 'white',
                        fontWeight: 'bold', cursor: currentGuess.length === 0 ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Send size={16} /> Enviar
                </button>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en las letras para formar palabras válidas de 3 a 5 letras en español. Descubre al menos 8 palabras para ganar la partida.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Palabras Descifradas!"
                message={`Has encontrado ${wordsList.filter(w => w.found).length} palabras válidas del anagrama.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default AnagramPage;
