export const checkTicTacToeWin = (board) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: lines[i] };
        }
    }
    
    if (board.every(cell => cell !== null)) {
        return { winner: 'draw', line: [] };
    }
    
    return null;
};

export const getBestMove = (board, difficulty, aiPlayer) => {
    const emptyCells = board.map((c, i) => c === null ? i : null).filter(i => i !== null);
    if (emptyCells.length === 0) return -1;
    
    if (difficulty === 'easy') {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
    
    // Check if AI can win
    for (let i of emptyCells) {
        let testBoard = [...board];
        testBoard[i] = aiPlayer;
        if (checkTicTacToeWin(testBoard)?.winner === aiPlayer) return i;
    }
    
    // Check if AI needs to block human
    if (difficulty === 'hard' || difficulty === 'medium') {
        for (let i of emptyCells) {
            let testBoard = [...board];
            testBoard[i] = humanPlayer;
            if (checkTicTacToeWin(testBoard)?.winner === humanPlayer) return i;
        }
    }
    
    if (difficulty === 'medium') {
        // Medium strategy: Prioritize center, else random
        if (board[4] === null) return 4;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    // Hard strategy: Center, then Corners, then Edges
    if (board[4] === null) return 4;
    
    const corners = [0, 2, 6, 8].filter(c => board[c] === null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
