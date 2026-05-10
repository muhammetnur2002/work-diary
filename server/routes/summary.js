const express = require('express');
const router = express.Router();
const { getDb, rowsToObjects } = require('../database');

router.get('/', async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'month is required' });

    const myDb = await getDb();

    const stmt = myDb.prepare(`
    SELECT start_time, end_time, hourly_rate FROM entries 
    WHERE user_id = ? AND strftime('%Y-%m', date) = ? 
        AND start_time IS NOT NULL 
        AND end_time IS NOT NULL
    `);
    stmt.bind([req.userId, month]);
    const rows = rowsToObjects(stmt);

  // Глобальная ставка пользователя
    const rateStmt = myDb.prepare(`SELECT value FROM settings WHERE user_id = ? AND key = 'hourly_rate'`);
    rateStmt.bind([req.userId]);
    const rateRows = rowsToObjects(rateStmt);
    const globalRate = rateRows.length > 0 ? parseFloat(rateRows[0].value) : 0;

    let totalHours = 0;
   let totalSalary = 0;
    rows.forEach(({ start_time, end_time, hourly_rate: entryRate }) => {
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    const hours = (endMin - startMin) / 60;
    totalHours += hours;

    const effectiveRate = (entryRate != null && entryRate > 0) ? entryRate : globalRate;
    totalSalary += hours * effectiveRate;
    });

  // Аванс пользователя за месяц
    const advStmt = myDb.prepare(`SELECT amount FROM advances WHERE user_id = ? AND month = ?`);
    advStmt.bind([req.userId, month]);
    const advRows = rowsToObjects(advStmt);
    const advance = advRows.length > 0 ? advRows[0].amount : 0;

    const net = totalSalary - advance;

    res.json({
    total_hours: Math.round(totalHours * 100) / 100,
    hourly_rate: globalRate,
    gross_salary: Math.round(totalSalary * 100) / 100,
    advance: advance,
    net_salary: Math.round(net * 100) / 100,
    });
});

module.exports = router;