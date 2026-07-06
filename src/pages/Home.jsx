import React, { useState } from 'react';
import GameCard from '../components/common/GameCard';
import { useApp } from '../context/AppContext';
import { Trophy, Play, CheckCircle2, ListFilter, Award, Flame, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const GAMES = [
    { to: "/sudoku", icon: "🧩", title: "Sudoku", category: "logic", description: "El clásico rompecabezas numérico. Rellena la cuadrícula sin repetir números." },
    { to: "/buscaminas", icon: "💣", title: "Buscaminas", category: "logic", description: "Encuentra las minas ocultas usando la lógica y los números de las pistas." },
    { to: "/2048", icon: "🔢", title: "2048", category: "arcade", description: "Desliza y fusiona las baldosas para llegar a la codiciada baldosa 2048." },
    { to: "/nonogramas", icon: "⬛", title: "Nonogramas", category: "logic", description: "Pinta casillas según los números para revelar imágenes ocultas." },
    { to: "/kakuro", icon: "➕", title: "Kakuro", category: "logic", description: "Crucigramas matemáticos. Llena la cuadrícula usando sumas lógicas." },
    { to: "/kenken", icon: "🔢", title: "KenKen", category: "logic", description: "Llena la cuadrícula respetando las reglas matemáticas de cada bloque." },
    { to: "/hitori", icon: "🎯", title: "Hitori", category: "logic", description: "Elimina números duplicados sombreando casillas estratégicamente." },
    { to: "/slitherlink", icon: "🔗", title: "Slitherlink", category: "logic", description: "Dibuja un lazo continuo conectando puntos según los números dados." },
    { to: "/wordle", icon: "📝", title: "Wordle", category: "arcade", description: "Adivina la palabra oculta de 5 letras en 6 intentos." },
    { to: "/memorymatch", icon: "🎴", title: "Memory Match", category: "casual", description: "Encuentra los pares de cartas iguales para entrenar tu memoria." },
    { to: "/snake", icon: "🐍", title: "Snake", category: "arcade", description: "El clásico juego arcade. Come y crece sin chocar." },
    { to: "/tictactoe", icon: "❌", title: "Tres en línea", category: "casual", description: "Juego de mesa clásico. Alinea 3 de tus símbolos para ganar." },
    { to: "/simonsays", icon: "🎨", title: "Simon Says", category: "casual", description: "Sigue la secuencia de colores que cada vez es más larga." }
];

const Home = () => {
  const { dailyChallenge, streak, playClick, unlockedAchievements, records } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredGames = GAMES.filter(g => filter === 'all' || g.category === filter);

  // Format time utility
  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '-';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '20px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          <div className="glow-orb orb-3"></div>
      </div>
      
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '30px' }}>
        <h1 style={{ fontWeight: 900, fontSize: '3.6rem', marginBottom: '10px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            Juegos para Pensar
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Desafía tu mente todos los días. Ejercita la lógica, la memoria, la concentración y la agilidad mental.
        </p>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-grid" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: '30px',
          flex: 1
      }}>
          
          {/* Top Dashboard Panels (Daily Challenge + Stats/Achievements Summary) */}
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '24px' 
          }}>
              
              {/* Daily Challenge Card */}
              {dailyChallenge && (
                  <div style={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.55)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '24px', 
                      padding: '24px', 
                      border: dailyChallenge.solved ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1.5px solid rgba(96, 165, 250, 0.3)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden'
                  }}>
                      {/* Decorative Background Icon */}
                      <Calendar size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, color: '#60a5fa' }} />

                      <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Sparkles size={14} /> Reto Diario
                              </span>
                              {streak > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                      <Flame size={16} fill="#fb923c" />
                                      <span>Racha: {streak} {streak === 1 ? 'día' : 'días'}</span>
                                  </div>
                              )}
                          </div>
                          <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                              {dailyChallenge.gameName}
                          </h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
                              Completa el reto de hoy en dificultad <strong>{dailyChallenge.difficultyLabel}</strong> para mantener tu racha diaria activa.
                          </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto' }}>
                          {dailyChallenge.solved ? (
                              <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  color: '#34d399', 
                                  fontWeight: 'bold',
                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                  padding: '10px 18px',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  width: '100%',
                                  justifyContent: 'center'
                              }}>
                                  <CheckCircle2 size={20} />
                                  <span>¡Reto de Hoy Completado!</span>
                              </div>
                          ) : (
                              <Link 
                                  to={dailyChallenge.path} 
                                  onClick={playClick}
                                  style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      width: '100%',
                                      padding: '12px',
                                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                      color: 'white',
                                      borderRadius: '12px',
                                      fontWeight: 'bold',
                                      textDecoration: 'none',
                                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                      transition: 'transform 0.2s'
                                  }}
                                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                  <Play size={18} fill="white" />
                                  <span>Comenzar Reto</span>
                              </Link>
                          )}
                      </div>
                  </div>
              )}

              {/* Achievements Dashboard Mini Panel */}
              <div style={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.55)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: '24px', 
                  padding: '24px', 
                  border: '1.5px solid var(--border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
              }}>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Trophy size={14} /> Logros de Perfil
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                              {unlockedAchievements.length} de 7 medallas
                          </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                          <div style={{ 
                              width: `${(unlockedAchievements.length / 7) * 100}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                              borderRadius: '4px',
                              transition: 'width 0.4s ease'
                          }}></div>
                      </div>

                      {/* Mini visual list */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                          {[
                              { id: 'first_win', icon: '🏆', title: 'Primera Victoria' },
                              { id: 'speedrun', icon: '⚡', title: 'Velocista' },
                              { id: 'master', icon: '🧠', title: 'Mente Maestra' },
                              { id: 'polyglot', icon: '🎨', title: 'Políglota' },
                              { id: 'streak_3', icon: '🔥', title: 'Constancia' },
                              { id: 'snake_50', icon: '🐍', title: 'Rey Snake' },
                              { id: 'simon_10', icon: '🔴', title: 'Simon Master' }
                          ].map(badge => {
                              const unlocked = unlockedAchievements.includes(badge.id);
                              return (
                                  <div 
                                      key={badge.id}
                                      style={{
                                          fontSize: '1.4rem',
                                          padding: '6px 8px',
                                          borderRadius: '10px',
                                          backgroundColor: unlocked ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.02)',
                                          border: unlocked ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.03)',
                                          filter: unlocked ? 'none' : 'grayscale(1) opacity(0.25)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                      }}
                                      title={`${badge.title} (${unlocked ? 'Desbloqueado' : 'Bloqueado'})`}
                                  >
                                      {unlocked ? badge.icon : '🔒'}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Mejores Tiempos Locales:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
                          {Object.keys(records).length} Categorías Jugadas
                      </span>
                  </div>
              </div>
          </div>

          {/* Catalog / Games Header Filter Controls */}
          <div>
              <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '12px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '15px'
              }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListFilter size={20} /> Catálogo de Juegos ({filteredGames.length})
                  </h2>
                  
                  {/* Filter tabs */}
                  <div style={{ display: 'flex', gap: '5px', backgroundColor: 'rgba(15,23,42,0.4)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      {[
                          { id: 'all', label: 'Todos' },
                          { id: 'logic', label: 'Lógica' },
                          { id: 'arcade', label: 'Arcade/Letras' },
                          { id: 'casual', label: 'Memoria/Mesa' }
                      ].map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => { playClick(); setFilter(tab.id); }}
                              style={{
                                  padding: '8px 14px',
                                  fontSize: '0.85rem',
                                  fontWeight: 'bold',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  border: 'none',
                                  backgroundColor: filter === tab.id ? 'var(--primary)' : 'transparent',
                                  color: filter === tab.id ? 'white' : 'var(--text-muted)',
                                  transition: 'all 0.2s'
                              }}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Game Cards Grid */}
              <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '24px',
                  paddingBottom: '40px'
              }}>
                  {filteredGames.map((game, index) => {
                      // Fetch record for this game to show personal best time
                      const gameId = game.to.replace('/', '');
                      const recordKey = `${gameId}_medium`;
                      const bestTime = records[recordKey]?.[0];

                      return (
                          <div key={index} style={{ position: 'relative' }}>
                              <GameCard 
                                  to={game.to}
                                  icon={game.icon}
                                  title={game.title}
                                  description={game.description}
                              />
                              {bestTime && (
                                  <div style={{
                                      position: 'absolute',
                                      bottom: '12px',
                                      right: '16px',
                                      fontSize: '0.75rem',
                                      color: '#60a5fa',
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      padding: '2px 8px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(59, 130, 246, 0.2)',
                                      fontWeight: 'bold',
                                      pointerEvents: 'none'
                                  }}>
                                      ⏱️ Récord: {formatTime(bestTime)}
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', marginTop: '40px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p>© {new Date().getFullYear()} Juegos para Pensar. Entrena tu mente todos los días.</p>
      </footer>

      {/* Global CSS for filters and layout responsive overrides */}
      <style>{`
          .dashboard-grid {
              animation: fadeIn 0.6s ease;
          }
          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 768px) {
              header h1 {
                  font-size: 2.6rem !important;
              }
              header p {
                  font-size: 1rem !important;
              }
          }
      `}</style>
    </div>
  );
};

export default Home;
