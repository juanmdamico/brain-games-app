import React from 'react';
import Cell from './Cell';

const Board = ({ board, fixedCells, selectedCell, errors, onCellClick }) => {
  return (
    <div id="sudoku-board" style={{
        display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', 
        gridTemplateRows: 'repeat(9, 1fr)', border: 'var(--border-thick)', 
        backgroundColor: 'var(--cell-border)', borderRadius: '8px', 
        overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }}>
      {board.map((row, rIndex) => (
        row.map((cellValue, cIndex) => {
          const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
          
          let isHighlighted = false;
          if (selectedCell) {
            if (selectedCell.row === rIndex || selectedCell.col === cIndex) isHighlighted = true;
            if (Math.floor(selectedCell.row / 3) === Math.floor(rIndex / 3) && 
                Math.floor(selectedCell.col / 3) === Math.floor(cIndex / 3)) {
              isHighlighted = true;
            }
            if (cellValue !== 0 && cellValue === board[selectedCell.row][selectedCell.col]) {
              isHighlighted = true;
            }
          }

          const isFixed = fixedCells[rIndex][cIndex] !== 0;
          const isError = errors.includes(`${rIndex}-${cIndex}`);

          return (
            <Cell
              key={`${rIndex}-${cIndex}`}
              value={cellValue}
              isFixed={isFixed}
              isSelected={isSelected}
              isHighlighted={isHighlighted}
              isError={isError}
              onCellClick={() => onCellClick(rIndex, cIndex)}
            />
          );
        })
      ))}
    </div>
  );
};

export default Board;
