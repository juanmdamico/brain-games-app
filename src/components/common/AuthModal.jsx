import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../utils/supabaseClient';
import { X, Lock, User, Eye, EyeOff, LogIn, Check } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const { playClick, playSuccessSfx, playErrorSfx } = useApp();
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    if (!isOpen) return null;

    const handleAuth = async (e) => {
        e.preventDefault();
        playClick();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        const cleanUsername = username.toLowerCase().trim();
        if (cleanUsername.length < 3) {
            playErrorSfx();
            setErrorMsg("El usuario debe tener al menos 3 caracteres.");
            setLoading(false);
            return;
        }

        // Map username to local email format under the hood
        const virtualEmail = `${cleanUsername}@divertimente.local`;

        try {
            if (isSignUp) {
                // 1. Check if username is already taken in profiles table
                const { data: existingUser, error: checkError } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', cleanUsername)
                    .maybeSingle();

                if (checkError) {
                    console.error("Username check error:", checkError);
                }

                if (existingUser) {
                    throw new Error("El nombre de usuario ya está registrado. Elige otro.");
                }

                // 2. Sign Up User
                const { data, error } = await supabase.auth.signUp({
                    email: virtualEmail,
                    password,
                    options: {
                        data: {
                            username: cleanUsername
                        }
                    }
                });

                if (error) throw error;

                // 3. Create profile entry manually
                if (data?.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                username: cleanUsername,
                                display_name: username.trim(),
                                avatar_url: '🧠',
                                bio: 'Entrenando mi cerebro',
                                streak: 0,
                                xp: 0,
                                level: 1
                            }
                        ]);
                    
                    if (profileError && profileError.code !== '23505') {
                        console.warn("Profile creation warning:", profileError);
                    }
                }

                playSuccessSfx();
                setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
                
                // Auto login after sign up
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email: virtualEmail,
                    password
                });

                if (loginError) throw loginError;
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                // Sign In User
                // Check if user entered an email or a username
                const isEmailInput = username.includes('@');
                const loginEmail = isEmailInput ? username.trim() : virtualEmail;

                const { error } = await supabase.auth.signInWithPassword({
                    email: loginEmail,
                    password
                });

                if (error) throw error;

                playSuccessSfx();
                onClose();
            }
        } catch (error) {
            playErrorSfx();
            setErrorMsg(error.message || "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

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
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                <button 
                    onClick={() => { playClick(); onClose(); }}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧠</div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {isSignUp ? 'Elige tu nombre de usuario y contraseña para jugar.' : 'Ingresa tus credenciales para continuar.'}
                    </p>
                </div>

                {errorMsg && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171', padding: '10px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#34d399', padding: '10px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '16px',
                        textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
                    }}>
                        <Check size={16} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={isSignUp ? "Nombre de usuario único" : "Usuario o Correo"}
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_@.]/g, ''))}
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)',
                                color: 'white', outline: 'none', fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña (mín. 6 caracteres)"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 40px 12px 40px', borderRadius: '12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)',
                                color: 'white', outline: 'none', fontSize: '0.9rem'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => { playClick(); setShowPassword(!showPassword); }}
                            style={{
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                            marginTop: '10px', opacity: loading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
                        {!loading && <LogIn size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? (
                        <span>
                            ¿Ya tienes cuenta?{' '}
                            <button 
                                onClick={() => { playClick(); setIsSignUp(false); }} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Inicia Sesión
                            </button>
                        </span>
                    ) : (
                        <span>
                            ¿No tienes cuenta?{' '}
                            <button 
                                onClick={() => { playClick(); setIsSignUp(true); }} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Regístrate
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
