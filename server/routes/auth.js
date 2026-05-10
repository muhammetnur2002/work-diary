const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { getDb } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Rate limiter для логина: не более 5 попыток в 15 минут с одного IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
    max: 5,
    message: { error: 'Слишком много попыток входа. Попробуйте позже.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Регистрация (без лимита, но можно тоже ограничить)
router.post('/register', async (req, res) => {
    const { username, passwordHash } = req.body;
    if (!username || !passwordHash) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }
    const db = await getDb();
    const exists = db.prepare(`SELECT id FROM users WHERE username = ?`);
    exists.bind([username]);
    if (exists.step()) {
    exists.free();
    return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    exists.free();

  // Хешируем полученный SHA-256 хеш через bcrypt
    const hash = await bcrypt.hash(passwordHash, 10);
    db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, [username, hash]);
    const userStmt = db.prepare(`SELECT id FROM users WHERE username = ?`);
    userStmt.bind([username]);
    userStmt.step();
    const user = userStmt.getAsObject();
    userStmt.free();

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, userId: user.id, username });
});

// Вход (с ограничением частоты)
router.post('/login', loginLimiter, async (req, res) => {
    const { username, passwordHash } = req.body;
    if (!username || !passwordHash) {
    return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }
    const db = await getDb();
    const stmt = db.prepare(`SELECT id, password_hash FROM users WHERE username = ?`);
    stmt.bind([username]);
    if (!stmt.step()) {
    stmt.free();
    return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    const user = stmt.getAsObject();
    stmt.free();

  // Сравниваем присланный SHA-256 хеш с bcrypt-хешем в базе
    const valid = await bcrypt.compare(passwordHash, user.password_hash);
    if (!valid) {
    return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, userId: user.id, username });
});

module.exports = router;