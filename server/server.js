const express = require('express');
const cors = require('cors');
const path = require('path');

const entriesRouter = require('./routes/entries');
const settingsRouter = require('./routes/settings');
const advancesRouter = require('./routes/advances');
const summaryRouter = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api/entries', entriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/advances', advancesRouter);
app.use('/api/summary', summaryRouter);

// Раздача статики фронтенда (после сборки React)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});