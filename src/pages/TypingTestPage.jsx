import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const PARAGRAPHS = [
    "El cerebro humano es un organo de una complejidad asombrosa. Procesa millones de datos sensoriales por segundo y nos permite sentir, pensar y actuar de forma coherente.",
    "La agilidad mental se puede entrenar todos los dias resolviendo acertijos y rompecabezas. La constancia es la clave para mantener una mente activa y joven a lo largo del tiempo.",
    "El desarrollo de software requiere una gran dosis de concentracion, logica y paciencia. Cada linea de codigo es un paso hacia la resolucion de problemas complejos."
];

const TIME_LIMIT = 60; // 60 seconds test

const TypingTestPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [targetText, setTargetText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const timerInterval = useRef(null);
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        initGame();
    }, []);

    // Timer loop
    useEffect(() => {
        if (isPlaying && timeRemaining > 0 && !gameOver) {
            timerInterval.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimeElapsed(elapsed);
                const remaining = Math.max(0, TIME_LIMIT - elapsed);
                setTimeRemaining(remaining);

                if (remaining <= 0) {
                    handleGameEnd(elapsed);
                }
            }, 1000);
        } else {
            clearInterval(timerInterval.current);
        }
        return () => clearInterval(timerInterval.current);
    }, [isPlaying, timeRemaining, gameOver]);

    const initGame = () => {
        const text = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
        setTargetText(text);
        setInputValue('');
        setWpm(0);
        setAccuracy(100);
        setIsPlaying(false);
        setGameOver(false);
        setShowVictory(false);
        setTimeRemaining(TIME_LIMIT);
        setTimeElapsed(0);
    };

    const handleInputChange = (e) => {
        if (gameOver) return;

        const val = e.target.value;

        // Start game on first keystroke
        if (!isPlaying) {
            playClick();
            setIsPlaying(true);
            startTimeRef.current = Date.now();
        }

        setInputValue(val);

        // Calculate stats
        let correctCount = 0;
        let wrongCount = 0;

        for (let i = 0; i < val.length; i++) {
            if (val[i] === targetText[i]) {
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        // SFX trigger
        if (val.length > inputValue.length) {
            // Letter added
            if (val[val.length - 1] === targetText[val.length - 1]) {
                playClick();
            } else {
                playErrorSfx();
            }
        }

        // Accuracy
        const totalTyped = val.length;
        if (totalTyped > 0) {
            setAccuracy(Math.round((correctCount / totalTyped) * 100));
        } else {
            setAccuracy(100);
        }

        // Words Per Minute (standard definition: 5 characters = 1 word)
        const elapsedMinutes = timeElapsed > 0 ? timeElapsed / 60 : 1 / 60;
        setWpm(Math.round((correctCount / 5) / elapsedMinutes));

        // Check if finished entire text
        if (val === targetText) {
            handleGameEnd(timeElapsed);
        }
    };

    const handleGameEnd = (finalTime) => {
        setIsPlaying(false);
        setGameOver(true);
        playVictorySfx();
        
        // Register completion with WPM score as value
        registerGameCompletion('testmecanografia', 'medium', finalTime, wpm);
        setShowVictory(true);
    };

    const renderTextHighlight = () => {
        return targetText.split('').map((char, index) => {
            let color = 'var(--text-main)';
            let bgColor = 'transparent';

            if (index < inputValue.length) {
                if (inputValue[index] === char) {
                    color = '#10b981'; // Green for correct
                } else {
                    color = '#ef4444'; // Red for incorrect
                    bgColor = 'rgba(239, 68, 68, 0.1)';
                }
            }

            const isCursor = index === inputValue.length;

            return (
                <span 
                    key={index} 
                    style={{ 
                        color, 
                        backgroundColor: bgColor,
                        borderBottom: isCursor && isPlaying ? '2px solid var(--primary)' : 'none',
                        transition: 'all 0.1s'
                    }}
                >
                    {char}
                </span>
            );
        });
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
                    Test de Mecanografía (Velocidad)
                </span>
                <div style={{ color: timeRemaining <= 10 ? '#ef4444' : 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {timeRemaining} s
                </div>
                <button onClick={initGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Paragraph Text box */}
            <div style={{
                fontSize: '1.25rem', lineHeight: 1.6, textAlign: 'left',
                backgroundColor: 'rgba(15, 23, 42, 0.3)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '20px', marginBottom: '20px', userSelect: 'none',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)'
            }}>
                {renderTextHighlight()}
            </div>

            {/* Input box */}
            <textarea
                disabled={gameOver}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={isPlaying ? "Escribe aquí el texto..." : "Empieza a escribir aquí para comenzar el test..."}
                style={{
                    width: '100%', height: '80px', padding: '12px 16px', borderRadius: '14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)',
                    color: 'white', outline: 'none', fontSize: '1rem', resize: 'none',
                    boxShadow: isPlaying ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'none',
                    transition: 'all 0.3s'
                }}
            />

            {/* Live stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Palabras por Minuto (WPM)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {wpm}
                    </div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Precisión (Accuracy)
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
                        {accuracy}%
                    </div>
                </div>
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Escribe las palabras respetando las mayúsculas, minúsculas y acentos del texto.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Test Finalizado!"
                message={`Has alcanzado una velocidad de ${wpm} WPM con una precisión del ${accuracy}%.`}
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default TypingTestPage;
