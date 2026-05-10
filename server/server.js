const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const entriesRouter = require('./routes/entries');
const settingsRouter = require('./routes/settings');
const advancesRouter = require('./routes/advances');
const summaryRouter = require('./routes/summary');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const fs = require('fs');
const path = require('path');

// Сброс базы данных при необходимости (для миграции на новый формат паролей)
if (process.env.RESET_DB === 'true') {
    const dbPath = path.join(__dirname, 'diary.db');
    if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Старая база данных удалена для чистой миграции.');
    }
}

app.use(helmet());
app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api/entries', entriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/advances', advancesRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/auth', authRouter);
app.use('/api/entries', authMiddleware, entriesRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/advances', authMiddleware, advancesRouter);
app.use('/api/summary', authMiddleware, summaryRouter);

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