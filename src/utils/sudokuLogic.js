export const generateSudoku = (difficultyLevel) => {
    let board = Array(9).fill().map(() => Array(9).fill(0));
    let solvedBoard = Array(9).fill().map(() => Array(9).fill(0));
    
    fillBoard(solvedBoard);
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            board[i][j] = solvedBoard[i][j];
        }
    }
    
    const difficulties = {
        easy: 30,
        medium: 45,
        hard: 55
    };
    
    const removeCount = difficulties[difficultyLevel] || 45;
    let removed = 0;
    
    while (removed < removeCount) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }

    return { board, solvedBoard };
};

export const fillBoard = (mat) => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (mat[i][j] === 0) {
                let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                nums.sort(() => Math.random() - 0.5);
                
                for (let n of nums) {
                    if (isSafe(mat, i, j, n)) {
                        mat[i][j] = n;
                        if (fillBoard(mat)) {
                            return true;
                        }
                        mat[i][j] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

export const isSafe = (mat, row, col, num) => {
    for (let x = 0; x < 9; x++) {
        if (mat[row][x] === num || mat[x][col] === num) {
            return false;
        }
    }
    let startRow = row - row % 3;
    let startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (mat[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }
    return true;
};

export const checkSolutionStatus = (currentBoard, solvedBoard) => {
    let isComplete = true;
    let isCorrect = true;
    let errors = [];

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (currentBoard[r][c] === 0) {
                isComplete = false;
            } else if (currentBoard[r][c] !== solvedBoard[r][c]) {
                isCorrect = false;
                errors.push(`${r}-${c}`);
            }
        }
    }

    return { isComplete, isCorrect, errors };
};
