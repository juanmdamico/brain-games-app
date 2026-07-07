import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const VALUES = [
    { num: 1, label: 'A' }, { num: 2, label: '2' }, { num: 3, label: '3' },
    { num: 4, label: '4' }, { num: 5, label: '5' }, { num: 6, label: '6' },
    { num: 7, label: '7' }, { num: 8, label: '8' }, { num: 9, label: '9' },
    { num: 10, label: '10' }, { num: 11, label: 'J' }, { num: 12, label: 'Q' },
    { num: 13, label: 'K' }
];

const SpiderPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [deck, setDeck] = useState([]); // stock draw pile
    const [columns, setColumns] = useState([[], [], [], [], [], [], [], []]); // 8 columns
    const [selectedCard, setSelectedCard] = useState(null); // { colIdx, cardIdx }
    const [foundationsCount, setFoundationsCount] = useState(0); // number of completed K-A sequences
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
        // 4 full Spade decks (52 cards total) for Spider Solitaire 1-Suit
        let fullDeck = [];
        for (let deckNum = 0; deckNum < 4; deckNum++) {
            VALUES.forEach(val => {
                fullDeck.push({
                    id: `${deckNum}-${val.num}`,
                    val,
                    isFaceUp: false
                });
            });
        }

        // Shuffle
        fullDeck.sort(() => 0.5 - Math.random());

        // Deal 5 cards to each of the 8 columns (40 cards total)
        let tempCols = [[], [], [], [], [], [], [], []];
        let deckIdx = 0;
        for (let col = 0; col < 8; col++) {
            for (let card = 0; card < 5; card++) {
                const c = fullDeck[deckIdx++];
                if (card === 4) c.isFaceUp = true; // top card is face up
                tempCols[col].push(c);
            }
        }

        // Remaining deck in stock (12 cards total, deals 1 card to 8 cols and then 4 cards left?)
        // Wait, 52 cards total. 40 dealt -> 12 cards left.
        // We have 12 cards in draw pile. That is exactly 1 deal of 8 cards, and then 4 cards left!
        // Actually, let's make it 8 columns of 6 cards = 48 cards, and 56 cards total (wait, 4 decks is 52. Let's make it 52 cards: 5 cards in each of 8 cols = 40. Remaining is 12).
        // Let's deal 1 card to each column.
        const tempDeck = fullDeck.slice(deckIdx);

        setDeck(tempDeck);
        setColumns(tempCols);
        setSelectedCard(null);
        setFoundationsCount(0);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const handleDrawDeckClick = () => {
        if (winner || deck.length === 0) return;
        playClick();
        setSelectedCard(null);

        // Deal 1 card to each of the 8 columns
        const newCols = columns.map(c => [...c]);
        const newDeck = [...deck];

        // Draw cards
        for (let col = 0; col < 8; col++) {
            if (newDeck.length > 0) {
                const card = newDeck.pop();
                card.isFaceUp = true;
                newCols[col].push(card);
            }
        }

        setColumns(newCols);
        setDeck(newDeck);
        checkForCompletedSequences(newCols, foundationsCount);
    };

    const handleCardClick = (colIdx, cardIdx, e) => {
        if (winner) return;
        e.stopPropagation();

        const col = columns[colIdx];
        const card = col[cardIdx];

        if (!card.isFaceUp) {
            // Flip top card if face down (only allowed on top card of column)
            if (cardIdx === col.length - 1) {
                playClick();
                const newCols = columns.map((c, idx) => 
                    idx === colIdx ? c.map((item, itemIdx) => itemIdx === cardIdx ? { ...item, isFaceUp: true } : item) : c
                );
                setColumns(newCols);
            }
            return;
        }

        playClick();

        if (selectedCard === null) {
            // Check if selected card sequence is valid (must be consecutive descending)
            if (isValidSelection(colIdx, cardIdx)) {
                setSelectedCard({ colIdx, cardIdx });
            } else {
                playErrorSfx();
            }
        } else {
            // Attempt to move selected card stack here
            attemptMove(colIdx);
        }
    };

    const handleEmptyColumnClick = (colIdx) => {
        if (winner || selectedCard === null) return;
        attemptMove(colIdx);
    };

    const isValidSelection = (colIdx, cardIdx) => {
        const col = columns[colIdx];
        for (let i = cardIdx; i < col.length - 1; i++) {
            if (col[i].val.num !== col[i+1].val.num + 1) {
                return false; // not consecutive descending
            }
        }
        return true;
    };

    const attemptMove = (targetColIdx) => {
        const sourceCol = columns[selectedCard.colIdx];
        const targetCol = columns[targetColIdx];
        
        const sourceCard = sourceCol[selectedCard.cardIdx];
        
        let valid = false;

        // Empty column accepts any card
        if (targetCol.length === 0) {
            valid = true;
        } else {
            const targetCard = targetCol[targetCol.length - 1];
            // Source card value must be exactly target card value - 1
            if (sourceCard.val.num === targetCard.val.num - 1) {
                valid = true;
            }
        }

        if (valid) {
            playSuccessSfx();
            const newCols = columns.map(c => [...c]);
            const cardsToMove = newCols[selectedCard.colIdx].slice(selectedCard.cardIdx);
            
            // Slice source column
            newCols[selectedCard.colIdx] = newCols[selectedCard.colIdx].slice(0, selectedCard.cardIdx);
            // Append to target column
            newCols[targetColIdx] = [...newCols[targetColIdx], ...cardsToMove];

            setColumns(newCols);
            setSelectedCard(null);

            // Check completed sequences
            checkForCompletedSequences(newCols, foundationsCount);
        } else {
            playErrorSfx();
            setSelectedCard(null);
        }
    };

    const checkForCompletedSequences = (currentCols, currentFounds) => {
        let newCols = currentCols.map(c => [...c]);
        let completed = 0;

        for (let colIdx = 0; colIdx < 8; colIdx++) {
            const col = newCols[colIdx];
            if (col.length < 13) continue;

            // Search from bottom up for K-A sequence
            for (let i = col.length - 13; i <= col.length - 13; i++) {
                if (i < 0) continue;
                let isSeq = true;
                for (let k = 0; k < 12; k++) {
                    if (col[i + k].isFaceUp && col[i + k].val.num === col[i + k + 1].val.num + 1) {
                        // valid step
                    } else {
                        isSeq = false;
                        break;
                    }
                }

                // If K-A sequence is completed (values: 13 down to 1)
                if (isSeq && col[i].val.num === 13) {
                    completed++;
                    // Remove sequence
                    newCols[colIdx] = col.slice(0, i);
                    // Reveal new top card of column
                    const lastIdx = newCols[colIdx].length - 1;
                    if (lastIdx >= 0) {
                        newCols[colIdx][lastIdx].isFaceUp = true;
                    }
                    break;
                }
            }
        }

        if (completed > 0) {
            const nextFounds = currentFounds + completed;
            setFoundationsCount(nextFounds);
            setColumns(newCols);

            // Win condition (4 complete decks of Spades)
            if (nextFounds === 4) {
                setWinner(true);
                playVictorySfx();
                registerGameCompletion('spider', 'medium', timeElapsed);
                setShowVictory(true);
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
            maxWidth: '680px', margin: '20px auto', padding: '20px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center', userSelect: 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Solitario Spider (1 Palo)
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

            {/* Foundations Score HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
                <span>Mazos completados: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{foundationsCount} / 4</strong></span>
                <div onClick={handleDrawDeckClick} style={{
                    cursor: deck.length > 0 ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mazo auxiliar:</span>
                    <div style={{
                        width: '32px', height: '44px', borderRadius: '4px',
                        background: deck.length > 0 ? 'linear-gradient(135deg, #1e3a8a, #0f172a)' : 'transparent',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        boxShadow: deck.length > 0 ? '0 3px 5px rgba(0,0,0,0.3)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {deck.length > 0 ? <span style={{ fontSize: '0.8rem' }}>🔀</span> : <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.1)' }}>∅</span>}
                    </div>
                </div>
            </div>

            {/* 8 tableau columns */}
            <div style={{ display: 'flex', justifyContent: 'space-between', minHeight: '340px' }}>
                {columns.map((col, colIdx) => (
                    <div
                        key={colIdx}
                        onClick={() => handleEmptyColumnClick(colIdx)}
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
                            const isSel = selectedCard && selectedCard.colIdx === colIdx && selectedCard.cardIdx <= cardIdx;
                            const topOffset = cardIdx * 18;

                            return (
                                <div
                                    key={card.id}
                                    onClick={(e) => handleCardClick(colIdx, cardIdx, e)}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: `${topOffset}px`,
                                        width: '56px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        backgroundColor: card.isFaceUp ? 'white' : '#1e3a8a',
                                        background: card.isFaceUp ? 'white' : 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                                        color: card.isFaceUp ? '#94a3b8' : 'white',
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
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'left', color: '#0f172a' }}>{card.val.label}</div>
                                            <div style={{ fontSize: '1.5rem', alignSelf: 'center', marginTop: '-4px', color: '#0f172a' }}>♠</div>
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
                <span>Haz clic en una carta o secuencia (se iluminará en azul) y haz clic en la columna de destino para moverla. Solo puedes mover secuencias consecutivas descendentes de picas. Forma secuencias completas del Rey (K) al As (A) para retirarlas del tablero.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Telaraña Despejada!"
                message="Has completado los 4 mazos de picas del Solitario Spider."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default SpiderPage;
