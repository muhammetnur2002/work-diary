const express = require('express');
const router = express.Router();
const { getDb, saveDb, rowsToObjects } = require('../database');

router.get('/hourly_rate', async (req, res) => {
    const myDb = await getDb();
    const stmt = myDb.prepare(`SELECT value FROM settings WHERE key = 'hourly_rate'`);
    const rows = rowsToObjects(stmt);
    const value = rows.length > 0 ? parseFloat(rows[0].value) : 0;
    res.json({ value });
});

router.put('/hourly_rate', async (req, res) => {
    const { value } = req.body;
    const myDb = await getDb();
    myDb.run(`UPDATE settings SET value = ? WHERE key = 'hourly_rate'`, [value.toString()]);
    saveDb();
    res.json({ success: true, value: parseFloat(value) });
});

module.exports = router;