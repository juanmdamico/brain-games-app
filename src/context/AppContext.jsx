import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSfx, startMusic, stopMusic, setMusicVolume } from '../utils/audioEngine';

const AppContext = createContext();

export const ACHIEVEMENTS = [
    { id: 'first_win', title: 'Primera Victoria', description: 'Completa cualquier juego por primera vez.', icon: '🏆' },
    { id: 'speedrun', title: 'Velocista', description: 'Completa cualquier juego en menos de 60 segundos.', icon: '⚡' },
    { id: 'master', title: 'Mente Maestra', description: 'Completa un juego en dificultad máxima.', icon: '🧠' },
    { id: 'polyglot', title: 'Políglota del Pensamiento', description: 'Completa 5 tipos de juegos diferentes.', icon: '🎨' },
    { id: 'streak_3', title: 'Constancia Mental', description: 'Alcanza una racha diaria de 3 días.', icon: '🔥' },
    { id: 'snake_50', title: 'Rey de las Serpientes', description: 'Consigue una puntuación de 50 o más en Snake.', icon: '🐍' },
    { id: 'simon_10', title: 'Memoria Prodigiosa', description: 'Completa una secuencia de 10 colores en Simon Says.', icon: '🔴' }
];

const GAMES_LIST = [
    { id: 'sudoku', name: 'Sudoku', path: '/sudoku' },
    { id: 'buscaminas', name: 'Buscaminas', path: '/buscaminas' },
    { id: '2048', name: '2048', path: '/2048' },
    { id: 'nonogramas', name: 'Nonogramas', path: '/nonogramas' },
    { id: 'kakuro', name: 'Kakuro', path: '/kakuro' },
    { id: 'kenken', name: 'KenKen', path: '/kenken' },
    { id: 'hitori', name: 'Hitori', path: '/hitori' },
    { id: 'slitherlink', name: 'Slitherlink', path: '/slitherlink' },
    { id: 'wordle', name: 'Wordle', path: '/wordle' },
    { id: 'memorymatch', name: 'Memory Match', path: '/memorymatch' },
    { id: 'snake', name: 'Snake', path: '/snake' },
    { id: 'tictactoe', name: 'Tres en línea', path: '/tictactoe' },
    { id: 'simonsays', name: 'Simon Says', path: '/simonsays' }
];

