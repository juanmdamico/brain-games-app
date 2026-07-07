import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import VictoryModal from '../components/common/VictoryModal';
import { HelpCircle, RotateCcw, Brain, Zap, Cpu } from 'lucide-react';

const BrainClickerPage = () => {
    const { playClick, playSuccessSfx, playErrorSfx, playVictorySfx, registerGameCompletion } = useApp();
    const [thoughts, setThoughts] = useState(0);
    const [thoughtsPerClick, setThoughtsPerClick] = useState(1);
    const [thoughtsPerSec, setThoughtsPerSec] = useState(0);
    const [winner, setWinner] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Upgrades configurations
    const [upgrades, setUpgrades] = useState([
        { id: 'synapse', name: 'Sinapsis Reforzada', cost: 15, cps: 0, clickPower: 1, count: 0, icon: <Zap size={16} /> },
        { id: 'node', name: 'Nodo Neuronal', cost: 60, cps: 1, clickPower: 0, count: 0, icon: <Cpu size={16} /> },
        { id: 'transmitter', name: 'Neurotransmisor', cost: 300, cps: 5, clickPower: 0, count: 0, icon: <Brain size={16} /> }
    ]);

    // Timer elapsed hook
    useEffect(() => {
        if (winner) return;
        const timer = setInterval(() => {
            setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, winner]);

    // CPS (thoughts per second) loop
    useEffect(() => {
        if (winner || thoughtsPerSec === 0) return;
        const interval = setInterval(() => {
            setThoughts(prev => {
                const next = prev + thoughtsPerSec;
                checkWinCondition(next);
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [thoughtsPerSec, winner]);

    const handleBrainClick = () => {
        if (winner) return;
        playClick();

        const next = thoughts + thoughtsPerClick;
        setThoughts(next);
        checkWinCondition(next);
    };

    const handleBuyUpgrade = (idx) => {
        const upgrade = upgrades[idx];
        if (thoughts < upgrade.cost) {
            playErrorSfx();
            return;
        }

        playSuccessSfx();
        setThoughts(prev => prev - upgrade.cost);
        
        // Upgrade properties update
        const nextUpgrades = [...upgrades];
        nextUpgrades[idx].count += 1;
        nextUpgrades[idx].cost = Math.round(upgrade.cost * 1.5);
        setUpgrades(nextUpgrades);

        // Recalculate rates
        setThoughtsPerClick(1 + nextUpgrades.reduce((sum, u) => sum + (u.clickPower * u.count), 0));
        setThoughtsPerSec(nextUpgrades.reduce((sum, u) => sum + (u.cps * u.count), 0));
    };

    const checkWinCondition = (currentThoughts) => {
        if (currentThoughts >= 2000 && !winner) {
            setWinner(true);
            playVictorySfx();
            registerGameCompletion('brainclicker', 'medium', timeElapsed, currentThoughts);
            setShowVictory(true);
        }
    };

    const resetGame = () => {
        playClick();
        setThoughts(0);
        setThoughtsPerClick(1);
        setThoughtsPerSec(0);
        setUpgrades([
            { id: 'synapse', name: 'Sinapsis Reforzada', cost: 15, cps: 0, clickPower: 1, count: 0, icon: <Zap size={16} /> },
            { id: 'node', name: 'Nodo Neuronal', cost: 60, cps: 1, clickPower: 0, count: 0, icon: <Cpu size={16} /> },
            { id: 'transmitter', name: 'Neurotransmisor', cost: 300, cps: 5, clickPower: 0, count: 0, icon: <Brain size={16} /> }
        ]);
        setWinner(false);
        setShowVictory(false);
        setStartTime(Date.now());
        setTimeElapsed(0);
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
                    Brain Clicker (Desarrollo Neuronal)
                </span>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeElapsed)}
                </div>
                <button onClick={resetGame} style={{
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '6px 10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <RotateCcw size={16} /> Reiniciar
                </button>
            </div>

            {/* Score HUD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
                <span>Pensamientos: <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{thoughts}</strong> / 2000</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span>Por Click: +{thoughtsPerClick}</span>
                    <span>Por Segundo: +{thoughtsPerSec}</span>
                </span>
            </div>

            {/* Pulsating Brain Center Clicker */}
            <div style={{ marginBottom: '30px' }}>
                <button
                    onClick={handleBrainClick}
                    style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '2px solid var(--primary)',
                        cursor: winner ? 'default' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.3)',
                        transition: 'transform 0.1s', outline: 'none',
                        animation: thoughtsPerSec > 0 ? 'pulse 1.2s infinite' : 'none'
                    }}
                    onMouseDown={e => !winner && (e.currentTarget.style.transform = 'scale(0.95)')}
                    onMouseUp={e => !winner && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Brain size={64} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                </button>
            </div>

            {/* Synaptic Upgrades panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upgrades.map((upg, idx) => {
                    const canAfford = thoughts >= upg.cost;
                    return (
                        <button
                            key={upg.id}
                            onClick={() => handleBuyUpgrade(idx)}
                            disabled={winner}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid var(--border)',
                                backgroundColor: canAfford ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.01)',
                                cursor: winner ? 'default' : 'pointer',
                                transition: 'all 0.15s'
                            }}
                            onMouseOver={e => canAfford && !winner && (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)')}
                            onMouseOut={e => canAfford && (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                <span style={{ color: 'var(--primary)' }}>{upg.icon}</span>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{upg.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                        {upg.clickPower > 0 ? `+${upg.clickPower} por Click` : `+${upg.cps} por Segundo`} (Posees: {upg.count})
                                    </div>
                                </div>
                            </div>
                            <span style={{
                                fontSize: '0.85rem', fontWeight: 'bold',
                                color: canAfford ? '#fbbf24' : 'var(--text-muted)'
                            }}>
                                Costo: ${upg.cost}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Rules Info */}
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <HelpCircle size={16} />
                <span>Haz clic en el cerebro para generar pensamientos lúdicos. Invierte tus pensamientos en mejoras de sinapsis o nodos autónomos que generan pensamientos de manera automática. Alcanza 2000 pensamientos para ganar.</span>
            </div>

            {/* VictoryModal */}
            <VictoryModal
                isOpen={showVictory}
                onClose={() => setShowVictory(false)}
                title="¡Cerebro Expandido!"
                message={`Felicidades, has acumulado más de 2000 pensamientos de conocimiento.`}
                timeElapsed={timeElapsed}
                onPlayAgain={resetGame}
            />
        </div>
    );
};

export default BrainClickerPage;
