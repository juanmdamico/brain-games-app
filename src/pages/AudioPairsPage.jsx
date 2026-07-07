import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const FREQS = [
    { note: 'Do', freq: 261.63, symbol: '🎵' },
    { note: 'Re', freq: 293.66, symbol: '🎼' },
    { note: 'Mi', freq: 329.63, symbol: '🎹' },
    { note: 'Fa', freq: 349.23, symbol: '🎸' },
    { note: 'Sol', freq: 392.00, symbol: '🎻' },
    { note: 'La', freq: 440.00, symbol: '🎺' }
];

const AudioPairsPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [cards, setCards] = useState([]); // Array of { id, freqObj, isFlipped: bool, isMatched: bool }
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Audio Context reference
    const audioCtxRef = React.useRef(null);

    useEffect(() => {
        initGame();
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    const initGame = () => {
        // Double the frequencies to form 6 pairs (12 cards)
        const doubleFreqs = [...FREQS, ...FREQS];
        // Shuffle
        doubleFreqs.sort(() => 0.5 - Math.random());

        const initialCards = doubleFreqs.map((freqObj, idx) => ({
            id: idx,
            freqObj,
            isFlipped: false,
            isMatched: false
        }));

        setCards(initialCards);
        setSelectedIndices([]);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const playNote = (frequency) => {
        try {
            // Lazy initialize Web Audio API
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            // Decay envelop
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (err) {
            console.error('Audio synthesis failed:', err);
        }
    };

    const handleCardClick = (idx) => {
        if (winner || cards[idx].isFlipped || cards[idx].isMatched || selectedIndices.length >= 2) return;

        // Flip card
        const newCards = [...cards];
        newCards[idx].isFlipped = true;
        setCards(newCards);

        // Play matching synthesized note tone
        playNote(cards[idx].freqObj.freq);

        const nextSelection = [...selectedIndices, idx];
        setSelectedIndices(nextSelection);

        if (nextSelection.length === 2) {
            const [firstIdx, secondIdx] = nextSelection;
            
            if (cards[firstIdx].freqObj.freq === cards[secondIdx].freqObj.freq) {
                // Match!
                setTimeout(() => {
                    playSuccessSfx();
                    const matchedCards = cards.map((c, i) => {
                        if (i === firstIdx || i === secondIdx) {
                            return { ...c, isMatched: true };
                        }
                        return c;
                    });
                    setCards(matchedCards);
                    setSelectedIndices([]);

                    // Check Win
                    if (matchedCards.every(c => c.isMatched)) {
                        setWinner(true);
                        playVictorySfx();
                        registerGameCompletion('audiopairs', 'medium', timeElapsed);
                        setShowVictory(true);
                    }
                }, 600);
            } else {
                // Mismatch
                setTimeout(() => {
                    playErrorSfx();
                    const closedCards = cards.map((c, i) => {
                        if (i === firstIdx || i === secondIdx) {
                            return { ...c, isFlipped: false };
                        }
                        return c;
                    });
                    setCards(closedCards);
                    setSelectedIndices([]);
                }, 1000);
            }
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
                    Pares Auditivos (Audio Pairs)
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

            {/* Grid layout cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                justifyItems: 'center', marginBottom: '20px'
            }}>
                {cards.map((card, idx) => {
                    const flipped = card.isFlipped || card.isMatched;
                    const matched = card.isMatched;

                    return (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(idx)}
                            style={{
                                width: '64px', height: '80px', borderRadius: '10px',
                                border: flipped 
                                    ? matched 
                                        ? '1.5px solid #10b981' 
                                        : '1.5px solid var(--primary)' 
                                    : '1.5px solid var(--border)',
                                backgroundColor: flipped 
                                    ? matched 
                                        ? 'rgba(16, 185, 129, 0.15)' 
                                        : 'rgba(59, 130, 246, 0.15)' 
                                    : 'rgba(255,255,255,0.03)',
                                boxShadow: flipped && matched ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
                                cursor: flipped ? 'default' : 'pointer',
                                fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', transform: flipped ? 'scale(1.02)' : 'none'
                            }}
                        >
                            {flipped ? card.freqObj.symbol : '❓'}
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en las cartas para voltearlas y escuchar su tono de sonido. Encuentra los pares de cartas que emiten el mismo tono de frecuencia musical para despejar todo el tablero.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Memoria Auditiva Perfecta!"
                message="Has emparejado todos los tonos de sonido correctamente."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default AudioPairsPage;
