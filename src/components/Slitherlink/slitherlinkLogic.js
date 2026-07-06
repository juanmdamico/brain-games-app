const PUZZLES = {
    '5': {
        size: 5,
        numbers: [
            [null, null, 3, null, null],
            [null, 2, null, 2, null],
            [3, null, null, null, 3],
            [null, 2, null, 2, null],
            [null, null, 3, null, null]
        ]
    },
    '7': {
        size: 7,
        numbers: [
            [3, null, null, null, null, null, 3],
            [null, 2, null, null, null, 2, null],
            [null, null, 2, null, 2, null, null],
            [null, null, null, 0, null, null, null],
            [null, null, 2, null, 2, null, null],
            [null, 2, null, null, null, 2, null],
            [3, null, null, null, null, null, 3]
        ]
    },
    '10': {
        size: 10,
        numbers: [
            [null,3,null,2,null,null,2,null,3,null],
            [3,null,2,null,1,1,null,2,null,3],
            [null,2,null,0,null,null,0,null,2,null],
            [2,null,0,null,3,3,null,0,null,2],
            [null,1,null,3,null,null,3,null,1,null],
            [null,1,null,3,null,null,3,null,1,null],
            [2,null,0,null,3,3,null,0,null,2],
            [null,2,null,0,null,null,0,null,2,null],
            [3,null,2,null,1,1,null,2,null,3],
            [null,3,null,2,null,null,2,null,3,null]
        ]
    }
};

export const generateSlitherlink = (size) => {
    const puzzle = PUZZLES[size.toString()];
    return {
        size: puzzle.size,
        numbers: puzzle.numbers.map(row => [...row])
    };
};

export const checkSlitherlinkWin = (size, horizEdges, vertEdges, numbers) => {
    let errors = [];
    
    let numErrors = false;
    for (let r=0; r<size; r++) {
        for (let c=0; c<size; c++) {
            if (numbers[r][c] !== null) {
                let count = 0;
                if (horizEdges[r][c]) count++; 
                if (horizEdges[r+1][c]) count++; 
                if (vertEdges[r][c]) count++; 
                if (vertEdges[r][c+1]) count++; 
                
                if (count !== numbers[r][c]) {
                    errors.push(`cell-${r}-${c}`);
                    numErrors = true;
                }
            }
        }
    }
    
    let degrees = Array(size+1).fill().map(() => Array(size+1).fill(0));
    
    for (let r=0; r<=size; r++) {
        for (let c=0; c<size; c++) {
            if (horizEdges[r][c]) {
                degrees[r][c]++;
                degrees[r][c+1]++;
            }
        }
    }
    for (let r=0; r<size; r++) {
        for (let c=0; c<=size; c++) {
            if (vertEdges[r][c]) {
                degrees[r][c]++;
                degrees[r+1][c]++;
            }
        }
    }
    
    let branchingError = false;
    let startNode = null;
    let totalEdges = 0;
    
    for (let r=0; r<=size; r++) {
        for (let c=0; c<=size; c++) {
            if (degrees[r][c] > 0) {
                if (degrees[r][c] !== 2) {
                    branchingError = true;
                    errors.push(`node-${r}-${c}`);
                }
                if (!startNode) startNode = [r, c];
                totalEdges += degrees[r][c]; 
            }
        }
    }
    
    totalEdges = totalEdges / 2;
    
    let visitedEdgesCount = 0;
    if (startNode && !branchingError) {
        let visitedNodes = new Set();
        let q = [startNode];
        visitedNodes.add(`${startNode[0]}-${startNode[1]}`);
        
        while(q.length > 0) {
            let [r, c] = q.shift();
            let neighbors = [];
            
            if (r > 0 && vertEdges[r-1][c]) {
                neighbors.push([r-1, c]);
                visitedEdgesCount += 0.5; 
            }
            if (r < size && vertEdges[r][c]) {
                neighbors.push([r+1, c]);
                visitedEdgesCount += 0.5;
            }
            if (c > 0 && horizEdges[r][c-1]) {
                neighbors.push([r, c-1]);
                visitedEdgesCount += 0.5;
            }
            if (c < size && horizEdges[r][c]) {
                neighbors.push([r, c+1]);
                visitedEdgesCount += 0.5;
            }
            
            for(let n of neighbors) {
                let key = `${n[0]}-${n[1]}`;
                if (!visitedNodes.has(key)) {
                    visitedNodes.add(key);
                    q.push(n);
                }
            }
        }
    }
    
    let disconnected = startNode && !branchingError && Math.round(visitedEdgesCount) !== totalEdges;
    
    let isWin = !numErrors && !branchingError && !disconnected && totalEdges > 0;
    
    return { win: isWin, errors, numErrors, branchingError, disconnected, isEmpty: totalEdges === 0 };
};
