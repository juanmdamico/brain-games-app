// Web Audio API Synthesizer Engine
// 100% offline-compatible, no external assets needed.

let audioCtx = null;
let musicInterval = null;
let currentMusicNodes = [];
let musicVolumeNode = null;
let isMusicPlaying = false;

// Lazily initialize AudioContext on user interaction
const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// Play a single synthesized note
const playSynthNote = (freq, duration, type = 'sine', startTime = 0, volume = 0.1) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
};

export const playSfx = (type, globalVolume = 0.5) => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') return;

        const volume = globalVolume * 0.15; // Limit overall volume for comfort

        if (type === 'click') {
            // Short sine beep
            playSynthNote(800, 0.08, 'sine', 0, volume);
        } else if (type === 'success') {
            // Major arpeggio C5 -> E5 -> G5
            playSynthNote(523.25, 0.15, 'sine', 0, volume);
            playSynthNote(659.25, 0.15, 'sine', 0.08, volume);
            playSynthNote(783.99, 0.25, 'sine', 0.16, volume);
        } else if (type === 'error') {
            // Descending buzzing sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
            
            gain.gain.setValueAtTime(volume * 1.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'victory') {
            // Triumphant 8-bit style fanfare
            const notes = [
                { f: 523.25, d: 0.15, t: 0 },    // C5
                { f: 587.33, d: 0.15, t: 0.15 }, // D5
                { f: 659.25, d: 0.15, t: 0.3 },  // E5
                { f: 783.99, d: 0.3, t: 0.45 },  // G5
                { f: 659.25, d: 0.15, t: 0.75 }, // E5
                { f: 783.99, d: 0.6, t: 0.9 }    // G5
            ];
            notes.forEach(n => {
                playSynthNote(n.f, n.d, 'triangle', n.t, volume * 1.2);
            });
        }
    } catch (e) {
        console.warn("Audio Context error:", e);
    }
};

// Ambient Chord Progression for background music
// Fmaj7 -> G6 -> Em7 -> Am7
const CHORDS = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [196.00, 246.94, 293.66, 329.63], // G6 (G3, B3, D4, E4)
    [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
    [220.00, 261.63, 329.63, 392.00]  // Am7 (A3, C4, E4, G4)
];

const playAmbientChord = (chordIdx, volume) => {
    const ctx = getAudioContext();
    const freqs = CHORDS[chordIdx];
    const duration = 5.5; // Seconds

    // Lowpass filter to make it sound warm and Lo-Fi
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // Slow attack
    gain.gain.linearRampToValueAtTime(volume * 0.05, ctx.currentTime + 1.5);
    // Sustain
    gain.gain.setValueAtTime(volume * 0.05, ctx.currentTime + 4.0);
    // Slow release
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    filter.connect(gain);
    gain.connect(musicVolumeNode || ctx.destination);

    const activeNodes = [];

    freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        activeNodes.push(osc);
    });

    currentMusicNodes.push({ nodes: activeNodes, gain, filter });
    
    // Clean up old nodes after completion
    setTimeout(() => {
        currentMusicNodes = currentMusicNodes.filter(item => item.gain !== gain);
    }, duration * 1000 + 500);
};

export const startMusic = (globalVolume = 0.5) => {
    try {
        if (isMusicPlaying) return;
        const ctx = getAudioContext();
        
        isMusicPlaying = true;

        if (!musicVolumeNode) {
            musicVolumeNode = ctx.createGain();
            musicVolumeNode.connect(ctx.destination);
        }
        musicVolumeNode.gain.setValueAtTime(globalVolume, ctx.currentTime);

        let currentChord = 0;
        
        // Play first chord immediately
        playAmbientChord(currentChord, globalVolume);
        
        // Loop chords every 6 seconds
        musicInterval = setInterval(() => {
            currentChord = (currentChord + 1) % CHORDS.length;
            playAmbientChord(currentChord, globalVolume);
        }, 6000);

    } catch (e) {
        console.warn("Background music error:", e);
    }
};

export const stopMusic = () => {
    isMusicPlaying = false;
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
    
    // Fade out and stop any current nodes
    currentMusicNodes.forEach(item => {
        try {
            const ctx = getAudioContext();
            item.gain.gain.cancelScheduledValues(ctx.currentTime);
            item.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
            setTimeout(() => {
                item.nodes.forEach(n => {
                    try { n.stop(); } catch(e){}
                });
            }, 1000);
        } catch(e){}
    });
    currentMusicNodes = [];
};

export const setMusicVolume = (globalVolume) => {
    if (musicVolumeNode) {
        const ctx = getAudioContext();
        musicVolumeNode.gain.setValueAtTime(globalVolume, ctx.currentTime);
    }
};
