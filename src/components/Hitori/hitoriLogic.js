export const generateHitori = (size) => {
    let board = Array(size).fill().map(() => Array(size).fill(0));
    
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            board[r][c] = ((r + c) % size) + 1;
        }
    }
    
    for (let i = size - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [board[i], board[j]] = [board[j], board[i]];
    }
    for (let i = size - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        for (let r=0; r<size; r++) {
            [board[r][i], board[r][j]] = [board[r][j], board[r][i]];
        }
    }
    
    let solution = Array(size).fill().map(() => Array(size).fill(1)); 
    let puzzle = board.map(row => [...row]);
    
    let numBlacks = Math.floor(size * size * 0.35);
    let attempts = 0;
    while(numBlacks > 0 && attempts < 200) {
        attempts++;
        let r = Math.floor(Math.random() * size);
        let c = Math.floor(Math.random() * size);
        
        if (solution[r][c] === 2) continue;
        
        let adjBlack = false;
        if (r>0 && solution[r-1][c] === 2) adjBlack = true;
        if (r<size-1 && solution[r+1][c] === 2) adjBlack = true;
        if (c>0 && solution[r][c-1] === 2) adjBlack = true;
        if (c<size-1 && solution[r][c+1] === 2) adjBlack = true;
        
        if (adjBlack) continue;
        
        solution[r][c] = 2;
        
        let visited = Array(size).fill().map(() => Array(size).fill(false));
        let start = null;
        let expectedWhites = 0;
        for (let i=0; i<size; i++) {
            for (let j=0; j<size; j++) {
                if (solution[i][j] === 1) { 
                    if(!start) start = [i, j]; 
                    expectedWhites++;
                }
            }
        }
        
        let q = [start];
        visited[start[0]][start[1]] = true;
        let whiteCount = 1;
        while(q.length > 0) {
            let [cr, cc] = q.shift();
            let neighbors = [[cr-1,cc], [cr+1,cc], [cr,cc-1], [cr,cc+1]];
            for(let n of neighbors) {
                if(n[0]>=0 && n[0]<size && n[1]>=0 && n[1]<size && solution[n[0]][n[1]]===1 && !visited[n[0]][n[1]]) {
                    visited[n[0]][n[1]] = true;
                    whiteCount++;
                    q.push(n);
                }
            }
        }
        
        if (whiteCount !== expectedWhites) {
            solution[r][c] = 1; 
            continue;
        }
        
        let isRow = Math.random() > 0.5;
        if (isRow) {
            let dupC = Math.floor(Math.random() * size);
            while (dupC === c || solution[r][dupC] === 2) dupC = (dupC+1)%size;
            puzzle[r][c] = puzzle[r][dupC];
        } else {
            let dupR = Math.floor(Math.random() * size);
            while (dupR === r || solution[dupR][c] === 2) dupR = (dupR+1)%size;
            puzzle[r][c] = puzzle[dupR][c];
        }
        
        numBlacks--;
    }
    
    return { puzzle, solution };
};

export const checkHitoriWin = (currentGrid, puzzleGrid) => {
    let size = currentGrid.length;
    let errors = [];
    
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (currentGrid[r][c] === 2) {
                if (r<size-1 && currentGrid[r+1][c] === 2) { errors.push(`${r}-${c}`); errors.push(`${r+1}-${c}`); }
                if (c<size-1 && currentGrid[r][c+1] === 2) { errors.push(`${r}-${c}`); errors.push(`${r}-${c+1}`); }
            }
        }
    }
    
    for (let i=0; i<size; i++) {
        let rowVals = {};
        let colVals = {};
        for (let j=0; j<size; j++) {
            if (currentGrid[i][j] !== 2) {
                let v = puzzleGrid[i][j];
                if (rowVals[v] !== undefined) { errors.push(`${i}-${j}`); errors.push(`${i}-${rowVals[v]}`); }
                rowVals[v] = j;
            }
            if (currentGrid[j][i] !== 2) {
                let v = puzzleGrid[j][i];
                if (colVals[v] !== undefined) { errors.push(`${j}-${i}`); errors.push(`${colVals[v]}-${i}`); }
                colVals[v] = j;
            }
        }
    }
    
    let visited = Array(size).fill().map(() => Array(size).fill(false));
    let start = null;
    let whiteCount = 0;
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            if (currentGrid[i][j] !== 2) { 
                if(!start) start = [i, j]; 
                whiteCount++;
            }
        }
    }
    
    let count = 0;
    if (start) {
        let q = [start];
        visited[start[0]][start[1]] = true;
        count = 1;
        while(q.length > 0) {
            let [cr, cc] = q.shift();
            let neighbors = [[cr-1,cc], [cr+1,cc], [cr,cc-1], [cr,cc+1]];
            for(let n of neighbors) {
                if(n[0]>=0 && n[0]<size && n[1]>=0 && n[1]<size && currentGrid[n[0]][n[1]]!==2 && !visited[n[0]][n[1]]) {
                    visited[n[0]][n[1]] = true;
                    count++;
                    q.push(n);
                }
            }
        }
    }
    
    let disconnected = count !== whiteCount;
    return { win: errors.length === 0 && !disconnected, errors, disconnected };
};
