const express = require('express');
const router = express.Router();
const { getDb, saveDb, rowsToObjects } = require('../database');

router.get('/:month', async (req, res) => {
    const myDb = await getDb();
    const stmt = myDb.prepare(`SELECT amount FROM advances WHERE month = ?`);
    stmt.bind([req.params.month]);
    const rows = rowsToObjects(stmt);
    res.json({ amount: rows.length > 0 ? rows[0].amount : 0 });
});

router.put('/:month', async (req, res) => {
    const { amount } = req.body;
    const myDb = await getDb();
  // Проверяем существование
    const check = myDb.prepare(`SELECT month FROM advances WHERE month = ?`);
    check.bind([req.params.month]);
    const exists = check.step();
    check.free();

    if (exists) {
    myDb.run(`UPDATE advances SET amount = ? WHERE month = ?`, [parseFloat(amount) || 0, req.params.month]);
    } else {
    myDb.run(`INSERT INTO advances (month, amount) VALUES (?, ?)`, [req.params.month, parseFloat(amount) || 0]);
    }
    saveDb();
    res.json({ success: true });
});

module.exports = router;