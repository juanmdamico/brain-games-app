import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

const Timer = ({ isRunning, onTimeUpdate, resetTrigger }) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        setSeconds(0);
    }, [resetTrigger]);

    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => {
                    const newTime = s + 1;
                    if (onTimeUpdate) onTimeUpdate(newTime);
                    return newTime;
                });
            }, 1000);
        } else if (!isRunning && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning, seconds, onTimeUpdate]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: 'monospace', fontSize: '1.2rem' }}>
            <TimerIcon size={18} color="#94a3b8" />
            <span>{formatTime(seconds)}</span>
        </div>
    );
};

export default Timer;
