import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SUITS = [
    { name: 'Corazones', symbol: '♥', color: '#f43f5e', isRed: true },
    { name: 'Diamantes', symbol: '♦', color: '#f43f5e', isRed: true },
    { name: 'Tréboles', symbol: '♣', color: '#94a3b8', isRed: false },
    { name: 'Picas', symbol: '♠', color: '#94a3b8', isRed: false }
];

const VALUES = [
    { num: 1, label: 'A' }, { num: 2, label: '2' }, { num: 3, label: '3' },
    { num: 4, label: '4' }, { num: 5, label: '5' }, { num: 6, label: '6' },
    { num: 7, label: '7' }, { num: 8, label: '8' }, { num: 9, label: '9' },
    { num: 10, label: '10' }, { num: 11, label: 'J' }, { num: 12, label: 'Q' },
    { num: 13, label: 'K' }
];

const KlondikePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [deck, setDeck] = useState([]); // stock / draw pile
    const [waste, setWaste] = useState([]); // waste / discard pile
    const [foundations, setFoundations] = useState([[], [], [], []]); // 4 stacks (hearts, diamonds, clubs, spades)
    const [columns, setColumns] = useState([[], [], [], [], [], [], []]); // 7 tableau columns
    const [selectedCard, setSelectedCard] = useState(null); // { source: 'waste'|'col'|'found', colIdx: Number, cardIdx: Number }
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
        // 1. Generate full deck
        let fullDeck = [];
        SUITS.forEach((suit, sIdx) => {
            VALUES.forEach(val => {
                fullDeck.push({
                    id: `${sIdx}-${val.num}`,
                    suit,
                    val,
                    isFaceUp: false
                });
            });
        });

        // 2. Shuffle
        fullDeck.sort(() => 0.5 - Math.random());

        // 3. Deal columns (1 to 7)
        let tempCols = [[], [], [], [], [], [], []];
        let deckIdx = 0;
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = fullDeck[deckIdx++];
                if (j === i) card.isFaceUp = true; // top card is face up
                tempCols[j].push(card);
            }
        }

        // 4. Remaining deck in stock
        const tempDeck = fullDeck.slice(deckIdx);

        setDeck(tempDeck);
        setWaste([]);
        setFoundations([[], [], [], []]);
        setColumns(tempCols);
        setSelectedCard(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    // Draw card from stock to waste pile
    const handleDrawCard = () => {
        if (winner) return;
        playClick();
        setSelectedCard(null);

        if (deck.length > 0) {
            const nextDeck = [...deck];
            const card = nextDeck.pop();
            card.isFaceUp = true;
            setWaste([...waste, card]);
            setDeck(nextDeck);
        } else {
            // Recycle waste back to stock
            const nextDeck = waste.map(c => ({ ...c, isFaceUp: false })).reverse();
            setDeck(nextDeck);
            setWaste([]);
        }
    };

    // Select source card
    const handleCardClick = (source, colIdx, cardIdx, e) => {
        if (winner) return;
        e.stopPropagation();

        const card = getCardFromSource(source, colIdx, cardIdx);
        if (!card) return;

        // Reveal card if face down (only allowed on top of columns)
        if (!card.isFaceUp) {
            const col = columns[colIdx];
            if (cardIdx === col.length - 1) {
                playClick();
                const newCols = columns.map((c, idx) => idx === colIdx ? c.map((card, cIdx) => cIdx === cardIdx ? { ...card, isFaceUp: true } : card) : c);
                setColumns(newCols);
            }
            return;
        }

        playClick();

        if (selectedCard === null) {
            // Select card
            setSelectedCard({ source, colIdx, cardIdx });
        } else {
            // Attempt to move selected card stack to this card
            attemptMoveToCard(source, colIdx, cardIdx);
        }
    };

    // Click on empty stack spot to move cards
    const handleEmptySpotClick = (target, colIdx) => {
        if (winner || selectedCard === null) return;
        attemptMoveToEmpty(target, colIdx);
    };

    const getCardFromSource = (source, colIdx, cardIdx) => {
        if (source === 'waste') return waste[waste.length - 1];
        if (source === 'col') return columns[colIdx][cardIdx];
        if (source === 'found') return foundations[colIdx][foundations[colIdx].length - 1];
        return null;
    };

    const attemptMoveToCard = (targetSource, targetColIdx, targetCardIdx) => {
        const sourceCard = getCardFromSource(selectedCard.source, selectedCard.colIdx, selectedCard.cardIdx);
        const targetCard = getCardFromSource(targetSource, targetColIdx, targetCardIdx);

        if (!sourceCard || !targetCard) return;

        // 1. Move to Column
        if (targetSource === 'col') {
            // Must be opposite color and target value must be +1
            const isOppositeColor = sourceCard.suit.isRed !== targetCard.suit.isRed;
            const isValidValue = targetCard.val.num === sourceCard.val.num + 1;
            
            // Destination card must be the top card in that column
            const isTopCard = targetCardIdx === columns[targetColIdx].length - 1;

            if (isOppositeColor && isValidValue && isTopCard) {
                moveCardsToColumn(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
        // 2. Move to Foundation
        else if (targetSource === 'found') {
            // Must be same suit and target value must be -1
            const isSameSuit = sourceCard.suit.name === targetCard.suit.name;
            const isValidValue = targetCard.val.num === sourceCard.val.num - 1;

            if (isSameSuit && isValidValue && selectedCard.source !== 'found') {
                // Moving only 1 card to foundation
                if (selectedCard.source === 'waste' || (selectedCard.source === 'col' && selectedCard.cardIdx === columns[selectedCard.colIdx].length - 1)) {
                    moveCardToFoundation(targetColIdx);
                } else {
                    playErrorSfx();
                    setSelectedCard(null);
                }
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
        else {
            setSelectedCard(null);
        }
    };

    const attemptMoveToEmpty = (targetType, targetColIdx) => {
        const sourceCard = getCardFromSource(selectedCard.source, selectedCard.colIdx, selectedCard.cardIdx);
        if (!sourceCard) return;

        // 1. Empty Column: Only Kings (13) can go there
        if (targetType === 'col') {
            if (sourceCard.val.num === 13) {
                moveCardsToColumn(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
        // 2. Empty Foundation: Only Aces (1) can go there
        else if (targetType === 'found') {
            if (sourceCard.val.num === 1) {
                // Check if only 1 card is being moved
                if (selectedCard.source === 'waste' || (selectedCard.source === 'col' && selectedCard.cardIdx === columns[selectedCard.colIdx].length - 1)) {
                    moveCardToFoundation(targetColIdx);
                } else {
                    playErrorSfx();
                    setSelectedCard(null);
                }
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
    };

    const moveCardsToColumn = (targetColIdx) => {
        playSuccessSfx();
        
        let cardsToMove = [];
        let newCols = columns.map(c => [...c]);
        let newWaste = [...waste];
        let newFounds = foundations.map(f => [...f]);

        // Slice cards
        if (selectedCard.source === 'waste') {
            cardsToMove = [newWaste.pop()];
            setWaste(newWaste);
        } else if (selectedCard.source === 'col') {
            const col = newCols[selectedCard.colIdx];
            cardsToMove = col.slice(selectedCard.cardIdx);
            newCols[selectedCard.colIdx] = col.slice(0, selectedCard.cardIdx);
        } else if (selectedCard.source === 'found') {
            cardsToMove = [newFounds[selectedCard.colIdx].pop()];
            setFoundations(newFounds);
        }

        // Add cards to destination column
        newCols[targetColIdx] = [...newCols[targetColIdx], ...cardsToMove];
        setColumns(newCols);
        setSelectedCard(null);
    };

    const moveCardToFoundation = (targetFoundIdx) => {
        playSuccessSfx();

        let cardToMove = null;
        let newCols = columns.map(c => [...c]);
        let newWaste = [...waste];
        let newFounds = foundations.map(f => [...f]);

        if (selectedCard.source === 'waste') {
            cardToMove = newWaste.pop();
            setWaste(newWaste);
        } else if (selectedCard.source === 'col') {
            const col = newCols[selectedCard.colIdx];
            cardToMove = col.pop();
            newCols[selectedCard.colIdx] = col;
            setColumns(newCols);
        }

        newFounds[targetFoundIdx].push(cardToMove);
        setFoundations(newFounds);
        setSelectedCard(null);

        // Check Win condition (all 4 foundations have 13 cards)
        const isWin = newFounds.every(f => f.length === 13);
        if (isWin) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('solitario', 'medium', timeElapsed);
            setShowVictory(true);
        }
    };

    return (
        <div style={{
            maxWidth: '680px', margin: '20px auto', padding: '20px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center', userSelect: 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Solitario Klondike
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

            {/* Top Deck & Foundations Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                {/* Left: Deck & Waste */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Draw Pile */}
                    <div onClick={handleDrawCard} style={{
                        width: '56px', height: '80px', borderRadius: '8px',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: deck.length > 0 ? 'linear-gradient(135deg, #1e3a8a, #0f172a)' : 'transparent',
                        boxShadow: deck.length > 0 ? '0 4px 6px rgba(0,0,0,0.3)' : 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {deck.length > 0 ? (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }}>🔄</span>
                        ) : (
                            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '1.2rem' }}>∅</span>
                        )}
                    </div>

                    {/* Waste Pile */}
                    <div style={{ position: 'relative', width: '56px', height: '80px' }}>
                        {waste.length > 0 ? (
                            (() => {
                                const card = waste[waste.length - 1];
                                const isSel = selectedCard && selectedCard.source === 'waste';
                                return (
                                    <div
                                        onClick={(e) => handleCardClick('waste', 0, waste.length - 1, e)}
                                        style={{
                                            width: '56px', height: '80px', borderRadius: '8px',
                                            backgroundColor: 'white', color: card.suit.color,
                                            border: isSel ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                            boxShadow: isSel ? '0 0 10px var(--primary)' : '0 4px 6px rgba(0,0,0,0.3)',
                                            display: 'flex', flexDirection: 'column', justifyItems: 'space-between',
                                            padding: '4px', cursor: 'pointer', zIndex: 10
                                        }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</div>
                                        <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</div>
                                    </div>
                                );
                            })()
                        ) : (
                            <div style={{ width: '56px', height: '80px', borderRadius: '8px', border: '1.5px dashed rgba(255,255,255,0.1)' }}></div>
                        )}
                    </div>
                </div>

                {/* Right: 4 Foundations */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {foundations.map((stack, idx) => {
                        const topCard = stack[stack.length - 1];
                        const isSel = selectedCard && selectedCard.source === 'found' && selectedCard.colIdx === idx;
                        return (
                            <div
                                key={idx}
                                onClick={() => handleEmptySpotClick('found', idx)}
                                style={{
                                    width: '56px', height: '80px', borderRadius: '8px',
                                    border: isSel ? '2px solid var(--primary)' : '1.5px dashed rgba(255,255,255,0.15)',
                                    backgroundColor: topCard ? 'white' : 'transparent',
                                    boxShadow: topCard ? '0 4px 6px rgba(0,0,0,0.3)' : 'none',
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                    padding: topCard ? '4px' : 'none',
                                    color: topCard ? topCard.suit.color : 'rgba(255,255,255,0.1)',
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {topCard ? (
                                    <div
                                        onClick={(e) => handleCardClick('found', idx, stack.length - 1, e)}
                                        style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left' }}>{topCard.val.label}</div>
                                        <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{topCard.suit.symbol}</div>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '1.2rem' }}>{SUITS[idx].symbol}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tableau 7 Columns Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', minHeight: '340px' }}>
                {columns.map((col, colIdx) => (
                    <div
                        key={colIdx}
                        onClick={() => handleEmptySpotClick('col', colIdx)}
                        style={{
                            position: 'relative',
                            width: '56px',
                            minHeight: '80px',
                            border: col.length === 0 ? '1.5px dashed rgba(255,255,255,0.08)' : 'none',
                            borderRadius: '8px',
                            cursor: col.length === 0 ? 'pointer' : 'default'
                        }}
                    >
                        {col.map((card, cardIdx) => {
                            const isSel = selectedCard && selectedCard.source === 'col' && selectedCard.colIdx === colIdx && selectedCard.cardIdx === cardIdx;
                            const topOffset = cardIdx * 18;

                            return (
                                <div
                                    key={card.id}
                                    onClick={(e) => handleCardClick('col', colIdx, cardIdx, e)}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${topOffset}px`,
                                        width: '56px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        backgroundColor: card.isFaceUp ? 'white' : '#1e3a8a',
                                        background: card.isFaceUp ? 'white' : 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                                        color: card.isFaceUp ? card.suit.color : 'white',
                                        border: isSel ? '2.5px solid var(--primary)' : '1px solid rgba(0,0,0,0.15)',
                                        boxShadow: isSel ? '0 0 12px var(--primary)' : '0 4px 6px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: card.isFaceUp ? '4px' : 'none',
                                        cursor: 'pointer',
                                        zIndex: cardIdx + 2,
                                        transition: 'transform 0.15s'
                                    }}
                                >
                                    {card.isFaceUp ? (
                                        <>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</div>
                                            <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</div>
                                        </>
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', opacity: 0.1, border: '1px solid white', borderRadius: '6px' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en una carta de origen (se iluminará en azul) y luego haz clic en el destino (otra carta o columna vacía) para mover la pila. Ordena las columnas del Rey al As alternando colores. Apila del As al Rey por palo en las celdas superiores.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Solitario Resuelto!"
                message="Has completado todos los mazos superiores de la baraja."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default KlondikePage;
