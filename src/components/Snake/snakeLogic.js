export const GRID_SIZE = 20;

export const getInitialSnake = () => [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
];

export const generateFood = (snake) => {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!isOnSnake) {
            break;
        }
    }
    return newFood;
};