export const AppProvider = ({ children }) => {
    // 1. Theme Configuration
    const [theme, setTheme] = useState(() => localStorage.getItem('bg-theme') || 'slate');

    // 2. Sound Settings
    const [soundEnabled, setSoundEnabled] = useState(() => JSON.parse(localStorage.getItem('bg-sound-enabled') ?? 'true'));
    const [musicEnabled, setMusicEnabled] = useState(() => JSON.parse(localStorage.getItem('bg-music-enabled') ?? 'false'));
    const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('bg-volume') ?? '0.5'));

    // 3. Accessibility Settings
    const [highContrast, setHighContrast] = useState(() => JSON.parse(localStorage.getItem('bg-a11y-contrast') ?? 'false'));
    const [textSize, setTextSize] = useState(() => localStorage.getItem('bg-a11y-text-size') || 'normal');
    const [colorblindMode, setColorblindMode] = useState(() => JSON.parse(localStorage.getItem('bg-a11y-colorblind') ?? 'false'));

    // 4. Achievements & Toast Notifications
    const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        return JSON.parse(localStorage.getItem('bg-achievements') || '[]');
    });
    const [activeToast, setActiveToast] = useState(null);

    // 5. Streaks and Daily Challenge
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('bg-streak') || '0'));
    const [lastPlayedDaily, setLastPlayedDaily] = useState(() => localStorage.getItem('bg-last-daily') || '');
    const [dailyChallenge, setDailyChallenge] = useState(null);

    // 6. Local Statistics & Leaderboard Records
    const [records, setRecords] = useState(() => {
        return JSON.parse(localStorage.getItem('bg-records') || '{}');
    });

    // Handle Theme class on body
    useEffect(() => {
        localStorage.setItem('bg-theme', theme);
        const bodyClass = document.body.className.replace(/\btheme-\S+/g, '');
        document.body.className = `${bodyClass} theme-${theme}`.trim();
    }, [theme]);

    // Handle Accessibility classes
    useEffect(() => {
        localStorage.setItem('bg-a11y-contrast', JSON.stringify(highContrast));
        if (highContrast) document.body.classList.add('a11y-high-contrast');
        else document.body.classList.remove('a11y-high-contrast');
    }, [highContrast]);

    useEffect(() => {
        localStorage.setItem('bg-a11y-text-size', textSize);
        if (textSize === 'large') document.body.classList.add('a11y-text-large');
        else document.body.classList.remove('a11y-text-large');
    }, [textSize]);

    useEffect(() => {
        localStorage.setItem('bg-a11y-colorblind', JSON.stringify(colorblindMode));
        if (colorblindMode) document.body.classList.add('a11y-colorblind');
        else document.body.classList.remove('a11y-colorblind');
    }, [colorblindMode]);

    // Background music player sync
    useEffect(() => {
        localStorage.setItem('bg-music-enabled', JSON.stringify(musicEnabled));
        localStorage.setItem('bg-volume', volume.toString());
        if (musicEnabled) {
            startMusic(volume);
        } else {
            stopMusic();
        }
    }, [musicEnabled, volume]);

    useEffect(() => {
        localStorage.setItem('bg-sound-enabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    // Generate deterministic Daily Challenge
    useEffect(() => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Select game deterministically
        const seed = today.getDate() + (today.getMonth() + 1) * 7 + today.getFullYear();
        const gameIndex = seed % GAMES_LIST.length;
        const selectedGame = GAMES_LIST[gameIndex];

        // Determine difficulty
        const diffs = ['easy', 'medium', 'hard'];
        const diffIndex = (seed * 3) % diffs.length;
        const difficulty = diffs[diffIndex];
        const difficultyLabel = difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil';

        setDailyChallenge({
            date: dateString,
            gameId: selectedGame.id,
            gameName: selectedGame.name,
            path: selectedGame.path,
            difficulty: difficulty,
            difficultyLabel: difficultyLabel,
            solved: lastPlayedDaily === dateString
        });
    }, [lastPlayedDaily]);

    const playClick = () => {
        if (soundEnabled) playSfx('click', volume);
    };

    const playSuccessSfx = () => {
        if (soundEnabled) playSfx('success', volume);
    };

    const playErrorSfx = () => {
        if (soundEnabled) playSfx('error', volume);
    };

    const playVictorySfx = () => {
        if (soundEnabled) playSfx('victory', volume);
    };

    const unlockAchievement = (id) => {
        if (unlockedAchievements.includes(id)) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        const newList = [...unlockedAchievements, id];
        setUnlockedAchievements(newList);
        localStorage.setItem('bg-achievements', JSON.stringify(newList));

        // Trigger Achievement Unlock Sound & Toast Notification
        playSuccessSfx();
        setActiveToast(achievement);

        // Auto hide toast after 4.5 seconds
        setTimeout(() => {
            setActiveToast(null);
        }, 4500);

        // Check if unlocked 5 different ones for the "polyglot" (Actually, let's trigger it based on games played)
    };

    const registerGameCompletion = (gameId, difficulty, timeSecs, extraScore = 0) => {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Save time record
        const key = `${gameId}_${difficulty}`;
        const gameRecords = records[key] || [];
        const newRecords = [...gameRecords, timeSecs].sort((a, b) => a - b).slice(0, 5); // Keep top 5
        const updatedRecords = { ...records, [key]: newRecords };
        setRecords(updatedRecords);
        localStorage.setItem('bg-records', JSON.stringify(updatedRecords));

        // Check achievements trigger
        unlockAchievement('first_win');
        
        if (timeSecs < 60 && gameId !== 'simonsays' && gameId !== 'snake') {
            unlockAchievement('speedrun');
        }

        if (difficulty === 'hard' || difficulty === 'expert') {
            unlockAchievement('master');
        }

        // Count unique games completed
        const uniqueGamesCompleted = Object.keys(updatedRecords).map(k => k.split('_')[0]);
        const uniqueSet = new Set(uniqueGamesCompleted);
        if (uniqueSet.size >= 5) {
            unlockAchievement('polyglot');
        }

        // Special achievements for arcade
        if (gameId === 'snake' && extraScore >= 50) {
            unlockAchievement('snake_50');
        }
        if (gameId === 'simonsays' && extraScore >= 10) {
            unlockAchievement('simonsays_10');
        }

        // 2. Check Daily Challenge
        if (dailyChallenge && gameId === dailyChallenge.gameId && difficulty === dailyChallenge.difficulty) {
            if (lastPlayedDaily !== today) {
                // Set last daily played
                setLastPlayedDaily(today);
                localStorage.setItem('bg-last-daily', today);

                // Update streak
                let newStreak = streak + 1;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];

                // If streak broke (i.e. last daily was not yesterday and was not today)
                if (lastPlayedDaily && lastPlayedDaily !== yesterdayString && lastPlayedDaily !== today) {
                    newStreak = 1;
                }

                setStreak(newStreak);
                localStorage.setItem('bg-streak', newStreak.toString());

                if (newStreak >= 3) {
                    unlockAchievement('streak_3');
                }

                setDailyChallenge(prev => prev ? { ...prev, solved: true } : null);
            }
        }
    };

    return (
        <AppContext.Provider value={{
            theme, setTheme,
            soundEnabled, setSoundEnabled,
            musicEnabled, setMusicEnabled,
            volume, setVolume,
            highContrast, setHighContrast,
            textSize, setTextSize,
            colorblindMode, setColorblindMode,
            unlockedAchievements, unlockAchievement,
            activeToast, setActiveToast,
            streak, lastPlayedDaily, dailyChallenge,
            records, registerGameCompletion,
            playClick, playSuccessSfx, playErrorSfx, playVictorySfx,
            gamesList: GAMES_LIST
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
