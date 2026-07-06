import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabaseClient';
import { X, User, Edit2, LogOut, Award, Calendar, Check, Send, ShieldAlert, AwardIcon } from 'lucide-react';

const AVATARS = ['🧠', '🚀', '👾', '🦊', '🦉', '🦁', '🦖', '🌟', '🍀', '🍕', '⚽', '🎨'];

const ProfileModal = ({ isOpen, onClose, user, profile, onProfileUpdate }) => {
    const { playClick, playSuccessSfx, playErrorSfx, records } = useApp();
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '🧠');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState(null);

    if (!isOpen) return null;

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        playClick();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName.trim(),
                    bio: bio.trim(),
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            playSuccessSfx();
            onProfileUpdate({
                ...profile,
                display_name: displayName.trim(),
                bio: bio.trim(),
                avatar_url: avatarUrl
            });
            setEditMode(false);
            setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
        } catch (error) {
            playErrorSfx();
            setMessage({ type: 'error', text: error.message || 'Error al actualizar.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        playClick();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/`
            });

            if (error) throw error;

            playSuccessSfx();
            setMessage({ type: 'success', text: 'Se ha enviado un correo para restablecer tu contraseña.' });
        } catch (error) {
            playErrorSfx();
            setMessage({ type: 'error', text: error.message || 'Error al solicitar cambio.' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        playClick();
        await supabase.auth.signOut();
        onClose();
    };

    // Calculate level progress
    // Each level requires 200 XP
    const currentXp = profile?.xp || 0;
    const currentLevel = profile?.level || 1;
    const xpNeededForCurrentLevel = (currentLevel - 1) * 200;
    const xpNeededForNextLevel = currentLevel * 200;
    const progressInCurrentLevel = currentXp - xpNeededForCurrentLevel;
    const progressPercentage = Math.min(100, Math.max(0, (progressInCurrentLevel / 200) * 100));

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1500, padding: '20px'
        }}>
            <div className="modal-container" style={{
                backgroundColor: 'var(--panel-bg, rgba(30, 41, 59, 0.95))',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '30px 24px',
                maxWidth: '480px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                <button 
                    onClick={() => { playClick(); onClose(); }}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                {/* Profile Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        fontSize: '3.5rem', 
                        width: '80px', 
                        height: '80px', 
                        margin: '0 auto 12px auto',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--border)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}>
                        {avatarUrl}
                    </div>

                    {!editMode ? (
                        <>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {profile?.display_name || 'Usuario'}
                                <button 
                                    onClick={() => { playClick(); setEditMode(true); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                                @{profile?.username || 'invitado'}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0 auto' }}>
                                "{profile?.bio || 'Sin biografía.'}"
                            </p>
                        </>
                    ) : (
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                            {/* Avatar Picker */}
                            <div style={{ marginBottom: '5px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>Elige tu Avatar:</div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {AVATARS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => { playClick(); setAvatarUrl(emoji); }}
                                            style={{
                                                fontSize: '1.4rem', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)',
                                                backgroundColor: avatarUrl === emoji ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="Nombre público"
                                required
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)',
                                    color: 'white', outline: 'none', fontSize: '0.9rem'
                                }}
                            />
                            <textarea
                                placeholder="Escribe algo sobre ti..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)',
                                    color: 'white', outline: 'none', fontSize: '0.9rem', resize: 'vertical', height: '60px'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { playClick(); setEditMode(false); }}
                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', color: 'white', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {message && (
                    <div style={{
                        backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        color: message.type === 'success' ? '#34d399' : '#f87171',
                        padding: '10px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Level / XP Box */}
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Nivel {currentLevel}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{currentXp} XP total</span>
                    </div>
                    {/* XP Progress bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ 
                            width: `${progressPercentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                            borderRadius: '4px'
                        }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        {xpNeededForNextLevel - currentXp} XP para Nivel {currentLevel + 1}
                    </div>
                </div>

                {/* Account Settings / Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={handlePasswordReset}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                    >
                        <Send size={16} />
                        <span>Restablecer Contraseña (Email)</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            color: '#f87171',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
