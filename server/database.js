const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'diary.db');

let db;

async function getDb() {
    if (db) return db;

    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    } else {
    db = new SQL.Database();
    }

  // Включаем поддержку внешних ключей (опционально)
    db.run(`PRAGMA foreign_keys = ON`);

  // Создание таблиц, если их нет
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 1,
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

    db.run(`
    CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER NOT NULL DEFAULT 1,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (user_id, key)
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS advances (
        user_id INTEGER NOT NULL DEFAULT 1,
        month TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, month)
    )
    `);

  // Миграция: добавить колонки user_id, если их ещё нет (для старых баз)
    const addColumnIfNotExists = (table, column, type) => {
    const info = db.exec(`PRAGMA table_info(${table})`);
    if (info.length > 0) {
        const columns = info[0].values.map(row => row[1]);
        if (!columns.includes(column)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        }
    }
    };

    addColumnIfNotExists('entries', 'user_id', 'INTEGER NOT NULL DEFAULT 1');
    addColumnIfNotExists('advances', 'user_id', 'INTEGER NOT NULL DEFAULT 1');

  // Для settings: если колонки user_id нет, пересоздадим таблицу
    const tableInfo = db.exec('PRAGMA table_info(settings)');
    if (tableInfo.length > 0) {
    const columns = tableInfo[0].values.map(row => row[1]);
    if (!columns.includes('user_id')) {
        db.run('ALTER TABLE settings RENAME TO settings_old');
        db.run(`
        CREATE TABLE settings (
            user_id INTEGER NOT NULL DEFAULT 1,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (user_id, key)
        )
        `);
      // Переносим старые данные, если есть
        db.run(`
        INSERT INTO settings (user_id, key, value)
        SELECT 1, key, value FROM settings_old
        `);
        db.run('DROP TABLE settings_old');
    }
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

function rowsToObjects(stmt) {
    const result = [];
    while (stmt.step()) {
    result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
}

module.exports = { getDb, saveDb, rowsToObjects };