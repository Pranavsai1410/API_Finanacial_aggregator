// seed.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    console.log("Starting the database seeding process with multiple users...");
    const db = await open({ filename: './database.db', driver: sqlite3.Database });

    await db.exec('DROP TABLE IF EXISTS transactions; DROP TABLE IF EXISTS accounts; DROP TABLE IF EXISTS users;');

    await db.exec(`
        CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, role TEXT NOT NULL);
        CREATE TABLE accounts (id INTEGER PRIMARY KEY, user_id INTEGER, account_name TEXT, balance REAL, FOREIGN KEY (user_id) REFERENCES users (id));
        CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER, date TEXT, description TEXT, amount REAL, category TEXT, FOREIGN KEY (account_id) REFERENCES accounts (id));
    `);
    console.log("Tables created successfully.");

    // Create Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const user1Password = await bcrypt.hash('password123', 10);
    const user2Password = await bcrypt.hash('password456', 10);

    await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 'admin@bank.com', adminPassword, 'admin');
    const user1Result = await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 'user1@bank.com', user1Password, 'user');
    const user2Result = await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 'user2@bank.com', user2Password, 'user');
    const user1Id = user1Result.lastID;

    // Create Accounts
    const acc1Result = await db.run('INSERT INTO accounts (user_id, account_name, balance) VALUES (?, ?, ?)', user1Id, 'Primary Checking', 8542.55);
    const acc1Id = acc1Result.lastID;

    // Create Rich Transaction History for User 1
    const transactions = [
        { date: "2025-07-28", desc: "Paycheck", cat: "Income", amt: 3200.00 },
        { date: "2025-07-26", desc: "Whole Foods", cat: "Groceries", amt: -180.45 },
        { date: "2025-07-25", desc: "Exxon Gas", cat: "Transport", amt: -62.10 },
        { date: "2025-07-22", desc: "Rent Payment", cat: "Bills & Utilities", amt: -1800.00 },
        { date: "2025-06-28", desc: "Paycheck", cat: "Income", amt: 3150.00 },
        { date: "2025-06-25", desc: "Costco Haul", cat: "Groceries", amt: -255.30 },
        { date: "2025-05-28", desc: "Paycheck", cat: "Income", amt: 3100.00 },
        { date: "2025-05-24", desc: "Walmart", cat: "Groceries", amt: -120.70 },
    ];
    
    const insertStmt = await db.prepare('INSERT INTO transactions (account_id, date, description, amount, category) VALUES (?, ?, ?, ?, ?)');
    for (const t of transactions) {
        await insertStmt.run(acc1Id, t.date, t.desc, t.amt, t.cat);
    }
    await insertStmt.finalize();
    
    await db.close();
    console.log("✅ Seeding complete. Admin and multiple User accounts created.");
}

seedDatabase().catch(err => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
});