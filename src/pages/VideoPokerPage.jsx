import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SUITS = [
    { name: 'Hearts', symbol: '♥', color: '#ef4444' },
    { name: 'Diamonds', symbol: '♦', color: '#ef4444' },
    { name: 'Clubs', symbol: '♣', color: '#94a3b8' },
    { name: 'Spades', symbol: '♠', color: '#94a3b8' }
];

const VALUES = [
    { num: 2, label: '2' }, { num: 3, label: '3' }, { num: 4, label: '4' },
    { num: 5, label: '5' }, { num: 6, label: '6' }, { num: 7, label: '7' },
    { num: 8, label: '8' }, { num: 9, label: '9' }, { num: 10, label: '10' },
    { num: 11, label: 'J' }, { num: 12, label: 'Q' }, { num: 13, label: 'K' },
    { num: 14, label: 'A' }
];

const VideoPokerPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [deck, setDeck] = useState([]);
    const [hand, setHand] = useState([]);
    const [holds, setHolds] = useState([false, false, false, false, false]);
    const [chips, setChips] = useState(100);
    const [bet, setBet] = useState(5);
    const [gameState, setGameState] = useState('betting'); // 'betting', 'held', 'ended'
    const [payoutResult, setPayoutResult] = useState('');
    const [showVictory, setShowVictory] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const initDeck = () => {
        let tempDeck = [];
        SUITS.forEach(suit => {
            VALUES.forEach(val => {
                tempDeck.push({ suit, val });
            });
        });
        return tempDeck.sort(() => 0.5 - Math.random());
    };

    const handleBetChange = (amount) => {
        if (gameState !== 'betting') return;
        playClick();
        setBet(amount);
    };

    const handleFirstDeal = () => {
        if (gameState !== 'betting') return;
        if (chips < bet) {
            playErrorSfx();
            alert('Fichas insuficientes.');
            return;
        }

        playClick();
        setChips(prev => prev - bet);
        
        const freshDeck = initDeck();
        const firstHand = [
            freshDeck.pop(),
            freshDeck.pop(),
            freshDeck.pop(),
            freshDeck.pop(),
            freshDeck.pop()
        ];

        setHand(firstHand);
        setDeck(freshDeck);
        setHolds([false, false, false, false, false]);
        setGameState('held');
        setPayoutResult('Elige qué cartas retener (Hold)');
    };

    const toggleHold = (idx) => {
        if (gameState !== 'held') return;
        playClick();
        const nextHolds = [...holds];
        nextHolds[idx] = !nextHolds[idx];
        setHolds(nextHolds);
    };

    const handleSecondDraw = () => {
        if (gameState !== 'held') return;
        playClick();

        const finalHand = [...hand];
        const nextDeck = [...deck];

        holds.forEach((held, idx) => {
            if (!held) {
                finalHand[idx] = nextDeck.pop();
            }
        });

        setHand(finalHand);
        setDeck(nextDeck);
        setGameState('ended');

        evaluateHand(finalHand);
    };

    const evaluateHand = (finalHand) => {
        // Sort values to make straight and pair checking simple
        const sortedHand = [...finalHand].sort((a, b) => a.val.num - b.val.num);
        const values = sortedHand.map(c => c.val.num);
        const suits = sortedHand.map(c => c.suit.name);

        const isFlush = new Set(suits).size === 1;
        
        // Straight check
        let isStraight = false;
        if (new Set(values).size === 5) {
            if (values[4] - values[0] === 4) {
                isStraight = true;
            }
            // Special Ace-low straight check: A, 2, 3, 4, 5 -> 14, 2, 3, 4, 5
            if (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14) {
                isStraight = true;
            }
        }

        // Value frequency map
        const freqMap = {};
        values.forEach(v => {
            freqMap[v] = (freqMap[v] || 0) + 1;
        });
        const counts = Object.values(freqMap).sort((a, b) => b - a);

        let payoutMultiplier = 0;
        let handName = 'Nada';

        if (isFlush && isStraight) {
            if (values[0] === 10) {
                payoutMultiplier = 250;
                handName = '¡Escalera Real! (Royal Flush)';
            } else {
                payoutMultiplier = 50;
                handName = 'Escalera de Color (Straight Flush)';
            }
        } else if (counts[0] === 4) {
            payoutMultiplier = 25;
            handName = 'Póker (Four of a Kind)';
        } else if (counts[0] === 3 && counts[1] === 2) {
            payoutMultiplier = 9;
            handName = 'Full House';
        } else if (isFlush) {
            payoutMultiplier = 6;
            handName = 'Color (Flush)';
        } else if (isStraight) {
            payoutMultiplier = 4;
            handName = 'Escalera (Straight)';
        } else if (counts[0] === 3) {
            payoutMultiplier = 3;
            handName = 'Terna (Three of a Kind)';
        } else if (counts[0] === 2 && counts[1] === 2) {
            payoutMultiplier = 2;
            handName = 'Doble Par (Two Pair)';
        } else if (counts[0] === 2) {
            // Jacks or Better: pair of J (11), Q (12), K (13) or A (14)
            const pairVal = Object.keys(freqMap).find(key => freqMap[key] === 2);
            if (parseInt(pairVal) >= 11) {
                payoutMultiplier = 1;
                handName = 'Par de Jacks o Mejor';
            }
        }

        const winnings = bet * payoutMultiplier;
        setChips(prev => prev + winnings);

        if (winnings > 0) {
            playSuccessSfx();
            setPayoutResult(`${handName} - ¡Ganas $${winnings}!`);
            
            // Win condition: reach 200 chips
            if (chips + winnings >= 200) {
                playVictorySfx();
                registerGameCompletion('videopoker', 'medium', timeElapsed, chips + winnings);
                setShowVictory(true);
            }
        } else {
            playErrorSfx();
            setPayoutResult(`${handName} - Has perdido la apuesta.`);
        }
    };

    const handleRestartRound = () => {
        playClick();
        setHand([]);
        setHolds([false, false, false, false, false]);
        setGameState('betting');
        setPayoutResult('Haz tu apuesta para comenzar');
        setShowVictory(false);
    };

    return (
        <div style={{
            maxWidth: '560px', margin: '30px auto', padding: '24px',
            backgroundColor: '#0c0a09', border: '6px double #3b82f6', // Neon blue cabinet look
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center', color: '#38bdf8'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold', letterSpacing: '1px' }}>
                    🎰 VIDEO POKER RETRO
                </span>
                <button onClick={() => { setChips(100); handleRestartRound(); }} style={{
                    background: 'transparent', border: '1px solid #38bdf8', borderRadius: '8px',
                    padding: '6px 10px', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Paytable Summary */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px',
                fontSize: '0.65rem', color: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.1)',
                padding: '10px', borderRadius: '12px', border: '1px solid #1e3a8a', marginBottom: '20px', textAlign: 'left'
            }}>
                <div>Royal Flush: <strong>250x</strong></div>
                <div>Straight Flush: <strong>50x</strong></div>
                <div>Four of a Kind: <strong>25x</strong></div>
                <div>Full House: <strong>9x</strong></div>
                <div>Flush: <strong>6x</strong></div>
                <div>Straight: <strong>4x</strong></div>
                <div>Three of a Kind: <strong>3x</strong></div>
                <div>Two Pair: <strong>2x</strong></div>
                <div>Jacks or Better: <strong>1x</strong></div>
            </div>

            {/* Chips & Bet HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.4)', padding: '12px 18px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <span>Fichas: <strong style={{ color: '#fbbf24', fontSize: '1.25rem' }}>${chips}</strong></span>
                <span>Apuesta: <strong style={{ color: '#38bdf8', fontSize: '1.25rem' }}>${bet}</strong></span>
            </div>

            {/* Hand Area */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: '94px', marginBottom: '30px' }}>
                {hand.length > 0 ? (
                    hand.map((card, idx) => {
                        const held = holds[idx];
                        return (
                            <div
                                key={idx}
                                onClick={() => toggleHold(idx)}
                                style={{
                                    width: '64px', height: '94px', borderRadius: '8px',
                                    backgroundColor: 'white', color: card.suit.color,
                                    border: held ? '3px solid #fbbf24' : '1px solid #cbd5e1',
                                    boxShadow: held ? '0 0 15px #fbbf24' : '0 4px 6px rgba(0,0,0,0.3)',
                                    display: 'flex', flexDirection: 'column',
                                    padding: '6px', boxSizing: 'border-box', cursor: gameState === 'held' ? 'pointer' : 'default',
                                    position: 'relative'
                                }}
                            >
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'left', color: '#0f172a' }}>{card.val.label}</span>
                                <span style={{ fontSize: '2rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</span>
                                
                                {held && (
                                    <span style={{
                                        position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)',
                                        fontSize: '0.65rem', backgroundColor: '#fbbf24', color: '#000',
                                        fontWeight: 'bold', padding: '1px 4px', borderRadius: '4px'
                                    }}>
                                        HELD
                                    </span>
                                )}
                            </div>
                        );
                    })
                ) : (
                    Array(5).fill(null).map((_, idx) => (
                        <div key={idx} style={{
                            width: '64px', height: '94px', borderRadius: '8px',
                            border: '1.5px dashed #1e3a8a', backgroundColor: 'rgba(59,130,246,0.02)'
                        }} />
                    ))
                )}
            </div>

            {/* Status Banner */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px',
                fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', border: '1px solid #1e3a8a', marginBottom: '24px'
            }}>
                {payoutResult}
            </div>

            {/* Controls panel */}
            <div>
                {gameState === 'betting' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                            {[1, 2, 3, 4, 5].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => handleBetChange(amt)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '6px',
                                        border: bet === amt ? '2px solid #fbbf24' : '1px solid #1e3a8a',
                                        backgroundColor: bet === amt ? '#1e3a8a' : 'transparent',
                                        color: bet === amt ? 'white' : '#38bdf8', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleFirstDeal}
                            style={{
                                padding: '10px 32px', borderRadius: '8px', border: 'none',
                                backgroundColor: '#fbbf24', color: 'black', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            REPARTIR (DEAL)
                        </button>
                    </div>
                )}

                {gameState === 'held' && (
                    <button
                        onClick={handleSecondDraw}
                        style={{
                            padding: '10px 32px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#38bdf8', color: 'black', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        DESCARTAR / CAMBIAR (DRAW)
                    </button>
                )}

                {gameState === 'ended' && (
                    <button
                        onClick={handleRestartRound}
                        style={{
                            padding: '10px 32px', borderRadius: '8px', border: 'none',
                            backgroundColor: '#fbbf24', color: 'black', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        NUEVA APUESTA
                    </button>
                )}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz tu apuesta y pulsa Repartir. Elige las cartas que deseas conservar haciendo clic sobre ellas. Pulsa Descartar para cambiar las no conservadas y evaluar tu mano. Multiplica tus puntos llegando hasta $200.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Objetivo Alcanzado!"
                message={`¡Felicidades! Has superado el límite de $200 fichas de casino con un saldo final de $${chips}.`}
                timeElapsed={timeElapsed}
                onPlayAgain={() => { setChips(100); handleRestartRound(); }}
            />
        </div>
    );
};

export default VideoPokerPage;
