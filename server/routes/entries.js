const express = require('express');
const router = express.Router();
const { getDb, saveDb, rowsToObjects } = require('../database');

// GET ?month=YYYY-MM
router.get('/', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month is required' });
    const myDb = await getDb();
  const stmt = myDb.prepare(`SELECT * FROM entries WHERE strftime('%Y-%m', date) = ? ORDER BY date ASC`);
    stmt.bind([month]);
    const rows = rowsToObjects(stmt);
    res.json(rows);
});

// POST (создать или обновить)
router.post('/', async (req, res) => {
    const { date, start_time, end_time, comment } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required' });
    try {
    const myDb = await getDb();
    // Проверяем, существует ли запись
    const check = myDb.prepare(`SELECT id FROM entries WHERE date = ?`);
    check.bind([date]);
    const exists = check.step();
    check.free();

    if (exists) {
        myDb.run(`UPDATE entries SET start_time = ?, end_time = ?, comment = ?, updated_at = datetime('now') WHERE date = ?`,
        [start_time || null, end_time || null, comment || '', date]);
    } else {
        myDb.run(`INSERT INTO entries (date, start_time, end_time, comment) VALUES (?, ?, ?, ?)`,
        [date, start_time || null, end_time || null, comment || '']);
    }
    saveDb();

    // Возвращаем созданную/обновлённую запись
    const fetch = myDb.prepare(`SELECT * FROM entries WHERE date = ?`);
    fetch.bind([date]);
    const newEntry = rowsToObjects(fetch)[0];
    res.status(201).json(newEntry);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// PUT /api/entries/:id
router.put('/:id', async (req, res) => {
    const { start_time, end_time, comment } = req.body;
    const myDb = await getDb();
    myDb.run(`UPDATE entries SET start_time = ?, end_time = ?, comment = ?, updated_at = datetime('now') WHERE id = ?`,
    [start_time, end_time, comment, req.params.id]);
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