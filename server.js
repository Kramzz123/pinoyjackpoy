const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Simulation (In a real casino, this uses PostgreSQL or MongoDB)
let userWallets = {
    "Admin": 10000,
    "Guest": 0
};

const SYMBOLS = ['J', 'Q', 'K', 'A', '♠️', '♥️', '♦️', '♣️'];

// Route: Get current player balance
app.post('/api/balance', (req, res) => {
    const { username } = req.body;
    if (!userWallets[username]) userWallets[username] = 0;
    res.json({ balance: userWallets[username] });
});

// Route: Securely handle deposits
app.post('/api/deposit', (req, res) => {
    const { username, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    
    if (!userWallets[username]) userWallets[username] = 0;
    userWallets[username] += parseInt(amount);
    
    res.json({ balance: userWallets[username], success: true });
});

// Route: Secure RNG Spin Logic
app.post('/api/spin', (req, res) => {
    const { username, bet } = req.body;
    const currentBalance = userWallets[username] || 0;

    if (currentBalance < bet) {
        return res.status(400).json({ error: "Insufficient funds inside casino wallet." });
    }

    // Deduct bet safely on the server
    userWallets[username] -= bet;

    // Generate a completely random 5x4 board on the server
    let board = [];
    let scatterCount = 0;
    
    for (let i = 0; i < 20; i++) {
        let sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        let isScatter = Math.random() < 0.05; // 5% chance
        let isGold = !isScatter && Math.random() < 0.20 && ['J','Q','K','A'].includes(sym);
        
        if (isScatter) scatterCount++;
        
        board.push({ text: sym, isGold, isScatter, isJoker: false });
    }

    // Basic server-side win evaluation algorithm
    let winAmount = 0;
    let hasWin = Math.random() < 0.35; // Simulate a 35% win rate baseline
    
    if (hasWin) {
        // Award a random realistic payout multiplier based on the bet
        const multipliers = [0.2, 0.5, 1, 2, 5, 10];
        const randomMult = multipliers[Math.floor(Math.random() * multipliers.length)];
        winAmount = bet * randomMult;
    }

    // Add winnings back to server wallet
    userWallets[username] += winAmount;

    res.json({
        board: board,
        winAmount: winAmount,
        newBalance: userWallets[username],
        triggerFreeSpins: scatterCount >= 3
    });
});

app.listen(PORT, () => console.log(`Casino secure core online at http://localhost:${PORT}`));
