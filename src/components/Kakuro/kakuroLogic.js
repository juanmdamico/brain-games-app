export const generateKakuro = (size) => {
    let grid = Array(size).fill().map(() => Array(size).fill({ type: 'white', value: 0 }));
    
    // Top and Left borders are always black
    for(let i=0; i<size; i++) {
        grid[0][i] = { type: 'black', down: 0, right: 0 };
        grid[i][0] = { type: 'black', down: 0, right: 0 };
    }
    
    // Add random blocks
    for(let i=0; i<Math.floor(size*size*0.15); i++) {
        let r = Math.floor(Math.random() * (size-1)) + 1;
        let c = Math.floor(Math.random() * (size-1)) + 1;
        grid[r][c] = { type: 'black', down: 0, right: 0 };
    }

    // A brute force valid fill
    let solution = Array(size).fill().map(() => Array(size).fill(0));
    let success = false;

    // We will just do a greedy fill and if it gets stuck, we put a black cell there!
    for (let r=1; r<size; r++) {
        for (let c=1; c<size; c++) {
            if (grid[r][c].type === 'white') {
                let used = new Set();
                for (let k = c-1; k > 0 && grid[r][k].type === 'white'; k--) used.add(solution[r][k]);
                for (let k = r-1; k > 0 && grid[k][c].type === 'white'; k--) used.add(solution[k][c]);
                
                let available = [1,2,3,4,5,6,7,8,9].filter(x => !used.has(x));
                if (available.length === 0) {
                    // Make it a black cell to resolve impossibility
                    grid[r][c] = { type: 'black', down: 0, right: 0 };
                } else {
                    solution[r][c] = available[Math.floor(Math.random() * available.length)];
                }
            }
        }
    }

    let newGrid = grid.map(r => r.map(c => ({...c})));
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (newGrid[r][c].type === 'black') {
                if (c < size-1 && newGrid[r][c+1].type === 'white') {
                    let sum = 0;
                    for (let k = c+1; k < size && newGrid[r][k].type === 'white'; k++) sum += solution[r][k];
                    newGrid[r][c].right = sum;
                }
                if (r < size-1 && newGrid[r+1][c].type === 'white') {
                    let sum = 0;
                    for (let k = r+1; k < size && newGrid[k][c].type === 'white'; k++) sum += solution[k][c];
                    newGrid[r][c].down = sum;
                }
            }
        }
    }

    return { grid: newGrid, solution };
};

export const checkKakuroWin = (currentGrid) => {
    const size = currentGrid.length;
    let errors = [];
    let incomplete = false;
    
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (currentGrid[r][c].type === 'white' && currentGrid[r][c].value === 0) {
                incomplete = true;
            }
        }
    }

    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (currentGrid[r][c].type === 'black') {
                if (currentGrid[r][c].right > 0) {
                    let sum = 0;
                    let used = new Set();
                    let runErrors = [];
                    for (let k = c+1; k < size && currentGrid[r][k].type === 'white'; k++) {
                        let val = currentGrid[r][k].value;
                        if(val === 0) continue;
                        sum += val;
                        if (used.has(val)) runErrors.push(`${r}-${k}`);
                        used.add(val);
                    }
                    if (!incomplete && sum !== currentGrid[r][c].right) {
                        for (let k = c+1; k < size && currentGrid[r][k].type === 'white'; k++) {
                             runErrors.push(`${r}-${k}`);
                        }
                    }
                    errors.push(...runErrors);
                }

                if (currentGrid[r][c].down > 0) {
                    let sum = 0;
                    let used = new Set();
                    let runErrors = [];
                    for (let k = r+1; k < size && currentGrid[k][c].type === 'white'; k++) {
                        let val = currentGrid[k][c].value;
                        if(val === 0) continue;
                        sum += val;
                        if (used.has(val)) runErrors.push(`${k}-${c}`);
                        used.add(val);
                    }
                    if (!incomplete && sum !== currentGrid[r][c].down) {
                        for (let k = r+1; k < size && currentGrid[k][c].type === 'white'; k++) {
                             runErrors.push(`${k}-${c}`);
                        }
                    }
                    errors.push(...runErrors);
                }
            }
        }
    }

    return { win: errors.length === 0 && !incomplete, errors, incomplete };
};
