const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');

  // Create tables
  db.serialize(() => {
    db.run(`
      CREATE TABLE users (
        username TEXT PRIMARY KEY,
        password TEXT,
        role TEXT,
        userId INTEGER
      )
    `);
    db.run(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        amount REAL,
        type TEXT,
        date TEXT
      )
    `);
    db.run(`
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        balance REAL,
        type TEXT
      )
    `);

    // Seed data
    db.run(`INSERT INTO users (username, password, role, userId) VALUES 
      ('admin@bank.com', 'admin123', 'admin', 1),
      ('user@bank.com', 'user123', 'user', 1),
      ('user2@bank.com', 'user123', 'user', 2)`);
    db.run(`INSERT INTO transactions (userId, amount, type, date) VALUES 
      (1, 100, 'deposit', '2025-07-27'),
      (1, 50, 'withdrawal', '2025-07-26'),
      (2, 200, 'deposit', '2025-07-25'),
      (2, 150, 'withdrawal', '2025-07-24')`);
    db.run(`INSERT INTO accounts (userId, balance, type) VALUES 
      (1, 1000, 'savings'),
      (1, 300, 'checking'),
      (2, 500, 'savings')`);

    // Verify data
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) console.error(err);
      console.log('Users:', rows);
    });
    db.all('SELECT * FROM transactions', [], (err, rows) => {
      if (err) console.error(err);
      console.log('Transactions:', rows);
    });
    db.all('SELECT * FROM accounts', [], (err, rows) => {
      if (err) console.error(err);
      console.log('Accounts:', rows);
    });
  });
});