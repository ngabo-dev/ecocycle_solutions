const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',
  database: 'platform_db'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Routes
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/signup.html'));
});

app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err, result) => {
    if (err) {
      console.log(err);
      res.redirect('/signup');
    } else {
      res.redirect('/signin');
    }
  });
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/signin.html'));
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.log(err);
    }

    if (results.length === 0 || !(await bcrypt.compare(password, results[0].password_hash))) {
      res.redirect('/signin');
    } else {
      db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [results[0].user_id], (err, result) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/dashboard');
      });
    }
  });
});

app.get('/dashboard', (req, res) => {
  res.send('Welcome to your dashboard!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
