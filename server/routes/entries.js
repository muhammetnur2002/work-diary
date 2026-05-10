const express = require('express');
const router = express.Router();
const { getDb, saveDb, rowsToObjects } = require('../database');
const { date, start_time, end_time, comment, hourly_rate } = req.body;
const { start_time, end_time, comment, hourly_rate } = req.body;

// GET ?month=YYYY-MM
router.get('/', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month is required' });
    const myDb = await getDb();
    const stmt = myDb.prepare(`SELECT * FROM entries WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date ASC`);
    stmt.bind([req.userId, month]);
    const rows = rowsToObjects(stmt);
    res.json(rows);
});

// POST (создать или обновить)
router.post('/', async (req, res) => {
    const { date, start_time, end_time, comment, hourly_rate } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required' });
    try{
    const myDb = await getDb();
    const check = myDb.prepare(`SELECT id FROM entries WHERE user_id = ? AND date = ?`);
    check.bind([req.userId, date]);
    const exists = check.step();
    check.free();

    if (exists) {
    myDb.run(`UPDATE entries SET start_time = ?, end_time = ?, comment = ?, hourly_rate = ?, updated_at = datetime('now') WHERE user_id = ? AND date = ?`,
        [start_time || null, end_time || null, comment || '', hourly_rate || null, req.userId, date]);
    } else {
    myDb.run(`INSERT INTO entries (user_id, date, start_time, end_time, comment, hourly_rate) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.userId, date, start_time || null, end_time || null, comment || '', hourly_rate || null]);
    }
    saveDb();

    // Возвращаем созданную/обновлённую запись
     const fetch = myDb.prepare(`SELECT * FROM entries WHERE user_id = ? AND date = ?`);
    fetch.bind([req.userId, date]);
    const newEntry = rowsToObjects(fetch)[0];
    res.status(201).json(newEntry);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// PUT /api/entries/:id
router.put('/:id', async (req, res) => {
    const { start_time, end_time, comment, hourly_rate } = req.body;
    const myDb = await getDb();
  // проверяем владельца
    const ownerCheck = myDb.prepare(`SELECT id FROM entries WHERE id = ? AND user_id = ?`);
    ownerCheck.bind([req.params.id, req.userId]);
    if (!ownerCheck.step()) {
    ownerCheck.free();
    return res.status(404).json({ error: 'Запись не найдена или доступ запрещён' });
    }
    ownerCheck.free();

    myDb.run(`UPDATE entries SET start_time = ?, end_time = ?, comment = ?, hourly_rate = ?, updated_at = datetime('now') WHERE id = ?`,
    [start_time, end_time, comment, hourly_rate, req.params.id]);
    saveDb();
  const fetch = myDb.prepare(`SELECT * FROM entries WHERE id = ?`);
    fetch.bind([req.params.id]);
    const updated = rowsToObjects(fetch)[0];
    if (!updated) return res.status(404).json({ error: 'Entry not found' });
    res.json(updated);
});

// DELETE /api/entries/:id
router.delete('/:id', async (req, res) => {
    const myDb = await getDb();
    myDb.run(`DELETE FROM entries WHERE id = ?`, [req.params.id]);
    saveDb();
    res.json({ success: true });
});

module.exports = router;