export const init2048 = () => {
    let board = Array(4).fill().map(() => Array(4).fill(0));
    board = addRandomTile(board);
    board = addRandomTile(board);
    return { board, score: 0, gameOver: false, won: false };
};

const addRandomTile = (board) => {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length === 0) return board;

    let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let newBoard = board.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
};

export const moveBoard = (board, direction) => {
    let newBoard = board.map(row => [...row]);
    let scoreAdded = 0;
    let moved = false;

    const moveLeft = (row) => {
        let newRow = row.filter(val => val !== 0);
        let rowScore = 0;
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                rowScore += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        while (newRow.length < 4) newRow.push(0);
        return { newRow, rowScore };
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
        for (let r = 0; r < 4; r++) {
            let row = newBoard[r];
            if (direction === 'RIGHT') row.reverse();
            let { newRow, rowScore } = moveLeft(row);
            if (direction === 'RIGHT') newRow.reverse();
            
            if (newRow.join(',') !== newBoard[r].join(',')) moved = true;
            newBoard[r] = newRow;
            scoreAdded += rowScore;
        }
    } else if (direction === 'UP' || direction === 'DOWN') {
        for (let c = 0; c < 4; c++) {
            let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
            if (direction === 'DOWN') col.reverse();
            let { newRow, rowScore } = moveLeft(col);
            if (direction === 'DOWN') newRow.reverse();

            for (let r = 0; r < 4; r++) {
                if (newBoard[r][c] !== newRow[r]) moved = true;
                newBoard[r][c] = newRow[r];
            }
            scoreAdded += rowScore;
        }
    }

    if (moved) {
        newBoard = addRandomTile(newBoard);
    }

    let gameOver = true;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (newBoard[r][c] === 0) gameOver = false;
            if (r < 3 && newBoard[r][c] === newBoard[r+1][c]) gameOver = false;
            if (c < 3 && newBoard[r][c] === newBoard[r][c+1]) gameOver = false;
        }
    }

    let won = false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (newBoard[r][c] >= 2048) won = true;
        }
    }

    return { board: newBoard, scoreAdded, moved, gameOver, won };
};
