export const generateMinesweeperBoard = (rows, cols, mines, firstClickRow = -1, firstClickCol = -1) => {
    let board = Array(rows).fill().map(() => Array(cols).fill({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
    }));

    let minesPlaced = 0;
    while (minesPlaced < mines) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        
        // Protect 3x3 area around first click to ensure a good start, not just the single cell
        let isProtected = false;
        if (firstClickRow !== -1) {
            if (Math.abs(r - firstClickRow) <= 1 && Math.abs(c - firstClickCol) <= 1) {
                isProtected = true;
            }
        }

        if (!board[r][c].isMine && !isProtected) {
            let newRow = [...board[r]];
            newRow[c] = { ...newRow[c], isMine: true };
            board[r] = newRow;
            minesPlaced++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        let nr = r + i;
                        let nc = c + j;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                let newRow = [...board[r]];
                newRow[c] = { ...newRow[c], neighborMines: count };
                board[r] = newRow;
            }
        }
    }
    return board;
};

export const revealCell = (board, row, col) => {
    const rows = board.length;
    const cols = board[0].length;
    
    let newBoard = board.map(r => r.map(c => ({...c})));
    
    if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
        return newBoard;
    }

    const stack = [[row, col]];
    while(stack.length > 0) {
        const [r, c] = stack.pop();
        if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;
        
        newBoard[r][c].isRevealed = true;
        
        if (newBoard[r][c].neighborMines === 0 && !newBoard[r][c].isMine) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    let nr = r + i;
                    let nc = c + j;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (!newBoard[nr][nc].isRevealed) {
                            stack.push([nr, nc]);
                        }
                    }
                }
            }
        }
    }
    return newBoard;
};

export const checkWin = (board) => {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            if (!board[r][c].isMine && !board[r][c].isRevealed) {
                return false;
            }
        }
    }
    return true;
};
