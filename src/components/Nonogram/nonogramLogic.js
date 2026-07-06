export const generateNonogram = (size) => {
    let grid = Array(size).fill().map(() => Array(size).fill(false));
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            grid[r][c] = Math.random() > 0.45;
        }
    }
    
    grid[0][0] = true;
    grid[size-1][size-1] = true;

    const countClues = (line) => {
        let clues = [];
        let current = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i]) {
                current++;
            } else if (current > 0) {
                clues.push(current);
                current = 0;
            }
        }
        if (current > 0) clues.push(current);
        if (clues.length === 0) clues.push(0);
        return clues;
    };

    let rowClues = [];
    for (let r=0; r<size; r++) {
        rowClues.push(countClues(grid[r]));
    }

    let colClues = [];
    for (let c=0; c<size; c++) {
        let col = [];
        for (let r=0; r<size; r++) {
            col.push(grid[r][c]);
        }
        colClues.push(countClues(col));
    }

    return { solution: grid, rowClues, colClues };
};

export const checkNonogramWin = (currentGrid, solution) => {
    for (let r=0; r<solution.length; r++) {
        for (let c=0; c<solution[0].length; c++) {
            const isFilled = currentGrid[r][c] === 1;
            if (isFilled !== solution[r][c]) return false;
        }
    }
    return true;
};
