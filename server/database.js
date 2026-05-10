const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'diary.db');

const addColumnIfNotExists = (table, column, type) => {
    const info = db.exec(`PRAGMA table_info(${table})`);
    const columns = info.length > 0 ? info[0].values.map(row => row[1]) : [];
    if (!columns.includes(column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
};
let db;

addColumnIfNotExists('entries', 'user_id', 'INTEGER');
addColumnIfNotExists('advances', 'user_id', 'INTEGER');

const settingsInfo = db.exec(`PRAGMA table_info(settings)`);
if (settingsInfo.length > 0) {
    const cols = settingsInfo[0].values.map(row => row[1]);
    if (!cols.includes('user_id')) {
    // Переименуем старую и создадим новую
    db.run(`ALTER TABLE settings RENAME TO settings_old`);
    db.run(`CREATE TABLE settings (
        user_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (user_id, key)
    )`);
    // Можно перенести данные, если была ставка hourly_rate, присвоим её user_id=1 (админ), но проще не заморачиваться
    db.run(`DROP TABLE settings_old`);
    }
}

async function getDb() {
    if (db) return db;
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    } else {
    db = new SQL.Database();
    }
  // Включаем поддержку внешних ключей (опционально), создаём таблицы
    db.run(`PRAGMA foreign_keys = ON`);
    // Таблица пользователей
db.run(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
    )
`);

// Таблица записей (entries) – добавлен user_id
db.run(`
    CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    comment TEXT DEFAULT '',
    hourly_rate REAL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
    )
`);

// Таблица настроек пользователя (вместо общей settings)
db.run(`
    CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
    )
`);

// Таблица авансов (advances) – добавлен user_id
db.run(`
    CREATE TABLE IF NOT EXISTS advances (
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, month)
    )
`);

// Миграции для старых баз (добавление колонок, если их нет)
const addColumnIfNotExists = (table, column, type) => {
    const info = db.exec(`PRAGMA table_info(${table})`);
    if (info.length > 0) {
    const columns = info[0].values.map(row => row[1]);
    if (!columns.includes(column)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
    }
};
addColumnIfNotExists('entries', 'user_id', 'INTEGER');
addColumnIfNotExists('advances', 'user_id', 'INTEGER');
    // В функции getDb(), после создания таблиц, добавьте:
try {
    db.run(`ALTER TABLE entries ADD COLUMN hourly_rate REAL`);
} catch (e) {
  // Колонка уже существует – это нормально
}
  // Ставка по умолчанию
    const exists = db.exec(`SELECT value FROM settings WHERE key='hourly_rate'`);
    if (exists.length === 0 || exists[0].values.length === 0) {
    db.run(`INSERT INTO settings (key, value) VALUES ('hourly_rate', '0')`);
    }
    return db;
}

function saveDb() {
    if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    }
}

// Преобразование результатов sql.js в удобный формат
function rowsToObjects(stmt) {
    const result = [];
    while (stmt.step()) {
    const row = stmt.getAsObject();
    result.push(row);
    }
    stmt.free();
    return result;
}

module.exports = { getDb, saveDb, rowsToObjects };