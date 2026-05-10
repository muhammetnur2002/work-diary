const express = require('express');
const router = express.Router();
const { getDb, saveDb, rowsToObjects } = require('../database');

router.get('/hourly_rate', async (req, res) => {
    const myDb = await getDb();
    const stmt = myDb.prepare(`SELECT value FROM settings WHERE user_id = ? AND key = 'hourly_rate'`);
    stmt.bind([req.userId]);
    const rows = rowsToObjects(stmt);
    const value = rows.length > 0 ? parseFloat(rows[0].value) : 0;
    res.json({ value });
});

router.put('/hourly_rate', async (req, res) => {
    const { value } = req.body;
    const myDb = await getDb();
    const exists = myDb.prepare(`SELECT user_id FROM settings WHERE user_id = ? AND key = 'hourly_rate'`);
    exists.bind([req.userId]);
    if (exists.step()) {
    myDb.run(`UPDATE settings SET value = ? WHERE user_id = ? AND key = 'hourly_rate'`, [value.toString(), req.userId]);
    } else {
    myDb.run(`INSERT INTO settings (user_id, key, value) VALUES (?, 'hourly_rate', ?)`, [req.userId, value.toString()]);
    }
    exists.free();
    saveDb();
    res.json({ success: true, value: parseFloat(value) });
});

module.exports = router;