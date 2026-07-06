import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { getRandomWord, checkGuess } from '../components/Wordle/wordleLogic';

const ROWS = 6;
const COLS = 5;

const WordlePage = () => {
    const [solution, setSolution] = useState('');
    const [guesses, setGuesses] = useState(Array(ROWS).fill(''));
    const [currentRow, setCurrentRow] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [message, setMessage] = useState(null);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        setSolution(getRandomWord());
        setGuesses(Array(ROWS).fill(''));
        setCurrentRow(0);
        setGameOver(false);
        setWon(false);
        setMessage(null);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleKeyPress = useCallback((key) => {
        if (gameOver) return;

        if (key === 'Enter') {
            if (guesses[currentRow].length !== COLS) {
                setMessage({ type: 'error-msg', text: 'La palabra debe tener 5 letras.' });
                setTimeout(() => setMessage(null), 2000);
                return;
            }

            const currentGuess = guesses[currentRow];
            
            if (currentGuess === solution) {
                setWon(true);
                setGameOver(true);
                setTimerRunning(false);
                setShowVictory(true);
            } else if (currentRow === ROWS - 1) {
                setGameOver(true);
                setTimerRunning(false);
                setMessage({ type: 'error-msg', text: `Fin del juego. La palabra era ${solution}` });
            } else {
                setCurrentRow(prev => prev + 1);
            }
        } else if (key === 'Backspace') {
            const currentGuess = guesses[currentRow];
            const newGuesses = [...guesses];
            newGuesses[currentRow] = currentGuess.slice(0, -1);
            setGuesses(newGuesses);
        } else if (/^[A-ZÑ]$/.test(key) && guesses[currentRow].length < COLS) {
            const currentGuess = guesses[currentRow];
            const newGuesses = [...guesses];
            newGuesses[currentRow] = currentGuess + key;
            setGuesses(newGuesses);
        }
    }, [currentRow, gameOver, guesses, solution]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            let key = e.key.toUpperCase();
            if (key === 'ENTER') key = 'Enter';
            if (key === 'BACKSPACE') key = 'Backspace';
            
            if (key === 'Enter' || key === 'Backspace' || /^[A-ZÑ]$/.test(key)) {
                handleKeyPress(key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress]);

    // Keyboard state
    const getKeyStatus = () => {
        const status = {};
        for (let i = 0; i < currentRow; i++) {
            const guess = guesses[i];
            const result = checkGuess(guess, solution);
            for (let j = 0; j < COLS; j++) {
                const char = guess[j];
                const res = result[j];
                if (!status[char] || res === 'correct' || (res === 'present' && status[char] !== 'correct')) {
                    status[char] = res;
                }
            }
        }
        return status;
    };

    const keyStatus = getKeyStatus();

    const KeyboardRow = ({ keys }) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
            {keys.map(key => {
                let bgColor = 'rgba(255, 255, 255, 0.1)';
                if (keyStatus[key] === 'correct') bgColor = '#10b981';
                else if (keyStatus[key] === 'present') bgColor = '#f59e0b';
                else if (keyStatus[key] === 'absent') bgColor = 'rgba(255, 255, 255, 0.05)';

                return (
                    <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        style={{
                            background: bgColor,
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: keyStatus[key] === 'absent' ? 'rgba(255,255,255,0.3)' : 'white',
                            borderRadius: '6px',
                            padding: key === 'Enter' || key === 'Backspace' ? '12px 10px' : '12px 14px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            flex: key === 'Enter' || key === 'Backspace' ? '1.5' : '1',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                    >
                        {key === 'Backspace' ? '⌫' : key}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '500px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '500px', width: '100%' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                    <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Wordle
                    </h1>
                    <button 
                        onClick={() => setShowInstructions(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#10b981', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                {message && (
                    <div className={`message ${message.type}`} style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                        color: message.type === 'success' ? '#34d399' : '#fb7185',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '30px', alignItems: 'center' }}>
                    {Array(ROWS).fill(0).map((_, r) => {
                        const guess = guesses[r];
                        const result = r < currentRow || gameOver ? checkGuess(guess.padEnd(5, ' '), solution) : Array(5).fill('empty');
                        
                        return (
                            <div key={r} style={{ display: 'flex', gap: '6px' }}>
                                {Array(COLS).fill(0).map((_, c) => {
                                    const char = guess[c] || '';
                                    let bgColor = 'transparent';
                                    let borderColor = 'rgba(255, 255, 255, 0.2)';
                                    
                                    if (result[c] === 'correct') { bgColor = '#10b981'; borderColor = '#10b981'; }
                                    else if (result[c] === 'present') { bgColor = '#f59e0b'; borderColor = '#f59e0b'; }
                                    else if (result[c] === 'absent') { bgColor = 'rgba(255, 255, 255, 0.05)'; borderColor = 'rgba(255, 255, 255, 0.05)'; }
                                    else if (char) { borderColor = 'rgba(255, 255, 255, 0.5)'; }

                                    return (
                                        <div key={c} style={{
                                            width: '55px', height: '55px',
                                            border: `2px solid ${borderColor}`,
                                            backgroundColor: bgColor,
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            fontSize: '2rem', fontWeight: 700, color: 'white', textTransform: 'uppercase',
                                            transition: 'all 0.3s'
                                        }}>
                                            {char}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <KeyboardRow keys={['Q','W','E','R','T','Y','U','I','O','P']} />
                    <KeyboardRow keys={['A','S','D','F','G','H','J','K','L','Ñ']} />
                    <KeyboardRow keys={['Enter','Z','X','C','V','B','N','M','Backspace']} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <button 
                        onClick={startNewGame}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                            padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        Nuevo Juego
                    </button>
                </div>

            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Wordle"
                instructions={[
                    "Adivina la palabra oculta de 5 letras en 6 intentos.",
                    "Cada intento debe ser una palabra válida de 5 letras. Escribe con tu teclado y presiona Enter.",
                    "El color de las baldosas cambiará para mostrarte qué tan cerca estás de la palabra.",
                    "VERDE: La letra está en la palabra y en la posición correcta.",
                    "AMARILLO: La letra está en la palabra pero en una posición incorrecta.",
                    "GRIS: La letra no está en la palabra."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Wordle"
            />
        </div>
    );
};

export default WordlePage;
