import React, { useState, useEffect } from 'react';
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
    { label: 'A', value: 11 }, { label: '2', value: 2 }, { label: '3', value: 3 },
    { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '6', value: 6 },
    { label: '7', value: 7 }, { label: '8', value: 8 }, { label: '9', value: 9 },
    { label: '10', value: 10 }, { label: 'J', value: 10 }, { label: 'Q', value: 10 },
    { label: 'K', value: 10 }
];

const BlackjackPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [deck, setDeck] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [gameState, setGameState] = useState('betting'); // 'betting', 'player-turn', 'dealer-turn', 'ended'
    const [chips, setChips] = useState(500);
    const [bet, setBet] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Haz tu apuesta para comenzar');
    const [winner, setWinner] = useState(null); // 'player', 'dealer', 'push', 'blackjack'
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (gameState !== 'player-turn' && gameState !== 'dealer-turn') return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, gameState]);

    const buildDeck = () => {
        let newDeck = [];
        SUITS.forEach(suit => {
            VALUES.forEach(val => {
                newDeck.push({ suit, val });
            });
        });
        // Shuffle
        return newDeck.sort(() => 0.5 - Math.random());
    };

    const getHandSum = (cards) => {
        let sum = 0;
        let aces = 0;
        cards.forEach(c => {
            sum += c.val.value;
            if (c.val.label === 'A') aces++;
        });

        // Convert Aces from 11 to 1 if we went bust
        while (sum > 21 && aces > 0) {
            sum -= 10;
            aces--;
        }
        return sum;
    };

    const handlePlaceBet = (amount) => {
        if (gameState !== 'betting') return;
        if (chips < amount) {
            playErrorSfx();
            return;
        }

        playClick();
        setBet(prev => prev + amount);
        setChips(prev => prev - amount);
    };

    const handleClearBet = () => {
        if (gameState !== 'betting') return;
        playClick();
        setChips(prev => prev + bet);
        setBet(0);
    };

    const handleStartDeal = () => {
        if (gameState !== 'betting' || bet === 0) return;

        playClick();
        const freshDeck = buildDeck();
        
        const p1 = freshDeck.pop();
        const d1 = freshDeck.pop();
        const p2 = freshDeck.pop();
        const d2 = freshDeck.pop();

        const initialPlayer = [p1, p2];
        const initialDealer = [d1, d2];

        setPlayerCards(initialPlayer);
        setDealerCards(initialDealer);
        setDeck(freshDeck);
        setStartTime(Date.now());
        setTimeElapsed(0);

        const playerSum = getHandSum(initialPlayer);
        const dealerSum = getHandSum(initialDealer);

        if (playerSum === 21) {
            // Instant Blackjack!
            setGameState('ended');
            if (dealerSum === 21) {
                setWinner('push');
                setChips(prev => prev + bet);
                setStatusMessage('Doble Blackjack! Empate.');
                playSuccessSfx();
            } else {
                setWinner('blackjack');
                setChips(prev => prev + Math.round(bet * 2.5));
                setStatusMessage('Blackjack! ¡Ganaste 3:2!');
                playVictorySfx();
                registerGameCompletion('blackjack', 'medium', timeElapsed, Math.round(bet * 1.5));
                setShowVictory(true);
            }
        } else {
            setGameState('player-turn');
            setStatusMessage('¿Pides carta o te plantas?');
        }
    };

    const handleHit = () => {
        if (gameState !== 'player-turn') return;
        playClick();

        const nextDeck = [...deck];
        const card = nextDeck.pop();
        const nextPlayer = [...playerCards, card];

        setPlayerCards(nextPlayer);
        setDeck(nextDeck);

        const sum = getHandSum(nextPlayer);
        if (sum > 21) {
            // Bust
            setGameState('ended');
            setWinner('dealer');
            setStatusMessage('Te has pasado de 21. Pierdes la apuesta.');
            playErrorSfx();
            setBet(0);
        }
    };

    const handleStand = () => {
        if (gameState !== 'player-turn') return;
        playClick();

        setGameState('dealer-turn');
        setStatusMessage('Turno de la casa...');
        runDealerTurn();
    };

    const runDealerTurn = () => {
        let currentDealer = [...dealerCards];
        let currentDeck = [...deck];

        // Draw until 17 or higher
        const interval = setInterval(() => {
            const sum = getHandSum(currentDealer);
            if (sum >= 17) {
                clearInterval(interval);
                evaluateFinalHands(currentDealer);
            } else {
                playClick();
                const card = currentDeck.pop();
                currentDealer.push(card);
                setDealerCards([...currentDealer]);
                setDeck([...currentDeck]);
            }
        }, 800);
    };

    const evaluateFinalHands = (finalDealerHand) => {
        const playerSum = getHandSum(playerCards);
        const dealerSum = getHandSum(finalDealerHand);

        setGameState('ended');

        if (dealerSum > 21) {
            setWinner('player');
            setChips(prev => prev + bet * 2);
            setStatusMessage('La casa se pasó de 21. ¡Ganaste!');
            playVictorySfx();
            registerGameCompletion('blackjack', 'medium', timeElapsed, bet);
            setShowVictory(true);
        } else if (playerSum > dealerSum) {
            setWinner('player');
            setChips(prev => prev + bet * 2);
            setStatusMessage(`¡Ganaste! (${playerSum} a ${dealerSum})`);
            playVictorySfx();
            registerGameCompletion('blackjack', 'medium', timeElapsed, bet);
            setShowVictory(true);
        } else if (playerSum < dealerSum) {
            setWinner('dealer');
            setStatusMessage(`La casa gana (${dealerSum} a ${playerSum})`);
            playErrorSfx();
            setBet(0);
        } else {
            setWinner('push');
            setChips(prev => prev + bet);
            setStatusMessage(`Empate (${playerSum} a ${dealerSum}). Recuperas tu apuesta.`);
            playSuccessSfx();
        }
    };

    const handleRestartRound = () => {
        playClick();
        setBet(0);
        setPlayerCards([]);
        setDealerCards([]);
        setGameState('betting');
        setWinner(null);
        setStatusMessage('Haz tu apuesta para comenzar');
        setShowVictory(false);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '560px', margin: '30px auto', padding: '24px',
            backgroundColor: '#0f5132', // Casino green felt style
            border: '8px solid #5c3d2e', // Wooden table border highlight
            borderRadius: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center', color: 'white'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#a3cfbb', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    ♣♦ Blackjack Casino ♠♥
                </span>
                <div style={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={handleRestartRound} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    padding: '6px 10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Chips HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
                <span>Tus Fichas: <strong style={{ color: '#ffc107', fontSize: '1.1rem' }}>${chips}</strong></span>
                <span>Apuesta: <strong style={{ color: '#17a2b8', fontSize: '1.1rem' }}>${bet}</strong></span>
            </div>

            {/* Dealer Hand */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.75rem', color: '#a3cfbb', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Casa {dealerCards.length > 0 && gameState === 'player-turn' ? '' : `(${getHandSum(dealerCards)})`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: '80px' }}>
                    {dealerCards.map((card, idx) => {
                        const hide = idx === 1 && gameState === 'player-turn';
                        return (
                            <div
                                key={idx}
                                style={{
                                    width: '56px', height: '80px', borderRadius: '8px',
                                    backgroundColor: hide ? '#1e293b' : 'white',
                                    color: hide ? 'white' : card.suit.color,
                                    border: '1px solid #cbd5e1',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                    display: 'flex', flexDirection: 'column',
                                    padding: hide ? '0' : '4px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {hide ? (
                                    <div style={{ width: '100%', height: '100%', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '6px', backgroundColor: '#0f172a' }} />
                                ) : (
                                    <>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</span>
                                        <span style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Info banner */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '10px',
                fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', marginBottom: '24px'
            }}>
                {statusMessage}
            </div>

            {/* Player Hand */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: '80px', marginBottom: '6px' }}>
                    {playerCards.map((card, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: '56px', height: '80px', borderRadius: '8px',
                                backgroundColor: 'white', color: card.suit.color,
                                border: '1px solid #cbd5e1',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                display: 'flex', flexDirection: 'column',
                                padding: '4px', boxSizing: 'border-box'
                            }}
                        >
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</span>
                            <span style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</span>
                        </div>
                    ))}
                </div>
                {playerCards.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#a3cfbb', textTransform: 'uppercase' }}>
                        Tus Cartas ({getHandSum(playerCards)})
                    </div>
                )}
            </div>

            {/* Controls panel */}
            <div>
                {gameState === 'betting' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                            {[10, 50, 100].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => handlePlaceBet(amount)}
                                    style={{
                                        width: '46px', height: '46px', borderRadius: '50%',
                                        backgroundColor: amount === 10 ? '#0d6efd' : amount === 50 ? '#198754' : '#dc3545',
                                        border: '2px solid white', color: 'white', fontWeight: 'bold',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer'
                                    }}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                onClick={handleClearBet}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                                    backgroundColor: 'transparent', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={handleStartDeal}
                                disabled={bet === 0}
                                style={{
                                    padding: '8px 24px', borderRadius: '8px', border: 'none',
                                    backgroundColor: bet === 0 ? 'rgba(255,255,255,0.1)' : '#ffc107',
                                    color: bet === 0 ? 'rgba(255,255,255,0.3)' : 'black', fontWeight: 'bold', cursor: bet === 0 ? 'default' : 'pointer'
                                }}
                            >
                                Repartir
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'player-turn' && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button
                            onClick={handleHit}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Pedir Carta (Hit)
                        </button>
                        <button
                            onClick={handleStand}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            Plantarse (Stand)
                        </button>
                    </div>
                )}

                {gameState === 'ended' && (
                    <button
                        onClick={handleRestartRound}
                        style={{
                            padding: '10px 24px', borderRadius: '10px', border: 'none',
                            backgroundColor: '#ffc107', color: 'black', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        Siguiente Ronda
                    </button>
                )}
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title={winner === 'blackjack' ? "¡Blackjack Natural!" : "¡Victoria!"}
                message={winner === 'blackjack' ? `¡Has vencido al croupier con Blackjack ganando $${Math.round(bet * 1.5)}!` : `¡Felicidades! Has ganado la mano de Blackjack sumando $${bet}.`}
                timeElapsed={timeElapsed}
                onPlayAgain={handleRestartRound}
                playAgainText="Siguiente Ronda"
            />
        </div>
    );
};

export default BlackjackPage;
