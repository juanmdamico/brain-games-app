import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { getShuffledCards } from '../components/MemoryMatch/memoryLogic';

const MemoryMatchPage = () => {
    const [difficulty, setDifficulty] = useState('easy'); // easy: 12 cards, medium: 20 cards, hard: 30 cards
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // UX Polish State
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(0);

    const startNewGame = useCallback(() => {
        setCards(getShuffledCards(difficulty));
        setFlippedIndices([]);
        setMoves(0);
        setIsLocked(false);
        setTimerRunning(true);
        setResetTrigger(prev => prev + 1);
        setShowVictory(false);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCardClick = (index) => {
        if (isLocked) return;
        if (cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsLocked(true);
            setMoves(m => m + 1);
            
            const [firstIndex, secondIndex] = newFlippedIndices;
            
            if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
                // Match
                setTimeout(() => {
                    setCards(prev => {
                        const updated = [...prev];
                        updated[firstIndex].isMatched = true;
                        updated[secondIndex].isMatched = true;
                        return updated;
                    });
                    setFlippedIndices([]);
                    setIsLocked(false);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setCards(prev => {
                        const updated = [...prev];
                        updated[firstIndex].isFlipped = false;
                        updated[secondIndex].isFlipped = false;
                        return updated;
                    });
                    setFlippedIndices([]);
                    setIsLocked(false);
                }, 1000);
            }
        }
    };

    // Check win condition
    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setTimerRunning(false);
            setTimeout(() => {
                setShowVictory(true);
            }, 500);
        }
    }, [cards]);

    const gridColumns = difficulty === 'easy' ? 4 : (difficulty === 'medium' ? 5 : 6);

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
            <div className="background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
                <div className="glow-orb orb-3"></div>
            </div>

            <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px', zIndex: 10 }}>
                <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
                    &larr; Volver al Hub
                </Link>
            </div>

            <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '800px', width: '100%' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
                        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Movimientos: <span style={{color: 'white'}}>{moves}</span></div>
                    </div>
                    
                    <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Memory Match
                    </h1>
                    <button 
                        onClick={() => setShowInstructions(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ec4899', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <HelpCircle size={28} />
                    </button>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', perspective: '1000px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                        gap: '12px',
                        width: '100%',
                        maxWidth: '600px'
                    }}>
                        {cards.map((card, index) => (
                            <div 
                                key={card.id}
                                onClick={() => handleCardClick(index)}
                                style={{
                                    aspectRatio: '3/4',
                                    position: 'relative',
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 0.5s',
                                    transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    cursor: card.isFlipped || card.isMatched ? 'default' : 'pointer'
                                }}
                            >
                                {/* Front of card (Hidden state) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden',
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.02) 75%, transparent 75%, transparent)',
                                    backgroundSize: '20px 20px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}>
                                    <div style={{ width: '40%', height: '40%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                                </div>
                                
                                {/* Back of card (Revealed state) */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden',
                                    backgroundColor: card.isMatched ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    border: `2px solid ${card.isMatched ? '#10b981' : '#3b82f6'}`,
                                    borderRadius: '12px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    transform: 'rotateY(180deg)',
                                    fontSize: '3rem',
                                    boxShadow: card.isMatched ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
                                    transition: 'box-shadow 0.3s'
                                }}>
                                    {card.emoji}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <GameControls 
                    difficultyOptions={[
                        {value: 'easy', label: 'Fácil (12 cartas)'},
                        {value: 'medium', label: 'Medio (20 cartas)'},
                        {value: 'hard', label: 'Difícil (30 cartas)'}
                    ]}
                    currentDifficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    onNewGame={startNewGame}
                />
            </div>

            <InstructionsModal 
                isOpen={showInstructions}
                onClose={() => setShowInstructions(false)}
                title="Memory Match"
                instructions={[
                    "Encuentra todos los pares de cartas coincidentes.",
                    "Haz clic en una carta para voltearla.",
                    "Si las dos cartas volteadas son iguales, permanecerán descubiertas.",
                    "Si son diferentes, volverán a ocultarse.",
                    "Completa el tablero en el menor tiempo y con la menor cantidad de movimientos posibles."
                ]}
            />
            
            <VictoryModal 
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                time={time}
                gameName="Memory Match"
            />
        </div>
    );
};

export default MemoryMatchPage;
