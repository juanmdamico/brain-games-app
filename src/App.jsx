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
import Connect4Page from './pages/Connect4Page';
import ReactionPage from './pages/ReactionPage';
import SliderPage from './pages/SliderPage';
import WordSearchPage from './pages/WordSearchPage';
import HangmanPage from './pages/HangmanPage';
import MastermindPage from './pages/MastermindPage';
import SokobanPage from './pages/SokobanPage';
import TetrisPage from './pages/TetrisPage';
import CrosswordPage from './pages/CrosswordPage';
import FlowFreePage from './pages/FlowFreePage';
import TypingTestPage from './pages/TypingTestPage';
import EntanglementPage from './pages/EntanglementPage';
import FutoshikiPage from './pages/FutoshikiPage';
import KillerSudokuPage from './pages/KillerSudokuPage';
import NurikabePage from './pages/NurikabePage';
import HashiPage from './pages/HashiPage';
import AkariPage from './pages/AkariPage';
import MasyuPage from './pages/MasyuPage';
import StarBattlePage from './pages/StarBattlePage';
import YinYangPage from './pages/YinYangPage';
import AnagramPage from './pages/AnagramPage';
import SpellingBeePage from './pages/SpellingBeePage';
import KlondikePage from './pages/KlondikePage';
import BlackjackPage from './pages/BlackjackPage';
import ChessPuzzlesPage from './pages/ChessPuzzlesPage';
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
            <Route path="/conecta4" element={<Connect4Page />} />
            <Route path="/reflejos" element={<ReactionPage />} />
            <Route path="/deslizante" element={<SliderPage />} />
            <Route path="/sopadeletras" element={<WordSearchPage />} />
            <Route path="/ahorcado" element={<HangmanPage />} />
            <Route path="/mastermind" element={<MastermindPage />} />
            <Route path="/sokoban" element={<SokobanPage />} />
            <Route path="/tetris" element={<TetrisPage />} />
            <Route path="/crucigrama" element={<CrosswordPage />} />
            <Route path="/lineascolores" element={<FlowFreePage />} />
            <Route path="/testmecanografia" element={<TypingTestPage />} />
            <Route path="/entrelazamiento" element={<EntanglementPage />} />
            <Route path="/futoshiki" element={<FutoshikiPage />} />
            <Route path="/killersudoku" element={<KillerSudokuPage />} />
            <Route path="/nurikabe" element={<NurikabePage />} />
            <Route path="/hashi" element={<HashiPage />} />
            <Route path="/akari" element={<AkariPage />} />
            <Route path="/masyu" element={<MasyuPage />} />
            <Route path="/starbattle" element={<StarBattlePage />} />
            <Route path="/yinyang" element={<YinYangPage />} />
            <Route path="/anagrama" element={<AnagramPage />} />
            <Route path="/spellingbee" element={<SpellingBeePage />} />
            <Route path="/solitario" element={<KlondikePage />} />
            <Route path="/blackjack" element={<BlackjackPage />} />
            <Route path="/ajedrez" element={<ChessPuzzlesPage />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
