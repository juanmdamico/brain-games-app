import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Board from '../components/Sudoku/Board';
import GameControls from '../components/common/GameControls';
import Timer from '../components/common/Timer';
import InstructionsModal from '../components/common/InstructionsModal';
import VictoryModal from '../components/common/VictoryModal';
import { generateSudoku, checkSolutionStatus } from '../utils/sudokuLogic';
import { useApp } from '../context/AppContext';

const SudokuPage = () => {
  const { playClick, playSuccessSfx, playErrorSfx } = useApp();

  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [solvedBoard, setSolvedBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [difficulty, setDifficulty] = useState('easy');
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState(null);
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const startNewGame = useCallback(() => {
    const { board: newBoard, solvedBoard: newSolved } = generateSudoku(difficulty);
    setBoard(newBoard);
    
    const initial = newBoard.map(row => [...row]);
    setInitialBoard(initial);
    setSolvedBoard(newSolved);
    
    setSelectedCell(null);
    setErrors([]);
    setMessage(null);
    setTimerRunning(true);
    setResetTrigger(prev => prev + 1);
    setShowVictory(false);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCellClick = (row, col) => {
    playClick();
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (number) => {
    if (selectedCell) {
      playClick();
      const newBoard = board.map(row => [...row]);
      newBoard[selectedCell.row][selectedCell.col] = number;
      setBoard(newBoard);
      setErrors([]);
      setMessage(null);
    }
  };

  const handleCheck = () => {
    playClick();
    const status = checkSolutionStatus(board, solvedBoard);
    setErrors(status.errors);

    if (status.isComplete && status.errors.length === 0) {
        setMessage({ type: 'success', text: "¡Felicidades! Has resuelto el Sudoku." });
        setTimerRunning(false);
        setShowVictory(true);
    } else if (status.errors.length > 0) {
        playErrorSfx();
        setMessage({ type: 'error-msg', text: `Hay ${status.errors.length} error(es) en el tablero. Intenta corregirlos.` });
    } else if (!status.isComplete) {
        setMessage({ type: 'error-msg', text: "Aún faltan números por llenar." });
    }
  };

  const handleSolve = () => {
    playClick();
    const newBoard = solvedBoard.map(row => [...row]);
    setBoard(newBoard);
    setErrors([]);
    setMessage({ type: 'success', text: "Sudoku resuelto automáticamente." });
    setTimerRunning(false);
    setShowVictory(true);
  };

  // Smart Hint function for Sudoku
  const handleHint = () => {
    playClick();
    
    // 1. Check if user has wrong values
    const wrongCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0 && initialBoard[r][c] === 0 && board[r][c] !== solvedBoard[r][c]) {
          wrongCells.push({ r, c });
        }
      }
    }

    if (wrongCells.length > 0) {
      // Highlight the first wrong cell as an error
      const target = wrongCells[0];
      setSelectedCell({ row: target.r, col: target.c });
      setErrors([target]);
      playErrorSfx();
      setMessage({
        type: 'error-msg',
        text: `Pista: El número en la fila ${target.r + 1}, columna ${target.c + 1} es incorrecto. ¡Corrígelo!`
      });
      return;
    }

    // 2. Find empty cells to reveal
    let targetRow = -1;
    let targetCol = -1;

    // Use selected cell if empty and not fixed
    if (selectedCell && board[selectedCell.row][selectedCell.col] === 0 && initialBoard[selectedCell.row][selectedCell.col] === 0) {
      targetRow = selectedCell.row;
      targetCol = selectedCell.col;
    } else {
      // Find first empty cell
      for (let r = 0; r < 9; r++) {
        let found = false;
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            targetRow = r;
            targetCol = c;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    if (targetRow !== -1 && targetCol !== -1) {
      const correctVal = solvedBoard[targetRow][targetCol];
      const newBoard = board.map(row => [...row]);
      newBoard[targetRow][targetCol] = correctVal;
      
      setBoard(newBoard);
      setSelectedCell({ row: targetRow, col: targetCol });
      setErrors([]);
      playSuccessSfx();
      setMessage({
        type: 'success',
        text: `Pista: Colocamos el número ${correctVal} en la fila ${targetRow + 1}, columna ${targetCol + 1}.`
      });
    } else {
      setMessage({
        type: 'success',
        text: "¡El tablero ya está completo!"
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedCell) return;
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(0);
      } else if (e.key.startsWith('Arrow')) {
          moveSelection(e.key);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const moveSelection = (key) => {
      if (!selectedCell) return;
      let { row, col } = selectedCell;
      if (key === 'ArrowUp') row = Math.max(0, row - 1);
      if (key === 'ArrowDown') row = Math.min(8, row + 1);
      if (key === 'ArrowLeft') col = Math.max(0, col - 1);
      if (key === 'ArrowRight') col = Math.min(8, col + 1);
      
      if (initialBoard[row][col] === 0) {
          setSelectedCell({ row, col });
      }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', overflowX: 'hidden' }}>
      
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '20px', zIndex: 10 }}>
        <Link to="/" onClick={playClick} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-color)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
          &larr; Volver al Hub
        </Link>
      </div>

      <div className="container" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '500px', width: '100%' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Timer isRunning={timerRunning} onTimeUpdate={setTime} resetTrigger={resetTrigger} />
          <h1 style={{ fontWeight: 600, fontSize: '2.2rem', margin: '0 20px', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sudoku
          </h1>
          <button 
              onClick={() => { playClick(); setShowInstructions(true); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#60a5fa', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
              <HelpCircle size={28} />
          </button>
        </header>

        <div className="board-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Board 
            board={board} 
            initialBoard={initialBoard}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            errors={errors}
          />
        </div>

        {message && (
          <div className={`message ${message.type}`} style={{
            textAlign: 'center', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600,
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
            color: message.type === 'success' ? '#34d399' : '#fb7185',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`
          }}>
            {message.text}
          </div>
        )}

        <GameControls 
          difficultyOptions={[
            {value: 'easy', label: 'Fácil'},
            {value: 'medium', label: 'Medio'},
            {value: 'hard', label: 'Difícil'}
          ]}
          currentDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onNewGame={startNewGame}
          actions={[
              {label: 'Comprobar', onClick: handleCheck, variant: 'primary'},
              {label: 'Pista 💡', onClick: handleHint, variant: 'secondary'},
              {label: 'Resolver', onClick: handleSolve, variant: 'secondary'}
          ]}
          showNumpad={true}
          onNumberClick={handleNumberInput}
        />
      </div>

      <InstructionsModal 
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="Sudoku"
          instructions={[
              "El objetivo es rellenar una cuadrícula de 9x9 celdas.",
              "Debes rellenarla de forma que cada columna, cada fila y cada uno de los nueve bloques de 3x3 que la componen contengan los números del 1 al 9 sin repetirse.",
              "Usa el pad numérico o tu teclado para introducir los números."
          ]}
      />
      
      <VictoryModal 
          isOpen={showVictory}
          onClose={() => setShowVictory(false)}
          time={time}
          gameName="Sudoku"
          difficulty={difficulty}
      />
    </div>
  );
};

export default SudokuPage;
