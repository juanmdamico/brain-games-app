import React from 'react';
import { Link } from 'react-router-dom';

const WorldAtlasPage = () => {
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#020617', height: '100vh' }}>
      <Link to="/" style={{ color: '#0ea5e9', textDecoration: 'none' }}>← Volver</Link>
      <h1>Atlas Mundial 3D (En construcción)</h1>
    </div>
  );
};

export default WorldAtlasPage;
