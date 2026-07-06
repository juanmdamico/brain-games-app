import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Trophy, Settings, Music, Volume2, VolumeX, X, Flame, Sparkles, LogIn, User } from 'lucide-react';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

const AppLayout = ({ children }) => {
    const {
        theme, setTheme,
        soundEnabled, setSoundEnabled,
        musicEnabled, setMusicEnabled,
        volume, setVolume,
        highContrast, setHighContrast,
        textSize, setTextSize,
        colorblindMode, setColorblindMode,
        unlockedAchievements, activeToast, setActiveToast,
        streak, playClick,
        user, profile, setProfile
    } = useApp();

    const location = useLocation();
    const isHome = location.pathname === '/';

    const [showSettings, setShowSettings] = useState(false);
    const [showAchievementsModal, setShowAchievementsModal] = useState(false);
    
    // Auth & Profile Modals States
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const toggleSettings = () => {
        playClick();
        setShowSettings(!showSettings);
    };

    const toggleAchievements = () => {
        playClick();
        setShowAchievementsModal(!showAchievementsModal);
    };

    const handleUserClick = () => {
        playClick();
        if (user) {
            setShowProfileModal(true);
        } else {
            setShowAuthModal(true);
        }
    };

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
    };

    const ACHIEVEMENTS = [
        { id: 'first_win', title: 'Primera Victoria', description: 'Completa cualquier juego por primera vez.', icon: '🏆' },
        { id: 'speedrun', title: 'Velocista', description: 'Completa cualquier juego en menos de 60 segundos.', icon: '⚡' },
        { id: 'master', title: 'Mente Maestra', description: 'Completa un juego en dificultad máxima.', icon: '🧠' },
        { id: 'polyglot', title: 'Políglota del Pensamiento', description: 'Completa 5 tipos de juegos diferentes.', icon: '🎨' },
        { id: 'streak_3', title: 'Constancia Mental', description: 'Alcanza una racha diaria de 3 días.', icon: '🔥' },
        { id: 'snake_50', title: 'Rey de las Serpientes', description: 'Consigue una puntuación de 50 o más en Snake.', icon: '🐍' },
        { id: 'simon_10', title: 'Memoria Prodigiosa', description: 'Completa una secuencia de 10 colores en Simon Says.', icon: '🔴' }
    ];

    return (
        <div className={`app-wrapper theme-${theme}`} style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Global Top Navbar */}
            <header className="global-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 24px',
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                zIndex: 100,
                position: 'sticky',
                top: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {!isHome && (
                        <Link 
                            to="/" 
                            onClick={playClick}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                color: 'var(--text-main)', 
                                fontWeight: 'bold',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem'
                            }}
                        >
                            &larr; Hub
                        </Link>
                    )}
                    <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '800', 
                        background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent',
                        display: isHome ? 'block' : 'none'
                    }}>
                        🧠 Divertimente
                    </span>
                    {streak > 0 && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            backgroundColor: 'rgba(249, 115, 22, 0.15)', 
                            color: '#fdba74', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(249, 115, 22, 0.3)'
                        }} title={`Racha diaria de ${streak} días`}>
                            <Flame size={16} fill="#f97316" color="#f97316" />
                            <span>{streak} d</span>
                        </div>
                    )}
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* User profile section */}
                    {user ? (
                        <button
                            onClick={handleUserClick}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{profile?.avatar_url || '🧠'}</span>
                            <span className="layout-username" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {profile?.display_name || 'Perfil'}
                            </span>
                            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '6px' }}>
                                Nivel {profile?.level || 1}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleUserClick}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)'
                            }}
                        >
                            <LogIn size={16} />
                            <span className="layout-login-text">Iniciar Sesión</span>
                        </button>
                    )}

                    <button 
                        onClick={toggleAchievements}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            color: unlockedAchievements.length > 0 ? '#fbbf24' : 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <Trophy size={18} fill={unlockedAchievements.length > 0 ? '#fbbf24' : 'none'} />
                        <span>{unlockedAchievements.length}</span>
                    </button>

                    <button 
                        onClick={toggleSettings}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '8px',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>

            {/* Quick/Floating Settings Panel */}
            {showSettings && (
                <div style={{
                    position: 'fixed',
                    top: '65px',
                    right: '20px',
                    width: '320px',
                    maxWidth: '90vw',
                    backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.95))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    padding: '20px',
                    zIndex: 200,
                    animation: 'slideDown 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontWeight: 750, color: 'var(--text-main)', fontSize: '1.1rem' }}>Configuración</h3>
                        <button onClick={toggleSettings} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Themes */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>Tema Visual</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[
                                { id: 'slate', label: 'Slate', color: '#1e293b' },
                                { id: 'zen', label: 'Zen', color: '#faf7f0' },
                                { id: 'neon', label: 'Neon', color: '#0d0d0d' },
                                { id: 'ocean', label: 'Ocean', color: '#031b2f' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { playClick(); setTheme(t.id); }}
                                    style={{
                                        padding: '8px 4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: theme === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: theme === t.id ? '#fff' : 'var(--text-main)',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>Sonido y Música</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem' }}>Efectos (SFX)</span>
                                <button 
                                    onClick={() => { setSoundEnabled(!soundEnabled); playClick(); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: soundEnabled ? '#34d399' : 'var(--text-muted)' }}
                                >
                                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem' }}>Música Ambiental</span>
                                <button 
                                    onClick={() => { setMusicEnabled(!musicEnabled); playClick(); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: musicEnabled ? '#8b5cf6' : 'var(--text-muted)' }}
                                >
                                    <Music size={20} />
                                </button>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volumen: {Math.round(volume * 100)}%</span>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary)', height: '4px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Accessibility */}
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>Accesibilidad (A11y)</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={highContrast} 
                                    onChange={(e) => { playClick(); setHighContrast(e.target.checked); }}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                Alto Contraste
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={textSize === 'large'} 
                                    onChange={(e) => { playClick(); setTextSize(e.target.checked ? 'large' : 'normal'); }}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                Texto Grande
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={colorblindMode} 
                                    onChange={(e) => { playClick(); setColorblindMode(e.target.checked); }}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                Modo Daltónicos
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toast Notification for Achievements */}
            {activeToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '320px',
                    backgroundColor: '#1e293b',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 2000,
                    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
                        {activeToast.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            🏆 ¡Logro Desbloqueado!
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f8fafc', margin: '2px 0' }}>
                            {activeToast.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {activeToast.description}
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveToast(null)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', alignSelf: 'flex-start' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Achievements Modal */}
            {showAchievementsModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-container" style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '30px',
                        maxWidth: '550px',
                        width: '90%',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
                    }}>
                        <button 
                            onClick={toggleAchievements}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Trophy size={48} color="#fbbf24" style={{ marginBottom: '10px' }} />
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Medallas y Logros</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                                Has desbloqueado {unlockedAchievements.length} de {ACHIEVEMENTS.length} logros
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {ACHIEVEMENTS.map(ach => {
                                const isUnlocked = unlockedAchievements.includes(ach.id);
                                return (
                                    <div 
                                        key={ach.id} 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '15px', 
                                            padding: '12px 16px', 
                                            borderRadius: '16px', 
                                            backgroundColor: isUnlocked ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255,255,255,0.02)',
                                            border: isUnlocked ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                            opacity: isUnlocked ? 1 : 0.5,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            fontSize: '2rem', 
                                            filter: isUnlocked ? 'none' : 'grayscale(1)' 
                                        }}>
                                            {isUnlocked ? ach.icon : '🔒'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', color: isUnlocked ? '#fbbf24' : 'var(--text-main)' }}>
                                                {ach.title}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {ach.description}
                                            </div>
                                        </div>
                                        {isUnlocked && (
                                            <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(251, 191, 36, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                                                Desbloqueado
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Auth & Profile Modals */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            <ProfileModal 
                isOpen={showProfileModal} 
                onClose={() => setShowProfileModal(false)}
                user={user}
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
            />

            {/* Global Keyframes Styles */}
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .app-wrapper.theme-zen {
                    --bg-color: #faf7f0;
                    --surface-color: rgba(240, 237, 229, 0.7);
                    --surface-hover: rgba(225, 220, 209, 0.9);
                    --primary: #556b2f;
                    --secondary: #cd5c5c;
                    --text-main: #2b2621;
                    --text-muted: #6e655f;
                    --border: rgba(85, 107, 47, 0.15);
                    --cell-bg: #fff;
                    --cell-border: #dcd6cd;
                    background-color: var(--bg-color) !important;
                    color: var(--text-main) !important;
                }
                .app-wrapper.theme-neon {
                    --bg-color: #050505;
                    --surface-color: rgba(13, 13, 13, 0.85);
                    --surface-hover: rgba(25, 25, 25, 0.95);
                    --primary: #ff007f;
                    --secondary: #00f0ff;
                    --text-main: #ffffff;
                    --text-muted: #888888;
                    --border: rgba(0, 240, 255, 0.3);
                    --cell-bg: #111111;
                    --cell-border: rgba(255, 0, 127, 0.2);
                    background-color: var(--bg-color) !important;
                    color: var(--text-main) !important;
                    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
                }
                .app-wrapper.theme-ocean {
                    --bg-color: #031525;
                    --surface-color: rgba(7, 34, 59, 0.6);
                    --surface-hover: rgba(12, 49, 82, 0.8);
                    --primary: #0ea5e9;
                    --secondary: #2dd4bf;
                    --text-main: #f0f9ff;
                    --text-muted: #7dd3fc;
                    --border: rgba(14, 165, 233, 0.25);
                    --cell-bg: #0b253c;
                    --cell-border: #133a5c;
                    background-color: var(--bg-color) !important;
                    color: var(--text-main) !important;
                }
                .a11y-high-contrast {
                    --bg-color: #000000 !important;
                    --surface-color: #000000 !important;
                    --surface-hover: #111111 !important;
                    --text-main: #ffffff !important;
                    --text-muted: #e2e8f0 !important;
                    --border: #ffffff !important;
                    --cell-bg: #000000 !important;
                    --cell-border: #ffffff !important;
                }
                .a11y-text-large {
                    font-size: 1.15rem !important;
                }
                .a11y-text-large h1 { font-size: 2.6rem !important; }
                .a11y-text-large h2 { font-size: 2.1rem !important; }
                .a11y-text-large p { font-size: 1.2rem !important; }
                
                .theme-zen .global-header { background: rgba(240, 237, 229, 0.9) !important; }
                .theme-neon .global-header { background: rgba(5, 5, 5, 0.95) !important; border-bottom: 2px solid #00f0ff !important; }
                .theme-ocean .global-header { background: rgba(7, 34, 59, 0.9) !important; }
                
                .theme-zen button, .theme-zen select, .theme-zen select option { color: #2b2621 !important; }
                .theme-neon .modal-container { box-shadow: 0 0 50px rgba(0, 240, 255, 0.2) !important; border: 2px solid #00f0ff !important; }
                
                @media (max-width: 520px) {
                    .layout-username {
                        display: none !important;
                    }
                    .layout-login-text {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AppLayout;
