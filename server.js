// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error("FATAL ERROR: JWT_SECRET is not defined."); process.exit(1); }

const app = express();
let dbConnection;

app.use(cors());
app.use(express.json());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

async function getDbConnection() {
    if (!dbConnection) {
        dbConnection = await open({ filename: './database.db', driver: sqlite3.Database });
    }
    return dbConnection;
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

// --- API ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await getDbConnection();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, role: user.role });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error during login." });
    }
});

app.get('/api/admin/users', authenticateToken, authorizeAdmin, async (req, res) => {
    const db = await getDbConnection();
    const users = await db.all("SELECT id, email FROM users WHERE role = 'user'");
    res.json(users);
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
    const db = await getDbConnection();
    const { role, userId: loggedInUserId } = req.user;
    const { page = 1, limit = 5, userId: targetUserId } = req.query;
    const offset = (page - 1) * limit;

    let queryUserId = loggedInUserId;
    if (role === 'admin' && targetUserId) {
        queryUserId = targetUserId;
    }

    const query = `
        SELECT t.* FROM transactions t JOIN accounts a ON t.account_id = a.id 
        WHERE a.user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?`;
    const transactions = await db.all(query, [queryUserId, limit, offset]);
    res.json(transactions);
});

app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
    const db = await getDbConnection();
    const { role, userId } = req.user;
    const { userId: targetUserId } = req.query;

    let queryParams = [];
    let userFilter = '';

    if (role === 'admin') {
        if (targetUserId) {
            userFilter = 'WHERE a.user_id = ?';
            queryParams.push(targetUserId);
        }
    } else {
        userFilter = 'WHERE a.user_id = ?';
        queryParams.push(userId);
    }
    
    const query = `SELECT amount, category, strftime('%Y-%m', date) as month FROM transactions t JOIN accounts a ON t.account_id = a.id ${userFilter}`;
    const allTransactions = await db.all(query, queryParams);
    
    const totalSpending = allTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = allTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    const spendingByCategory = allTransactions.filter(t => t.amount < 0).reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    const spendingByMonth = allTransactions.filter(t => t.amount < 0).reduce((acc, t) => {
        acc[t.month] = (acc[t.month] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    res.json({
        totalSpending: Math.abs(totalSpending),
        totalIncome,
        transactionCount: allTransactions.length,
        spendingByCategory,
        spendingByMonth,
    });
});

getDbConnection().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server ready on http://localhost:${PORT}`));
}).catch(err => console.error("Fatal: Could not connect to the database. Did you run the seeder first?", err));