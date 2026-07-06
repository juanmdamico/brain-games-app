import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register PWA Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
      .catch(err => console.warn('Fallo al registrar Service Worker:', err));
  });
} else if ('serviceWorker' in navigator && !import.meta.env.PROD) {
  // Register in dev too if desired, or skip. Let's register it to allow offline testing
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registrado en desarrollo:', reg.scope))
      .catch(err => console.warn('Fallo al registrar Service Worker en desarrollo:', err));
  });
}
