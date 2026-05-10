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
  // Включаем поддержку внешних ключей (опционально), создаём таблицы
  db.run(`PRAGMA foreign_keys = ON`);
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      start_time TEXT,
      end_time TEXT,
      comment TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS advances (
      month TEXT PRIMARY KEY,
      amount REAL NOT NULL DEFAULT 0
    );
  `);
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