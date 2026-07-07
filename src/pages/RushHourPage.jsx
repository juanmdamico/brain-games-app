import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw } from 'lucide-react';

const SIZE = 6;

// Initial vehicles setup
const INITIAL_VEHICLES = [
    { id: 'red', color: '#ef4444', isHorizontal: true, size: 2, r: 2, c: 1 }, // target red car
    { id: 'v1', color: '#3b82f6', isHorizontal: false, size: 3, r: 0, c: 3 }, // blue truck
    { id: 'h1', color: '#10b981', isHorizontal: true, size: 2, r: 4, c: 2 }, // green car
    { id: 'v2', color: '#a855f7', isHorizontal: false, size: 2, r: 3, c: 0 }, // purple car
    { id: 'h2', color: '#fbbf24', isHorizontal: true, size: 3, r: 5, c: 1 }  // yellow truck
];

const RushHourPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [vehicles, setVehicles] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
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
        setVehicles(INITIAL_VEHICLES.map(v => ({ ...v })));
        setSelectedId(null);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    // Helper to get grid matrix representation
    const getGridMatrix = (currentVehicles) => {
        const matrix = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        currentVehicles.forEach(v => {
            for (let i = 0; i < v.size; i++) {
                const row = v.r + (v.isHorizontal ? 0 : i);
                const col = v.c + (v.isHorizontal ? i : 0);
                matrix[row][col] = v.id;
            }
        });
        return matrix;
    };

    const handleCellClick = (r, c) => {
        if (winner) return;

        const matrix = getGridMatrix(vehicles);
        const cellVal = matrix[r][c];

        // Click on a vehicle to select it
        if (cellVal !== null) {
            playClick();
            setSelectedId(cellVal);
            return;
        }

        // Clicking empty cell: attempt to move selected vehicle here
        if (selectedId === null) return;

        const vehicle = vehicles.find(v => v.id === selectedId);
        if (!vehicle) return;

        if (attemptMove(vehicle, r, c, matrix)) {
            playSuccessSfx();
        } else {
            playErrorSfx();
        }
    };

    const attemptMove = (vehicle, r, c, matrix) => {
        const isH = vehicle.isHorizontal;

        // Must click in the same alignment line
        if (isH && vehicle.r !== r) return false;
        if (!isH && vehicle.c !== c) return false;

        // Path must be empty between current position and target coordinate
        const minC = Math.min(vehicle.c, c);
        const maxC = Math.max(vehicle.c + (isH ? vehicle.size - 1 : 0), c);
        const minR = Math.min(vehicle.r, r);
        const maxR = Math.max(vehicle.r + (isH ? 0 : vehicle.size - 1), r);

        // Verify if any other vehicle blocks the path
        for (let row = minR; row <= maxR; row++) {
            for (let col = minC; col <= maxC; col++) {
                const occupant = matrix[row][col];
                if (occupant !== null && occupant !== vehicle.id) {
                    return false; // blocked!
                }
            }
        }

        // Apply slide move
        const nextVehicles = vehicles.map(v => {
            if (v.id === vehicle.id) {
                // Adjust position
                let nextC = v.c;
                let nextR = v.r;

                if (isH) {
                    // Click can be either left or right of the car.
                    // If clicking left: new head is c.
                    // If clicking right: new tail is c -> head is c - size + 1.
                    if (c < v.c) nextC = c;
                    else nextC = c - v.size + 1;
                } else {
                    if (r < v.r) nextR = r;
                    else nextR = r - v.size + 1;
                }

                // Check grid limits
                if (nextC < 0 || nextC + (isH ? v.size : 1) > SIZE) return v;
                if (nextR < 0 || nextR + (isH ? 1 : v.size) > SIZE) return v;

                return { ...v, r: nextR, c: nextC };
            }
            return v;
        });

        setVehicles(nextVehicles);

        // Check Win (Red car hits the right edge col 5: r: 2, c: 4, size 2 covers col 4 and 5)
        const redCar = nextVehicles.find(v => v.id === 'red');
        if (redCar && redCar.c === 4) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('rushhour', 'medium', timeElapsed);
            setShowVictory(true);
        }

        return true;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const matrix = getGridMatrix(vehicles);

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
                    Rush Hour (Atasco)
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

            {/* Hint selection */}
            <div style={{ marginBottom: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedId !== null ? (
                    <span>Vehículo seleccionado. Haz clic en un espacio vacío para deslizarlo.</span>
                ) : (
                    <span>Haz clic en un vehículo para seleccionarlo</span>
                )}
            </div>

            {/* Board */}
            <div style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)',
                marginBottom: '20px'
            }}>
                {/* Exit laser arrow indicator */}
                <div style={{
                    position: 'absolute', right: '-4px', top: '108px',
                    color: '#ef4444', fontWeight: 'bold', fontSize: '1.4rem',
                    textShadow: '0 0 10px #ef4444', zIndex: 10, animation: 'pulse 1.5s infinite'
                }}>
                    ➔
                </div>

                {Array(SIZE).fill(null).map((_, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                        {Array(SIZE).fill(null).map((_, c) => {
                            const vehicleId = matrix[r][c];
                            const vehicle = vehicles.find(v => v.id === vehicleId);
                            const isSelected = selectedId === vehicleId;

                            let bg = 'rgba(255, 255, 255, 0.01)';
                            let border = '1px solid rgba(255,255,255,0.02)';
                            let shadow = 'none';

                            if (vehicle) {
                                bg = vehicle.color;
                                border = isSelected ? '2.5px solid white' : '1px solid rgba(255,255,255,0.15)';
                                shadow = isSelected ? `0 0 15px ${vehicle.color}` : 'none';
                            }

                            return (
                                <button
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        width: '44px', height: '44px', margin: '2px',
                                        backgroundColor: bg, border,
                                        borderRadius: '8px',
                                        boxShadow: shadow,
                                        cursor: winner ? 'default' : 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => !vehicle && selectedId !== null && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                                    onMouseOut={e => !vehicle && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)')}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en un vehículo para seleccionarlo, luego haz clic en una casilla vacía en su línea para deslizarlo. Los coches horizontales se mueven en horizontal, y los verticales en vertical. Libera el coche rojo llevándolo hasta la salida del lado derecho.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Coche Liberado!"
                message="Has liberado el coche rojo esquivando el tráfico pesado."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default RushHourPage;
