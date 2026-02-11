const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'timetable.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking academic_years table...\n');

// Check if table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='academic_years'", (err, row) => {
  if (err) {
    console.error('Error checking table:', err);
    return;
  }
  
  if (!row) {
    console.log('❌ Table academic_years does NOT exist!');
    console.log('Creating table and adding 2026...\n');
    
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS academic_years (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year INTEGER UNIQUE NOT NULL,
          is_active INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
        console.log('✅ Table created successfully');
        
        db.run('INSERT OR IGNORE INTO academic_years (year, is_active) VALUES (2026, 1)', (err) => {
          if (err) {
            console.error('Error inserting year:', err);
          } else {
            console.log('✅ Year 2026 added');
          }
          
          showYears();
        });
      });
    });
  } else {
    console.log('✅ Table academic_years exists');
    showYears();
  }
});

function showYears() {
  console.log('\nCurrent years in database:');
  console.log('─────────────────────────');
  
  db.all('SELECT * FROM academic_years ORDER BY year', (err, rows) => {
    if (err) {
      console.error('Error fetching years:', err);
      db.close();
      return;
    }
    
    if (rows.length === 0) {
      console.log('❌ No years found! Adding 2026...');
      db.run('INSERT INTO academic_years (year, is_active) VALUES (2026, 1)', (err) => {
        if (err) {
          console.error('Error inserting year:', err);
        } else {
          console.log('✅ Year 2026 added successfully');
        }
        db.close();
      });
    } else {
      rows.forEach(row => {
        console.log(`Year: ${row.year}, Active: ${row.is_active ? 'Yes' : 'No'}, ID: ${row.id}`);
      });
      console.log('─────────────────────────');
      console.log(`Total: ${rows.length} year(s)`);
      db.close();
    }
  });
}
