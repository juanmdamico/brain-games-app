import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SYMBOLS = ['🏮', '🐉', '🎋', '🪕', '🏯', '🥋', '🉐', '🐼'];

const MahjongPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [tiles, setTiles] = useState([]); // Array of { id, symbol, layer, r, c, active: bool }
    const [selectedTileId, setSelectedTileId] = useState(null);
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
        // Generate 16 tiles (2 of each symbol)
        const doubleSymbols = [...SYMBOLS, ...SYMBOLS];
        // Shuffle
        doubleSymbols.sort(() => 0.5 - Math.random());

        const tempTiles = [];
        let symIdx = 0;

        // Layer 0 (Bottom): 12 tiles in a 3x4 grid
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                tempTiles.push({
                    id: `0-${r}-${c}`,
                    symbol: doubleSymbols[symIdx++],
                    layer: 0,
                    r, c,
                    active: true
                });
            }
        }

        // Layer 1 (Top): 4 tiles centered on top of col 1-2, row 0-1
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 2; c++) {
                tempTiles.push({
                    id: `1-${r}-${c}`,
                    symbol: doubleSymbols[symIdx++],
                    layer: 1,
                    r, c,
                    active: true
                });
            }
        }

        setTiles(tempTiles);
        setSelectedTileId(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    // Determine if tile is "free"
    const isTileFree = (tile, currentTiles) => {
        if (!tile.active) return false;

        // 1. Check if covered by top layer
        if (tile.layer === 0) {
            // Covered if there's any active tile in Layer 1 that overlaps
            // Since Layer 1 (size 2x2) sits centered over Layer 0 (size 3x4),
            // Layer 1 tile (r, c) sits on top of Layer 0 (r+0.5, c+1) approx.
            // Let's say:
            // Layer 1 (0,0) covers Layer 0 (0,1), (0,2), (1,1), (1,2)
            // Layer 1 (0,1) covers Layer 0 (0,2), (0,3), (1,2), (1,3)
            // Layer 1 (1,0) covers Layer 0 (1,1), (1,2), (2,1), (2,2)
            // Layer 1 (1,1) covers Layer 0 (1,2), (1,3), (2,2), (2,3)
            const overlap = currentTiles.some(t => {
                if (t.layer === 1 && t.active) {
                    const rowMatch = (t.r === 0 && tile.r <= 1) || (t.r === 1 && tile.r >= 1);
                    const colMatch = (t.c === 0 && tile.c >= 1 && tile.c <= 2) || (t.c === 1 && tile.c >= 2 && tile.c <= 3);
                    return rowMatch && colMatch;
                }
                return false;
            });
            if (overlap) return false;
        }

        // 2. Check left/right side blocks
        // Free on side if no left neighbor OR no right neighbor in the same layer
        const leftNeighbor = currentTiles.find(t => t.layer === tile.layer && t.active && t.r === tile.r && t.c === tile.c - 1);
        const rightNeighbor = currentTiles.find(t => t.layer === tile.layer && t.active && t.r === tile.r && t.c === tile.c + 1);

        return !leftNeighbor || !rightNeighbor;
    };

    const handleTileClick = (tileId) => {
        if (winner) return;

        const tile = tiles.find(t => t.id === tileId);
        if (!tile || !isTileFree(tile, tiles)) {
            playErrorSfx();
            return;
        }

        playClick();

        if (selectedTileId === null) {
            setSelectedTileId(tileId);
        } else if (selectedTileId === tileId) {
            setSelectedTileId(null);
        } else {
            const firstTile = tiles.find(t => t.id === selectedTileId);
            if (firstTile.symbol === tile.symbol) {
                // Match! Remove both
                playSuccessSfx();
                const nextTiles = tiles.map(t => {
                    if (t.id === selectedTileId || t.id === tileId) {
                        return { ...t, active: false };
                    }
                    return t;
                });
                setTiles(nextTiles);
                setSelectedTileId(null);

                // Check Win
                if (nextTiles.every(t => !t.active)) {
                    setWinner(true);
                    playVictorySfx();
                    registerGameCompletion('mahjong', 'medium', timeElapsed);
                    setShowVictory(true);
                }
            } else {
                // Mismatch
                playErrorSfx();
                setSelectedTileId(null);
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
            maxWidth: '520px', margin: '30px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    Mahjong Solitaire
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

            {/* Board Container */}
            <div style={{
                position: 'relative',
                width: '320px', height: '240px',
                margin: '0 auto 20px auto',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                boxSizing: 'border-box'
            }}>
                {/* Render Layer 0 (Bottom) */}
                {tiles.filter(t => t.layer === 0 && t.active).map(tile => {
                    const isSelected = selectedTileId === tile.id;
                    const free = isTileFree(tile, tiles);

                    const x = 12.5 + tile.c * 25;
                    const y = 16.5 + tile.r * 33;

                    return (
                        <button
                            key={tile.id}
                            onClick={() => handleTileClick(tile.id)}
                            style={{
                                position: 'absolute',
                                left: `${x}%`, top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '42px', height: '54px',
                                borderRadius: '6px',
                                border: isSelected 
                                    ? '2.5px solid var(--primary)' 
                                    : '1px solid #d1d5db',
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#fff',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                                fontSize: '1.6rem',
                                cursor: free ? 'pointer' : 'not-allowed',
                                opacity: free ? 1 : 0.4,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                                zIndex: 1
                            }}
                        >
                            {tile.symbol}
                        </button>
                    );
                })}

                {/* Render Layer 1 (Top) */}
                {tiles.filter(t => t.layer === 1 && t.active).map(tile => {
                    const isSelected = selectedTileId === tile.id;
                    const free = isTileFree(tile, tiles);

                    // Centered over cols 1-2, rows 0.5-1.5
                    const x = 25 + tile.c * 25 + 12.5;
                    const y = 33 + tile.r * 33;

                    return (
                        <button
                            key={tile.id}
                            onClick={() => handleTileClick(tile.id)}
                            style={{
                                position: 'absolute',
                                left: `${x}%`, top: `${y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '42px', height: '54px',
                                borderRadius: '6px',
                                border: isSelected 
                                    ? '2.5px solid var(--primary)' 
                                    : '1.5px solid #9ca3af',
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#f3f4f6',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                                fontSize: '1.6rem',
                                cursor: free ? 'pointer' : 'not-allowed',
                                opacity: free ? 1 : 0.4,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                                zIndex: 2
                            }}
                        >
                            {tile.symbol}
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en las tejas libres para seleccionarlas. Una teja está libre si no tiene ninguna teja arriba y además tiene libre el lado izquierdo o derecho. Encuentra y empareja las tejas idénticas para despejar todo el tablero.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Tablero Despejado!"
                message="Has eliminado todas las tejas de Mahjong de forma perfecta."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default MahjongPage;
