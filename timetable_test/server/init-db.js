const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'timetable.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'readonly')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Teachers table
  db.run(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      building TEXT,
      capacity INTEGER,
      room_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Courses table
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER,
      room_id INTEGER,
      day TEXT NOT NULL CHECK(day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      year INTEGER NOT NULL,
      trimester INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL
    )
  `);

  // Academic Years table
  db.run(`
    CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default year (2026)
  db.run(`
    INSERT OR IGNORE INTO academic_years (year, is_active) 
    VALUES (2026, 1)
  `);

  // Create indexes for better performance
  db.run('CREATE INDEX IF NOT EXISTS idx_courses_day_time ON courses(day, start_time, end_time)');
  db.run('CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_courses_room ON courses(room_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_courses_year_trimester ON courses(year, trimester)');

  // Insert default data
  db.run(`
    INSERT OR IGNORE INTO users (username, password_hash, role) 
    VALUES ('admin', ?, 'admin')
  `, [bcrypt.hashSync('admin123', 10)]);

  db.run(`
    INSERT OR IGNORE INTO users (username, password_hash, role) 
    VALUES ('editor', ?, 'editor')
  `, [bcrypt.hashSync('editor123', 10)]);

  db.run(`
    INSERT OR IGNORE INTO users (username, password_hash, role) 
    VALUES ('viewer', ?, 'readonly')
  `, [bcrypt.hashSync('viewer123', 10)]);

  // Insert sample teachers
  db.run(`
    INSERT OR IGNORE INTO teachers (name, department, email) 
    VALUES ('Dr. Smith', 'Computer Science', 'smith@university.edu')
  `);

  db.run(`
    INSERT OR IGNORE INTO teachers (name, department, email) 
    VALUES ('Prof. Johnson', 'Mathematics', 'johnson@university.edu')
  `);

  db.run(`
    INSERT OR IGNORE INTO teachers (name, department, email) 
    VALUES ('Dr. Williams', 'Physics', 'williams@university.edu')
  `);

  // Insert sample rooms
  db.run(`
    INSERT OR IGNORE INTO rooms (name, building, capacity, room_type) 
    VALUES ('A101', 'Building A', 30, 'Lecture Hall')
  `);

  db.run(`
    INSERT OR IGNORE INTO rooms (name, building, capacity, room_type) 
    VALUES ('B205', 'Building B', 25, 'Computer Lab')
  `);

  db.run(`
    INSERT OR IGNORE INTO rooms (name, building, capacity, room_type) 
    VALUES ('C301', 'Building C', 40, 'Lecture Hall')
  `);

  // Insert sample courses
  db.run(`
    INSERT OR IGNORE INTO courses (name, teacher_id, room_id, day, start_time, end_time, year, trimester) 
    VALUES ('Introduction to Programming', 1, 1, 'Monday', '09:00', '10:30', 2024, 1)
  `);

  db.run(`
    INSERT OR IGNORE INTO courses (name, teacher_id, room_id, day, start_time, end_time, year, trimester) 
    VALUES ('Calculus I', 2, 3, 'Tuesday', '14:00', '15:30', 2024, 1)
  `);

  db.run(`
    INSERT OR IGNORE INTO courses (name, teacher_id, room_id, day, start_time, end_time, year, trimester) 
    VALUES ('Physics Fundamentals', 3, 2, 'Wednesday', '11:00', '12:30', 2024, 1)
  `);

  console.log('Database initialized successfully!');
  console.log('Default users created:');
  console.log('- admin/admin123 (admin role)');
  console.log('- editor/editor123 (editor role)');
  console.log('- viewer/viewer123 (readonly role)');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});

