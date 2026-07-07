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
import KuromasuPage from './pages/KuromasuPage';
import ShikakuPage from './pages/ShikakuPage';
import CheckersPage from './pages/CheckersPage';
import ReversiPage from './pages/ReversiPage';
import GomokuPage from './pages/GomokuPage';
import BattleshipPage from './pages/BattleshipPage';
import MahjongPage from './pages/MahjongPage';
import SpiderPage from './pages/SpiderPage';
import FreeCellPage from './pages/FreeCellPage';
import VideoPokerPage from './pages/VideoPokerPage';
import BlockPuzzlePage from './pages/BlockPuzzlePage';
import RushHourPage from './pages/RushHourPage';
import PlumberPage from './pages/PlumberPage';
import PacmanPage from './pages/PacmanPage';
import BreakoutPage from './pages/BreakoutPage';
import AudioPairsPage from './pages/AudioPairsPage';
import BrainClickerPage from './pages/BrainClickerPage';
import MinesweeperDuelPage from './pages/MinesweeperDuelPage';
import NeuroscapePage from './pages/NeuroscapePage';
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
            <Route path="/kuromasu" element={<KuromasuPage />} />
            <Route path="/shikaku" element={<ShikakuPage />} />
            <Route path="/damas" element={<CheckersPage />} />
            <Route path="/reversi" element={<ReversiPage />} />
            <Route path="/gomoku" element={<GomokuPage />} />
            <Route path="/battleship" element={<BattleshipPage />} />
            <Route path="/mahjong" element={<MahjongPage />} />
            <Route path="/spider" element={<SpiderPage />} />
            <Route path="/freecell" element={<FreeCellPage />} />
            <Route path="/videopoker" element={<VideoPokerPage />} />
            <Route path="/blockpuzzle" element={<BlockPuzzlePage />} />
            <Route path="/rushhour" element={<RushHourPage />} />
            <Route path="/plumber" element={<PlumberPage />} />
            <Route path="/pacman" element={<PacmanPage />} />
            <Route path="/breakout" element={<BreakoutPage />} />
            <Route path="/audiopairs" element={<AudioPairsPage />} />
            <Route path="/brainclicker" element={<BrainClickerPage />} />
            <Route path="/buscaminasduel" element={<MinesweeperDuelPage />} />
            <Route path="/neuroscape" element={<NeuroscapePage />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
}

export default App;
