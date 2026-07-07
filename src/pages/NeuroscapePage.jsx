import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { Brain, Heart, Shield, Award, Zap, RefreshCw, Trophy } from 'lucide-react';

const ENEMIES = [
    { name: 'Distracción Fugaz', hp: 40, maxHp: 40, attack: 10, timerMax: 8, color: '#06b6d4', icon: '🌀' },
    { name: 'Niebla Mental', hp: 60, maxHp: 60, attack: 15, timerMax: 10, color: '#a855f7', icon: '🌫️' },
    { name: 'Bloqueo Crítico (Jefe)', hp: 100, maxHp: 100, attack: 25, timerMax: 12, color: '#f43f5e', icon: '🌋' }
];

const UPGRADES_POOL = [
    { id: 'hp', name: 'Neuro-Mielina (+20 HP Max)', description: 'Incrementa tus puntos de salud máximos en 20.', effect: (state) => { state.playerMaxHp += 20; state.playerHp += 20; } },
    { id: 'damage', name: 'Sinapsis Veloz (+5 Daño)', description: 'Tus ataques lógicos infligen 5 puntos más de daño.', effect: (state) => { state.playerDmg += 5; } },
    { id: 'shield', name: 'Célula Glial (+10 Escudo)', description: 'Comienzas cada combate con 10 puntos de escudo.', effect: (state) => { state.playerShieldMax += 10; } }
];

