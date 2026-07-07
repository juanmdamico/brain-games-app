import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSfx, startMusic, stopMusic, setMusicVolume } from '../utils/audioEngine';
import { supabase } from '../utils/supabaseClient';

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
    { id: 'simonsays', name: 'Simon Says', path: '/simonsays' },
    { id: 'conecta4', name: 'Conecta 4', path: '/conecta4' },
    { id: 'reflejos', name: 'Reflejos', path: '/reflejos' },
    { id: 'deslizante', name: 'Deslizante', path: '/deslizante' },
    { id: 'sopadeletras', name: 'Sopa de Letras', path: '/sopadeletras' },
    { id: 'ahorcado', name: 'Ahorcado', path: '/ahorcado' },
    { id: 'mastermind', name: 'Mastermind', path: '/mastermind' },
    { id: 'sokoban', name: 'Sokoban', path: '/sokoban' },
    { id: 'tetris', name: 'Tetris', path: '/tetris' },
    { id: 'crucigrama', name: 'Crucigrama', path: '/crucigrama' },
    { id: 'lineascolores', name: 'Líneas de Colores', path: '/lineascolores' },
    { id: 'testmecanografia', name: 'Test de Mecanografía', path: '/testmecanografia' },
    { id: 'entrelazamiento', name: 'Enredo Cuántico', path: '/entrelazamiento' },
    { id: 'futoshiki', name: 'Futoshiki', path: '/futoshiki' },
    { id: 'killersudoku', name: 'Killer Sudoku', path: '/killersudoku' },
    { id: 'nurikabe', name: 'Nurikabe', path: '/nurikabe' },
    { id: 'hashi', name: 'Hashi', path: '/hashi' },
    { id: 'akari', name: 'Akari', path: '/akari' },
    { id: 'masyu', name: 'Masyu', path: '/masyu' },
    { id: 'starbattle', name: 'Star Battle', path: '/starbattle' },
    { id: 'yinyang', name: 'Yin-Yang', path: '/yinyang' },
    { id: 'anagrama', name: 'Anagramas', path: '/anagrama' },
    { id: 'spellingbee', name: 'Spelling Bee', path: '/spellingbee' },
    { id: 'solitario', name: 'Solitario', path: '/solitario' },
    { id: 'blackjack', name: 'Blackjack', path: '/blackjack' },
    { id: 'ajedrez_puzzles', name: 'Ajedrez Puzzles', path: '/ajedrez' },
    { id: 'kuromasu', name: 'Kuromasu', path: '/kuromasu' },
    { id: 'shikaku', name: 'Shikaku', path: '/shikaku' },
    { id: 'damas', name: 'Damas', path: '/damas' },
    { id: 'reversi', name: 'Reversi', path: '/reversi' },
    { id: 'gomoku', name: 'Gomoku', path: '/gomoku' },
    { id: 'battleship', name: 'Batalla Naval', path: '/battleship' },
    { id: 'mahjong', name: 'Mahjong', path: '/mahjong' },
    { id: 'spider', name: 'Solitario Spider', path: '/spider' },
    { id: 'freecell', name: 'Carta Blanca', path: '/freecell' },
    { id: 'videopoker', name: 'Video Poker', path: '/videopoker' },
    { id: 'blockpuzzle', name: 'Bloques', path: '/blockpuzzle' },
    { id: 'rushhour', name: 'Rush Hour', path: '/rushhour' },
    { id: 'plumber', name: 'Tuberías', path: '/plumber' },
    { id: 'pacman', name: 'Pac-Man', path: '/pacman' },
    { id: 'breakout', name: 'Breakout', path: '/breakout' },
    { id: 'audiopairs', name: 'Pares Auditivos', path: '/audiopairs' },
    { id: 'brainclicker', name: 'Brain Clicker', path: '/brainclicker' },
    { id: 'buscaminas_duel', name: 'Duelo Buscaminas', path: '/buscaminasduel' },
    { id: 'neuroscape', name: 'Neuroscape RPG', path: '/neuroscape' }
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

    // 4. Supabase User & Profile States
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    // 5. Cloud/Local Synchronized States
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [activeToast, setActiveToast] = useState(null);
    const [streak, setStreak] = useState(0);
    const [lastPlayedDaily, setLastPlayedDaily] = useState('');
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [records, setRecords] = useState({});

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

    // Listen to Supabase Auth State Changes
    useEffect(() => {
        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchUserProfile(currentUser);
            } else {
                loadLocalBackup();
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchUserProfile(currentUser);
            } else {
                setProfile(null);
                loadLocalBackup();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (currentUser) => {
        try {
            // 1. Get profile data
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error) {
                // Profile might not exist yet if trigger failed. We try creating it.
                if (error.code === 'PGRST116') {
                    const fallbackName = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: currentUser.id,
                            username: fallbackName.toLowerCase().trim() + Math.floor(Math.random() * 1000),
                            display_name: fallbackName,
                            avatar_url: '🧠',
                            bio: 'Entrenando mi cerebro',
                            streak: 0,
                            xp: 0,
                            level: 1
                        }])
                        .select()
                        .single();
                    if (createError) throw createError;
                    setProfile(newProfile);
                    setStreak(newProfile.streak);
                } else {
                    throw error;
                }
            } else {
                setProfile(profileData);
                setStreak(profileData.streak);
            }

            // 2. Fetch Achievements
            const { data: achievementsData } = await supabase
                .from('unlocked_achievements')
                .select('achievement_id')
                .eq('user_id', currentUser.id);
            
            if (achievementsData) {
                const list = achievementsData.map(a => a.achievement_id);
                setUnlockedAchievements(list);
            }

            // 3. Fetch Game Records/Stats
            const { data: statsData } = await supabase
                .from('stats')
                .select('game_id, difficulty, time_seconds')
                .eq('user_id', currentUser.id);
            
            if (statsData) {
                // Reconstruct records object format: { [gameId_difficulty]: [time1, time2, ...] }
                const reconstructed = {};
                statsData.forEach(row => {
                    const key = `${row.game_id}_${row.difficulty}`;
                    if (!reconstructed[key]) reconstructed[key] = [];
                    reconstructed[key].push(row.time_seconds);
                });
                // Sort each and keep top 5
                Object.keys(reconstructed).forEach(key => {
                    reconstructed[key] = reconstructed[key].sort((a, b) => a - b).slice(0, 5);
                });
                setRecords(reconstructed);
            }

            // 4. Sync local backup if it has superior stats
            syncLocalToCloudIfNeeded(currentUser.id);

        } catch (e) {
            console.error("Error fetching Supabase profile:", e);
            loadLocalBackup();
        }
    };

    const loadLocalBackup = () => {
        // Fallback to local storage values
        const localAchievements = JSON.parse(localStorage.getItem('bg-achievements') || '[]');
        const localStreak = parseInt(localStorage.getItem('bg-streak') || '0');
        const localLastDaily = localStorage.getItem('bg-last-daily') || '';
        const localRecords = JSON.parse(localStorage.getItem('bg-records') || '{}');

        setUnlockedAchievements(localAchievements);
        setStreak(localStreak);
        setLastPlayedDaily(localLastDaily);
        setRecords(localRecords);
    };

    // Auto-sync any offline progress when logging in
    const syncLocalToCloudIfNeeded = async (userId) => {
        try {
            const localAchievements = JSON.parse(localStorage.getItem('bg-achievements') || '[]');
            const localRecords = JSON.parse(localStorage.getItem('bg-records') || '{}');

            // 1. Sync Achievements
            if (localAchievements.length > 0) {
                const inserts = localAchievements.map(id => ({ user_id: userId, achievement_id: id }));
                await supabase.from('unlocked_achievements').insert(inserts).modifier('ON CONFLICT DO NOTHING');
            }

            // 2. Sync Records
            // If they have records locally, insert them into stats table
            const entriesToInsert = [];
            Object.keys(localRecords).forEach(key => {
                const [gameId, difficulty] = key.split('_');
                const bestTime = localRecords[key]?.[0];
                if (bestTime) {
                    entriesToInsert.push({
                        user_id: userId,
                        game_id: gameId,
                        difficulty: difficulty,
                        time_seconds: bestTime
                    });
                }
            });

            if (entriesToInsert.length > 0) {
                await supabase.from('stats').insert(entriesToInsert);
            }

            // Reset local cache to prevent infinite sync loops
            localStorage.removeItem('bg-achievements');
            localStorage.removeItem('bg-records');

        } catch(e) {
            console.warn("Failed to sync offline data to cloud:", e);
        }
    };

    // Generate deterministic Daily Challenge
    useEffect(() => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        
        const seed = today.getDate() + (today.getMonth() + 1) * 7 + today.getFullYear();
        const gameIndex = seed % GAMES_LIST.length;
        const selectedGame = GAMES_LIST[gameIndex];

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

    const unlockAchievement = async (id) => {
        if (unlockedAchievements.includes(id)) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        // Save locally
        const newList = [...unlockedAchievements, id];
        setUnlockedAchievements(newList);
        
        if (!user) {
            localStorage.setItem('bg-achievements', JSON.stringify(newList));
        } else {
            // Save to database
            try {
                await supabase
                    .from('unlocked_achievements')
                    .insert([{ user_id: user.id, achievement_id: id }]);
            } catch (e) {
                console.error("Cloud achievement save failed:", e);
            }
        }

        // Trigger notification
        playSuccessSfx();
        setActiveToast(achievement);

        setTimeout(() => {
            setActiveToast(null);
        }, 4500);
    };

    const registerGameCompletion = async (gameId, difficulty, timeSecs, extraScore = 0) => {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Calculate record locally
        const key = `${gameId}_${difficulty}`;
        const gameRecords = records[key] || [];
        const newRecords = [...gameRecords, timeSecs].sort((a, b) => a - b).slice(0, 5);
        const updatedRecords = { ...records, [key]: newRecords };
        setRecords(updatedRecords);

        // Compute XP earned
        let earnedXp = 0;
        if (difficulty === 'easy') earnedXp += 25;
        else if (difficulty === 'medium') earnedXp += 60;
        else if (difficulty === 'hard' || difficulty === 'expert') earnedXp += 120;

        // Check if solved daily challenge
        let dailyBonus = false;
        let isNewDaily = false;
        let newStreak = streak;

        if (dailyChallenge && gameId === dailyChallenge.gameId && difficulty === dailyChallenge.difficulty) {
            if (lastPlayedDaily !== today) {
                isNewDaily = true;
                setLastPlayedDaily(today);
                
                dailyBonus = true;
                earnedXp += 100; // Daily challenge completion bonus!

                newStreak = streak + 1;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];

                if (lastPlayedDaily && lastPlayedDaily !== yesterdayString && lastPlayedDaily !== today) {
                    newStreak = 1;
                }
                setStreak(newStreak);
                setDailyChallenge(prev => prev ? { ...prev, solved: true } : null);
            }
        }

        // 2. Persist to DB or localStorage
        if (!user) {
            localStorage.setItem('bg-records', JSON.stringify(updatedRecords));
            if (isNewDaily) {
                localStorage.setItem('bg-last-daily', today);
                localStorage.setItem('bg-streak', newStreak.toString());
            }
        } else {
            try {
                // Post stats row
                await supabase.from('stats').insert([{
                    user_id: user.id,
                    game_id: gameId,
                    difficulty: difficulty,
                    time_seconds: timeSecs,
                    extra_score: extraScore
                }]);

                // Update Profile XP, Level, and Streak
                const newXp = (profile?.xp || 0) + earnedXp;
                const newLevel = Math.floor(newXp / 200) + 1; // 200 XP per level

                const updates = {
                    xp: newXp,
                    level: newLevel,
                    updated_at: new Date().toISOString()
                };

                if (isNewDaily) {
                    updates.streak = newStreak;
                }

                const { data: updatedProfile, error: profileErr } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single();

                if (!profileErr && updatedProfile) {
                    setProfile(updatedProfile);
                }

            } catch (e) {
                console.error("Failed to sync record to cloud:", e);
            }
        }

        // 3. Trigger Achievements check
        unlockAchievement('first_win');
        
        if (timeSecs < 60 && gameId !== 'simonsays' && gameId !== 'snake') {
            unlockAchievement('speedrun');
        }

        if (difficulty === 'hard' || difficulty === 'expert') {
            unlockAchievement('master');
        }

        const uniqueSet = new Set(Object.keys(updatedRecords).map(k => k.split('_')[0]));
        if (uniqueSet.size >= 5) {
            unlockAchievement('polyglot');
        }

        if (newStreak >= 3) {
            unlockAchievement('streak_3');
        }

        if (gameId === 'snake' && extraScore >= 50) {
            unlockAchievement('snake_50');
        }
        if (gameId === 'simonsays' && extraScore >= 10) {
            unlockAchievement('simonsays_10');
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
            gamesList: GAMES_LIST,
            user, profile, setProfile
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
