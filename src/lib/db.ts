import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'usersData.db');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: Database.Database;

try {
  db = new Database(DB_PATH, { verbose: console.log }); // Add verbose logging if needed during dev
} catch (error) {
  console.error("Failed to open database:", error);
  throw new Error("Could not initialize the database connection.");
}

// Enable WAL mode for better concurrency and performance.
db.pragma('journal_mode = WAL');

// Initialize tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      allergy_profile TEXT 
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      scan_data TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
    );
  `);

} catch (error) {
  console.error("Failed to initialize tables:", error);
  // Depending on the error, you might want to throw it or handle it gracefully
  // For now, we'll re-throw if it's not a "table already exists" type of error or similar
  // Better-sqlite3 might throw if an exec fails critically.
  if (!db.open) { // Check if DB connection itself is compromised
      throw new Error("Database connection lost during table initialization.");
  }
}

console.log("Database initialized successfully with users, sessions, and scan_history tables.");

export default db;

// Utility function to get a new db connection if needed (e.g., for specific operations)
// However, for better-sqlite3, it's often fine to use the single shared instance for reads/writes
// as it handles concurrency appropriately for many use cases.
// export const getDbConnection = () => new Database(dbPath); 