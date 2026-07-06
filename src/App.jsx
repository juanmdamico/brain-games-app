import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SudokuPage from './pages/SudokuPage';
import MinesweeperPage from './pages/MinesweeperPage';
import Game2048Page from './pages/Game2048Page';
import NonogramPage from './pages/NonogramPage';
import KakuroPage from './pages/KakuroPage';
import KenKenPage from './pages/KenKenPage';
import HitoriPage from './pages/HitoriPage';
import SlitherlinkPage from './pages/SlitherlinkPage';
import WordlePage from './pages/WordlePage';
import MemoryMatchPage from './pages/MemoryMatchPage';
import SnakePage from './pages/SnakePage';
import TicTacToePage from './pages/TicTacToePage';
import SimonSaysPage from './pages/SimonSaysPage';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/common/AppLayout';
import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sudoku" element={<SudokuPage />} />
            <Route path="/buscaminas" element={<MinesweeperPage />} />
            <Route path="/2048" element={<Game2048Page />} />
            <Route path="/nonogramas" element={<NonogramPage />} />
            <Route path="/kakuro" element={<KakuroPage />} />
            <Route path="/kenken" element={<KenKenPage />} />
            <Route path="/hitori" element={<HitoriPage />} />
            <Route path="/slitherlink" element={<SlitherlinkPage />} />
            <Route path="/wordle" element={<WordlePage />} />
            <Route path="/memorymatch" element={<MemoryMatchPage />} />
            <Route path="/snake" element={<SnakePage />} />
            <Route path="/tictactoe" element={<TicTacToePage />} />
            <Route path="/simonsays" element={<SimonSaysPage />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
