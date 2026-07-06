export const COLORS = ['green', 'red', 'yellow', 'blue'];

export const getRandomColor = () => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
};
