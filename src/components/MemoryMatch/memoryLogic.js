export const getShuffledCards = (difficulty = 'easy') => {
    let pairs = 6;
    if (difficulty === 'medium') pairs = 10;
    if (difficulty === 'hard') pairs = 15;

    const emojis = [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", 
        "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐧", 
        "🐦", "🐤", "🦉", "🦄"
    ];
    
    // Select the required number of pairs
    const selectedEmojis = [];
    while (selectedEmojis.length < pairs) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        if (!selectedEmojis.includes(randomEmoji)) {
            selectedEmojis.push(randomEmoji);
        }
    }

    // Duplicate them to create pairs
    const cards = [...selectedEmojis, ...selectedEmojis];
    
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards.map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
    }));
};
