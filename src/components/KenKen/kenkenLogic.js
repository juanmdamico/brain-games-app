export const generateKenKen = (size) => {
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

    let visited = Array(size).fill().map(() => Array(size).fill(false));
    let cages = [];
    let cageGrid = Array(size).fill().map(() => Array(size).fill(-1));

    let cageId = 0;
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (!visited[r][c]) {
                let cageCells = [];
                let q = [[r,c]];
                visited[r][c] = true;
                
                let targetSize = Math.floor(Math.random() * 3) + 1; 
                
                while(q.length > 0 && cageCells.length < targetSize) {
                    let [currR, currC] = q.shift();
                    cageCells.push({r: currR, c: currC});
                    cageGrid[currR][currC] = cageId;
                    
                    let neighbors = [];
                    if (currR > 0 && !visited[currR-1][currC]) neighbors.push([currR-1, currC]);
                    if (currR < size-1 && !visited[currR+1][currC]) neighbors.push([currR+1, currC]);
                    if (currC > 0 && !visited[currR][currC-1]) neighbors.push([currR, currC-1]);
                    if (currC < size-1 && !visited[currR][currC+1]) neighbors.push([currR, currC+1]);
                    
                    if (neighbors.length > 0) {
                        let n = neighbors[Math.floor(Math.random() * neighbors.length)];
                        visited[n[0]][n[1]] = true;
                        q.push(n);
                    }
                }
                
                let values = cageCells.map(cell => board[cell.r][cell.c]);
                let target = 0;
                let op = '';
                
                if (cageCells.length === 1) {
                    target = values[0];
                } else if (cageCells.length === 2) {
                    let max = Math.max(values[0], values[1]);
                    let min = Math.min(values[0], values[1]);
                    let ops = ['+', '-', '*'];
                    if (max % min === 0) ops.push('/');
                    
                    op = ops[Math.floor(Math.random() * ops.length)];
                    if (op === '+') target = values[0] + values[1];
                    if (op === '-') target = max - min;
                    if (op === '*') target = values[0] * values[1];
                    if (op === '/') target = max / min;
                } else {
                    op = Math.random() > 0.5 ? '+' : '*';
                    if (op === '+') target = values.reduce((a,b) => a+b, 0);
                    if (op === '*') target = values.reduce((a,b) => a*b, 1);
                }
                
                cages.push({ id: cageId, cells: cageCells, target, op });
                cageId++;
            }
        }
    }

    return { solution: board, cages, cageGrid };
};

export const checkKenKenWin = (grid, cages, size) => {
    let errors = [];
    
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            if (grid[i][j] > 0) {
                for(let k=j+1; k<size; k++) if(grid[i][j] === grid[i][k]) { errors.push(`${i}-${j}`); errors.push(`${i}-${k}`); }
                for(let k=i+1; k<size; k++) if(grid[i][j] === grid[k][j]) { errors.push(`${i}-${j}`); errors.push(`${k}-${j}`); }
            }
        }
    }

    let incomplete = false;
    for (let cage of cages) {
        let values = cage.cells.map(c => grid[c.r][c.c]);
        if (values.includes(0)) {
            incomplete = true;
            continue;
        }
        
        let valid = false;
        if (cage.cells.length === 1) {
            valid = values[0] === cage.target;
        } else if (cage.cells.length === 2) {
            let max = Math.max(values[0], values[1]);
            let min = Math.min(values[0], values[1]);
            if (cage.op === '+') valid = values[0] + values[1] === cage.target;
            if (cage.op === '-') valid = max - min === cage.target;
            if (cage.op === '*') valid = values[0] * values[1] === cage.target;
            if (cage.op === '/') valid = max / min === cage.target;
        } else {
            if (cage.op === '+') valid = values.reduce((a,b)=>a+b,0) === cage.target;
            if (cage.op === '*') valid = values.reduce((a,b)=>a*b,1) === cage.target;
        }
        
        if (!valid) {
            cage.cells.forEach(c => errors.push(`${c.r}-${c.c}`));
        }
    }

    return { win: errors.length === 0 && !incomplete, errors, incomplete };
};