const NeuroscapePage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();

    // Player stats
    const [playerHp, setPlayerHp] = useState(80);
    const [playerMaxHp, setPlayerMaxHp] = useState(80);
    const [playerDmg, setPlayerDmg] = useState(20);
    const [playerShield, setPlayerShield] = useState(0);
    const [playerShieldMax, setPlayerShieldMax] = useState(0);
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);

    // Dungeon stats
    const [floorIdx, setFloorIdx] = useState(0);
    const [enemy, setEnemy] = useState(ENEMIES[0]);
    const [enemyTimer, setEnemyTimer] = useState(ENEMIES[0].timerMax);
    const [gameState, setGameState] = useState('combat'); // 'combat', 'upgrade-selection', 'won', 'lost'
    const [combatLog, setCombatLog] = useState('¡Una Distracción Fugaz bloquea tu camino!');

    // Active puzzle card selection
    const [activePuzzle, setActivePuzzle] = useState(null); // 'logic' | 'memory' | 'reflex'
    const [puzzleData, setPuzzleData] = useState(null);
    const [puzzleAnswer, setPuzzleAnswer] = useState('');
    const [showVictory, setShowVictory] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());

    // Game loop timers
    useEffect(() => {
        if (gameState !== 'combat') return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, gameState]);

    // Active combat enemy countdown timer loop
    useEffect(() => {
        if (gameState !== 'combat' || activePuzzle !== null) return;

        const interval = setInterval(() => {
            setEnemyTimer(prev => {
                if (prev <= 1) {
                    // Enemy attacks!
                    triggerEnemyAttack();
                    return enemy.timerMax;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, enemy, activePuzzle]);

    const triggerEnemyAttack = () => {
        playErrorSfx();
        setPlayerHp(prev => {
            const next = Math.max(0, prev - enemy.attack);
            if (next === 0) {
                setGameState('lost');
            }
            return next;
        });
        setCombatLog(`💥 ¡El enemigo usa ${enemy.name} e inflige ${enemy.attack} de daño!`);
    };

    const initGame = () => {
        setPlayerHp(80);
        setPlayerMaxHp(80);
        setPlayerDmg(20);
        setPlayerShield(0);
        setPlayerShieldMax(0);
        setXp(0);
        setLevel(1);
        setFloorIdx(0);
        loadEnemy(0);
        setGameState('combat');
        setCombatLog('¡Una Distracción Fugaz bloquea tu camino!');
        setActivePuzzle(null);
        setStartTime(Date.now());
        setTimeElapsed(0);
    };

    const loadEnemy = (idx) => {
        const nextEnemy = { ...ENEMIES[idx] };
        setEnemy(nextEnemy);
        setEnemyTimer(nextEnemy.timerMax);
        setPlayerShield(playerShieldMax);
    };

    const handleSelectCard = (type) => {
        if (gameState !== 'combat' || activePuzzle !== null) return;
        playClick();
        setActivePuzzle(type);

        if (type === 'logic') {
            // Generate a simple math sum puzzle: target sum from 3 random numbers
            const nums = [
                Math.floor(Math.random() * 8) + 2,
                Math.floor(Math.random() * 8) + 2,
                Math.floor(Math.random() * 8) + 2
            ];
            const sum = nums.reduce((a, b) => a + b, 0);
            setPuzzleData({ nums, target: sum });
            setCombatLog('Rayo Lógico: Suma todos los números para infligir daño.');
        } else if (type === 'memory') {
            // Generate a quick digit sequence to memorize
            const seq = Array(4).fill(null).map(() => Math.floor(Math.random() * 9) + 1).join('');
            setPuzzleData({ sequence: seq, show: true });
            setCombatLog('Barrera de Memoria: Memoriza el código secreto.');
            
            // Hide sequence after 2.5 seconds
            setTimeout(() => {
                setPuzzleData(prev => prev ? { ...prev, show: false } : null);
            }, 2500);
        } else if (type === 'reflex') {
            // Click the floating target button within 2 seconds
            const randPos = {
                x: Math.floor(Math.random() * 60) + 20,
                y: Math.floor(Math.random() * 60) + 20
            };
            setPuzzleData({ pos: randPos });
            setCombatLog('Dardo de Reflejos: ¡Pica el sensor de sinapsis antes de que expire!');
        }
    };

    const handleSubmitAnswer = (e) => {
        if (e) e.preventDefault();
        if (!puzzleData) return;

        let correct = false;

        if (activePuzzle === 'logic') {
            correct = parseInt(puzzleAnswer) === puzzleData.target;
        } else if (activePuzzle === 'memory') {
            correct = puzzleAnswer === puzzleData.sequence;
        }

        resolvePuzzleResult(correct);
    };

    const handleReflexClick = () => {
        resolvePuzzleResult(true);
    };

    const resolvePuzzleResult = (success) => {
        setActivePuzzle(null);
        setPuzzleAnswer('');
        setPuzzleData(null);

        if (success) {
            playSuccessSfx();
            // Deal damage to enemy
            const dmg = playerDmg;
            const nextHp = Math.max(0, enemy.hp - dmg);
            setEnemy(prev => ({ ...prev, hp: nextHp }));
            setCombatLog(`✨ ¡Éxito! Canalizas energía cognitiva e infliges ${dmg} puntos de daño a ${enemy.name}.`);

            if (nextHp === 0) {
                // Enemy defeated!
                handleEnemyDefeated();
            }
        } else {
            playErrorSfx();
            // Failed puzzle counts as immediate enemy counter-attack
            triggerEnemyAttack();
        }
    };

    const handleEnemyDefeated = () => {
        const nextFloor = floorIdx + 1;
        setFloorIdx(nextFloor);
        setXp(prev => prev + 50);

        if (nextFloor >= ENEMIES.length) {
            // Won the crawl!
            setGameState('won');
            playVictorySfx();
            registerGameCompletion('neuroscape', 'hard', timeElapsed, xp + 50);
            setShowVictory(true);
        } else {
            // Level upgrade reward screen
            setGameState('upgrade-selection');
            setCombatLog('¡Enemigo despejado! Tu cerebro asimila nuevos patrones.');
        }
    };

    const handleSelectUpgrade = (upgrade) => {
        playClick();
        
        // Apply effect
        const state = { playerMaxHp, playerHp, playerDmg, playerShieldMax };
        upgrade.effect(state);
        
        setPlayerMaxHp(state.playerMaxHp);
        setPlayerHp(state.playerHp);
        setPlayerDmg(state.playerDmg);
        setPlayerShieldMax(state.playerShieldMax);

        // Next Floor
        setGameState('combat');
        loadEnemy(floorIdx);
        setCombatLog(`Descendiendo al siguiente plano... ¡Aparece ${ENEMIES[floorIdx].name}!`);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            maxWidth: '680px', margin: '20px auto', padding: '24px',
            backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.45))',
            backdropFilter: 'blur(12px)', border: '1px solid var(--border)',
            borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.5s ease', textAlign: 'center'
        }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Brain size={18} style={{ color: '#60a5fa' }} /> NEUROSCAPE
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

            {/* Combat Arena (Player vs Enemy) */}
            {gameState === 'combat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                        {/* Player Column */}
                        <div style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🧠</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>Navegante</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontSize: '0.8rem', color: '#f43f5e' }}>
                                <Heart size={14} fill="#f43f5e" /> {playerHp} / {playerMaxHp}
                            </div>
                            {/* HP progress bar */}
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                                <div style={{ width: `${(playerHp / playerMaxHp) * 100}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.3s' }} />
                            </div>
                        </div>

                        {/* Mid Versus / Attack Timer */}
                        <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ATENTOS</span>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                border: '2.5px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24',
                                textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
                                animation: enemyTimer <= 3 ? 'pulse 0.8s infinite' : 'none'
                            }}>
                                {enemyTimer}s
                            </div>
                        </div>

                        {/* Enemy Column */}
                        <div style={{ flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{enemy.icon}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', color: enemy.color }}>{enemy.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontSize: '0.8rem', color: enemy.color }}>
                                <Heart size={14} fill={enemy.color} /> {enemy.hp} / {enemy.maxHp}
                            </div>
                            {/* Enemy HP progress bar */}
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                                <div style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: '100%', backgroundColor: enemy.color, transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Combat Log */}
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '12px',
                        padding: '10px 14px', fontSize: '0.9rem', color: 'white', fontStyle: 'italic'
                    }}>
                        {combatLog}
                    </div>

                    {/* Action Zone / Active Puzzle Canvas */}
                    <div style={{ minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '18px', border: '1px solid var(--border)', padding: '16px' }}>
                        {activePuzzle === null ? (
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleSelectCard('logic')}
                                    style={{
                                        width: '120px', height: '100px', borderRadius: '12px', border: '1.5px solid #60a5fa',
                                        backgroundColor: 'rgba(96, 165, 250, 0.05)', color: 'white', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Zap size={20} color="#60a5fa" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Rayo Lógico</span>
                                </button>
                                <button
                                    onClick={() => handleSelectCard('memory')}
                                    style={{
                                        width: '120px', height: '100px', borderRadius: '12px', border: '1.5px solid #a78bfa',
                                        backgroundColor: 'rgba(167, 139, 250, 0.05)', color: 'white', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Shield size={20} color="#a78bfa" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Escudo Memoria</span>
                                </button>
                                <button
                                    onClick={() => handleSelectCard('reflex')}
                                    style={{
                                        width: '120px', height: '100px', borderRadius: '12px', border: '1.5px solid #10b981',
                                        backgroundColor: 'rgba(16, 185, 129, 0.05)', color: 'white', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <RefreshCw size={20} color="#10b981" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Dardo Reflejo</span>
                                </button>
                            </div>
                        ) : (
                            <div style={{ width: '100%' }}>
                                {/* 1. Logic Math Puzzle */}
                                {activePuzzle === 'logic' && puzzleData && (
                                    <form onSubmit={handleSubmitAnswer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white', letterSpacing: '2px' }}>
                                            {puzzleData.nums.join(' + ')} = ?
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="number"
                                                value={puzzleAnswer}
                                                onChange={e => setPuzzleAnswer(e.target.value)}
                                                autoFocus
                                                style={{
                                                    width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)',
                                                    backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1.2rem', textAlign: 'center'
                                                }}
                                            />
                                            <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Lanzar
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* 2. Memory sequence Puzzle */}
                                {activePuzzle === 'memory' && puzzleData && (
                                    <form onSubmit={handleSubmitAnswer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        {puzzleData.show ? (
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', letterSpacing: '4px', animation: 'pulse 1s infinite' }}>
                                                {puzzleData.sequence}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Introduce la secuencia memorizada:</span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={puzzleAnswer}
                                                        onChange={e => setPuzzleAnswer(e.target.value)}
                                                        autoFocus
                                                        style={{
                                                            width: '120px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)',
                                                            backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px'
                                                        }}
                                                    />
                                                    <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#a78bfa', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                                        Activar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                )}

                                {/* 3. Reflex Click Target Puzzle */}
                                {activePuzzle === 'reflex' && puzzleData && (
                                    <div style={{ position: 'relative', width: '100%', height: '120px' }}>
                                        <button
                                            onClick={handleReflexClick}
                                            style={{
                                                position: 'absolute',
                                                left: `${puzzleData.pos.x}%`,
                                                top: `${puzzleData.pos.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                backgroundColor: '#10b981', border: '2px solid white',
                                                boxShadow: '0 0 15px #10b981', cursor: 'pointer',
                                                animation: 'pulse 0.5s infinite'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upgrade Selection screen between floors */}
            {gameState === 'upgrade-selection' && (
                <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#fbbf24', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Award size={20} /> ¡Sinapsis Expandida!
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Elige una asimilación neuronal para fortalecer tu cerebro en los siguientes niveles.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {UPGRADES_POOL.map((upgrade, idx) => (
                            <button
                                key={upgrade.id}
                                onClick={() => handleSelectUpgrade(upgrade)}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: '4px', padding: '14px',
                                    borderRadius: '12px', border: '1px solid var(--border)',
                                    backgroundColor: 'rgba(255,255,255,0.02)', color: 'white', cursor: 'pointer',
                                    textAlign: 'left', transition: 'all 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                            >
                                <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '0.9rem' }}>{upgrade.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{upgrade.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Game Over screen */}
            {gameState === 'lost' && (
                <div style={{ padding: '20px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💀</div>
                    <h2 style={{ fontSize: '1.8rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>Muerte Cerebral</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                        Tus defensas cognitivas colapsaron bajo los bloqueos del subconsciente.
                    </p>
                    <button onClick={initGame} style={{
                        padding: '12px 28px', borderRadius: '12px', border: 'none',
                        backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                        fontSize: '1rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}>
                        Intentar de Nuevo
                    </button>
                </div>
            )}

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Combate activamente contra distractores mentales. Si el medidor de tiempo del oponente llega a cero, te atacará. Juega cartas lógicas (sumar), memorias (secuencias) o dardo (pulsar rápido) para infligir daño antes de recibir golpes catastróficos.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Subconsciente Liberado!"
                message="Has derrotado al Bloqueo Crítico y restaurado la paz mental en Neuroscape."
                timeElapsed={timeElapsed}
                onPlayAgain={initGame}
            />
        </div>
    );
};

export default NeuroscapePage;
