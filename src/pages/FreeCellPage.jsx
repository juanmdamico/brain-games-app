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

const FreeCellPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [freeCells, setFreeCells] = useState([null, null, null, null]); // 4 slots
    const [foundations, setFoundations] = useState([[], [], [], []]); // 4 stacks
    const [columns, setColumns] = useState([[], [], [], [], [], [], [], []]); // 8 columns
    const [selectedCard, setSelectedCard] = useState(null); // { source: 'col'|'free', colIdx: Number, cardIdx: Number }
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
        // Generate deck
        let fullDeck = [];
        SUITS.forEach((suit, sIdx) => {
            VALUES.forEach(val => {
                fullDeck.push({
                    id: `${sIdx}-${val.num}`,
                    suit, val,
                    isFaceUp: true // all face up in FreeCell!
                });
            });
        });

        // Shuffle
        fullDeck.sort(() => 0.5 - Math.random());

        // Deal to 8 columns:
        // Col 0-3 get 7 cards, Col 4-7 get 6 cards (total 52 cards)
        let tempCols = [[], [], [], [], [], [], [], []];
        let deckIdx = 0;
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 8; c++) {
                if (deckIdx < 52) {
                    tempCols[c].push(fullDeck[deckIdx++]);
                }
            }
        }

        setFreeCells([null, null, null, null]);
        setFoundations([[], [], [], []]);
        setColumns(tempCols);
        setSelectedCard(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const getCardFromSource = (source, colIdx) => {
        if (source === 'free') return freeCells[colIdx];
        if (source === 'col') return columns[colIdx][columns[colIdx].length - 1]; // top card only
        return null;
    };

    const handleCardClick = (source, colIdx, e) => {
        if (winner) return;
        e.stopPropagation();

        const card = getCardFromSource(source, colIdx);
        if (!card) return;

        playClick();

        if (selectedCard === null) {
            setSelectedCard({ source, colIdx });
        } else {
            attemptMoveToCard(source, colIdx);
        }
    };

    const handleEmptySpotClick = (target, colIdx) => {
        if (winner || selectedCard === null) return;
        attemptMoveToEmpty(target, colIdx);
    };

    const attemptMoveToCard = (targetSource, targetColIdx) => {
        const sourceCard = getCardFromSource(selectedCard.source, selectedCard.colIdx);
        const targetCard = getCardFromSource(targetSource, targetColIdx);

        if (!sourceCard || !targetCard) return;

        // 1. Move to Column
        if (targetSource === 'col') {
            const isOppositeColor = sourceCard.suit.isRed !== targetCard.suit.isRed;
            const isValidValue = targetCard.val.num === sourceCard.val.num + 1;

            if (isOppositeColor && isValidValue) {
                moveCardToColumn(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
        // 2. Move to Foundation
        else if (targetSource === 'found') {
            const isSameSuit = sourceCard.suit.name === targetCard.suit.name;
            const isValidValue = targetCard.val.num === sourceCard.val.num - 1;

            if (isSameSuit && isValidValue) {
                moveCardToFoundation(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        } else {
            setSelectedCard(null);
        }
    };

    const attemptMoveToEmpty = (targetType, targetColIdx) => {
        const sourceCard = getCardFromSource(selectedCard.source, selectedCard.colIdx);
        if (!sourceCard) return;

        // 1. Empty Column accepts any card
        if (targetType === 'col') {
            moveCardToColumn(targetColIdx);
        }
        // 2. Empty FreeCell accepts any card
        else if (targetType === 'free') {
            if (freeCells[targetColIdx] === null) {
                moveCardToFreeCell(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
        // 3. Empty Foundation accepts Aces (1)
        else if (targetType === 'found') {
            if (sourceCard.val.num === 1) {
                moveCardToFoundation(targetColIdx);
            } else {
                playErrorSfx();
                setSelectedCard(null);
            }
        }
    };

    const popCardFromSource = (newCols, newFreeCells) => {
        let card = null;
        if (selectedCard.source === 'free') {
            card = newFreeCells[selectedCard.colIdx];
            newFreeCells[selectedCard.colIdx] = null;
        } else if (selectedCard.source === 'col') {
            card = newCols[selectedCard.colIdx].pop();
        }
        return card;
    };

    const moveCardToColumn = (targetColIdx) => {
        playSuccessSfx();
        const newCols = columns.map(c => [...c]);
        const newFreeCells = [...freeCells];

        const card = popCardFromSource(newCols, newFreeCells);
        newCols[targetColIdx].push(card);

        setColumns(newCols);
        setFreeCells(newFreeCells);
        setSelectedCard(null);
    };

    const moveCardToFreeCell = (targetFreeIdx) => {
        playSuccessSfx();
        const newCols = columns.map(c => [...c]);
        const newFreeCells = [...freeCells];

        const card = popCardFromSource(newCols, newFreeCells);
        newFreeCells[targetFreeIdx] = card;

        setColumns(newCols);
        setFreeCells(newFreeCells);
        setSelectedCard(null);
    };

    const moveCardToFoundation = (targetFoundIdx) => {
        playSuccessSfx();
        const newCols = columns.map(c => [...c]);
        const newFreeCells = [...freeCells];
        const newFounds = foundations.map(f => [...f]);

        const card = popCardFromSource(newCols, newFreeCells);
        newFounds[targetFoundIdx].push(card);

        setColumns(newCols);
        setFreeCells(newFreeCells);
        setFoundations(newFounds);
        setSelectedCard(null);

        // Win check (all 4 foundations have 13 cards)
        if (newFounds.every(f => f.length === 13)) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('freecell', 'medium', timeElapsed);
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
            maxWidth: '680px', margin: '20px auto', padding: '20px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center', userSelect: 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Carta Blanca (FreeCell)
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

            {/* Top Area: 4 FreeCells (Left) & 4 Foundations (Right) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                {/* Left: FreeCells */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {freeCells.map((card, idx) => {
                        const isSel = selectedCard && selectedCard.source === 'free' && selectedCard.colIdx === idx;
                        return (
                            <div
                                key={idx}
                                onClick={() => handleEmptySpotClick('free', idx)}
                                style={{
                                    width: '56px', height: '80px', borderRadius: '8px',
                                    border: isSel ? '2px solid var(--primary)' : '1.5px dashed rgba(255,255,255,0.15)',
                                    backgroundColor: card ? 'white' : 'transparent',
                                    boxShadow: card ? '0 4px 6px rgba(0,0,0,0.3)' : 'none',
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                    padding: card ? '4px' : 'none',
                                    color: card ? card.suit.color : 'rgba(255,255,255,0.1)',
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {card ? (
                                    <div
                                        onClick={(e) => handleCardClick('free', idx, e)}
                                        style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</div>
                                        <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</div>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.08)' }}>Celda</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right: Foundations */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {foundations.map((stack, idx) => {
                        const topCard = stack[stack.length - 1];
                        return (
                            <div
                                key={idx}
                                onClick={() => handleEmptySpotClick('found', idx)}
                                style={{
                                    width: '56px', height: '80px', borderRadius: '8px',
                                    border: '1.5px dashed rgba(255,255,255,0.15)',
                                    backgroundColor: topCard ? 'white' : 'transparent',
                                    boxShadow: topCard ? '0 4px 6px rgba(0,0,0,0.3)' : 'none',
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                    padding: topCard ? '4px' : 'none',
                                    color: topCard ? topCard.suit.color : 'rgba(255,255,255,0.1)',
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {topCard ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
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

            {/* 8 Columns Area */}
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
                            const isTopCard = cardIdx === col.length - 1;
                            const isSel = selectedCard && selectedCard.source === 'col' && selectedCard.colIdx === colIdx && isTopCard;
                            const topOffset = cardIdx * 18;

                            return (
                                <div
                                    key={card.id}
                                    onClick={(e) => isTopCard && handleCardClick('col', colIdx, e)}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${topOffset}px`,
                                        width: '56px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        color: card.suit.color,
                                        border: isSel ? '2.5px solid var(--primary)' : '1px solid rgba(0,0,0,0.15)',
                                        boxShadow: isSel ? '0 0 12px var(--primary)' : '0 4px 6px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '4px',
                                        cursor: isTopCard ? 'pointer' : 'default',
                                        zIndex: cardIdx + 2,
                                        transition: 'transform 0.15s'
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left' }}>{card.val.label}</div>
                                    <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px' }}>{card.suit.symbol}</div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en la carta superior de una columna o de una celda (se iluminará en azul) y haz clic en el destino para moverla. Las 4 celdas izquierdas pueden guardar 1 carta temporalmente. Ordena del Rey al As alternando colores en columnas, o del As al Rey en foundations superiores.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Desafío Carta Blanca Superado!"
                message="Has completado todos los palos en las foundations superiores."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default FreeCellPage;
