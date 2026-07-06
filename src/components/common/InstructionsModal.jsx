import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const InstructionsModal = ({ isOpen, onClose, title, instructions }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '30px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '50%' }}>
                        <HelpCircle size={32} color="#3b82f6" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                        Cómo Jugar {title}
                    </h2>
                </div>

                <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    {instructions.map((paragraph, idx) => (
                        <p key={idx} style={{ marginBottom: '15px' }}>{paragraph}</p>
                    ))}
                </div>

                <button 
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '12px', marginTop: '10px',
                        backgroundColor: '#3b82f6', color: 'white',
                        border: 'none', borderRadius: '12px',
                        fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
                >
                    Entendido, ¡a jugar!
                </button>
            </div>
        </div>
    );
};

export default InstructionsModal;
