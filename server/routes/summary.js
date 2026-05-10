const express = require('express');
const router = express.Router();
const { getDb, rowsToObjects } = require('../database');

router.get('/', async (req, res) => {
const { month } = req.query;
if (!month) return res.status(400).json({ error: 'month is required' });

const myDb = await getDb();
const stmt = myDb.prepare(`
    SELECT start_time, end_time FROM entries 
    WHERE strftime('%Y-%m', date) = ? 
    AND start_time IS NOT NULL 
    AND end_time IS NOT NULL
`);
stmt.bind([month]);
const rows = rowsToObjects(stmt);

let totalHours = 0;
rows.forEach(({ start_time, end_time }) => {
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    totalHours += (endMin - startMin) / 60;
});

const rateStmt = myDb.prepare(`SELECT value FROM settings WHERE key = 'hourly_rate'`);
const rateRows = rowsToObjects(rateStmt);
const hourlyRate = rateRows.length > 0 ? parseFloat(rateRows[0].value) : 0;

const advStmt = myDb.prepare(`SELECT amount FROM advances WHERE month = ?`);
advStmt.bind([month]);
const advRows = rowsToObjects(advStmt);
const advance = advRows.length > 0 ? advRows[0].amount : 0;

  const gross = totalHours * hourlyRate;
const net = gross - advance;

res.json({
    total_hours: Math.round(totalHours * 100) / 100,
    hourly_rate: hourlyRate,
    gross_salary: Math.round(gross * 100) / 100,
    advance: advance,
    net_salary: Math.round(net * 100) / 100,
});
});

module.exports = router;