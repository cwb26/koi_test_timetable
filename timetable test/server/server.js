const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'timetable.db');
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (permission === 'edit' && req.user.role === 'editor') {
      return next();
    }
    
    if (permission === 'read' && ['admin', 'editor', 'readonly'].includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};

// Authentication routes
app.post('/api/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Courses routes
app.get('/api/courses', authenticateToken, requirePermission('read'), (req, res) => {
  const { year, trimester, teacher_id, room_id, day } = req.query;
  
  let query = `
    SELECT c.*, t.name as teacher_name, r.name as room_name, r.building as room_building
    FROM courses c
    LEFT JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN rooms r ON c.room_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (year) {
    query += ' AND c.year = ?';
    params.push(year);
  }
  if (trimester) {
    query += ' AND c.trimester = ?';
    params.push(trimester);
  }
  if (teacher_id) {
    query += ' AND c.teacher_id = ?';
    params.push(teacher_id);
  }
  if (room_id) {
    query += ' AND c.room_id = ?';
    params.push(room_id);
  }
  if (day) {
    query += ' AND c.day = ?';
    params.push(day);
  }

  query += ' ORDER BY c.day, c.start_time';

  db.all(query, params, (err, courses) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(courses);
  });
});

app.post('/api/courses', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Course name is required'),
  body('teacher_id').isInt().withMessage('Valid teacher ID is required'),
  body('room_id').isInt().withMessage('Valid room ID is required'),
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
  body('start_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('end_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('trimester').isInt({ min: 1, max: 4 }).withMessage('Valid trimester is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, teacher_id, room_id, day, start_time, end_time, year, trimester } = req.body;

  // Check for conflicts
  const conflictQuery = `
    SELECT * FROM courses 
    WHERE room_id = ? AND day = ? AND year = ? AND trimester = ?
    AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))
  `;

  db.get(conflictQuery, [room_id, day, year, trimester, start_time, start_time, end_time, end_time, start_time, end_time], (err, conflict) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (conflict) {
      return res.status(400).json({ error: 'Time slot conflict detected' });
    }

    const insertQuery = `
      INSERT INTO courses (name, teacher_id, room_id, day, start_time, end_time, year, trimester)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertQuery, [name, teacher_id, room_id, day, start_time, end_time, year, trimester], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get the created course with teacher and room details
      db.get(`
        SELECT c.*, t.name as teacher_name, r.name as room_name, r.building as room_building
        FROM courses c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN rooms r ON c.room_id = r.id
        WHERE c.id = ?
      `, [this.lastID], (err, course) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(course);
      });
    });
  });
});

app.put('/api/courses/:id', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Course name is required'),
  body('teacher_id').isInt().withMessage('Valid teacher ID is required'),
  body('room_id').isInt().withMessage('Valid room ID is required'),
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
  body('start_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('end_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('trimester').isInt({ min: 1, max: 4 }).withMessage('Valid trimester is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, teacher_id, room_id, day, start_time, end_time, year, trimester } = req.body;

  // Check for conflicts (excluding current course)
  const conflictQuery = `
    SELECT * FROM courses 
    WHERE id != ? AND room_id = ? AND day = ? AND year = ? AND trimester = ?
    AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))
  `;

  db.get(conflictQuery, [id, room_id, day, year, trimester, start_time, start_time, end_time, end_time, start_time, end_time], (err, conflict) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (conflict) {
      return res.status(400).json({ error: 'Time slot conflict detected' });
    }

    const updateQuery = `
      UPDATE courses 
      SET name = ?, teacher_id = ?, room_id = ?, day = ?, start_time = ?, end_time = ?, year = ?, trimester = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateQuery, [name, teacher_id, room_id, day, start_time, end_time, year, trimester, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Get the updated course
      db.get(`
        SELECT c.*, t.name as teacher_name, r.name as room_name, r.building as room_building
        FROM courses c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        LEFT JOIN rooms r ON c.room_id = r.id
        WHERE c.id = ?
      `, [id], (err, course) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(course);
      });
    });
  });
});

app.delete('/api/courses/:id', authenticateToken, requirePermission('edit'), (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  });
});

// Teachers routes
app.get('/api/teachers', authenticateToken, requirePermission('read'), (req, res) => {
  db.all(`
    SELECT t.*, COUNT(c.id) as course_count
    FROM teachers t
    LEFT JOIN courses c ON t.id = c.teacher_id
    GROUP BY t.id
    ORDER BY t.name
  `, (err, teachers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(teachers);
  });
});

app.post('/api/teachers', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Teacher name is required'),
  body('department').optional(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, department, email, phone } = req.body;

  db.run(`
    INSERT INTO teachers (name, department, email, phone)
    VALUES (?, ?, ?, ?)
  `, [name, department, email, phone], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT * FROM teachers WHERE id = ?', [this.lastID], (err, teacher) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(teacher);
    });
  });
});

app.put('/api/teachers/:id', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Teacher name is required'),
  body('department').optional(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, department, email, phone } = req.body;

  db.run(`
    UPDATE teachers 
    SET name = ?, department = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, department, email, phone, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    db.get('SELECT * FROM teachers WHERE id = ?', [id], (err, teacher) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(teacher);
    });
  });
});

app.delete('/api/teachers/:id', authenticateToken, requirePermission('edit'), (req, res) => {
  const { id } = req.params;

  // Check if teacher has courses
  db.get('SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Cannot delete teacher with assigned courses' });
    }

    db.run('DELETE FROM teachers WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.json({ message: 'Teacher deleted successfully' });
    });
  });
});

// Rooms routes
app.get('/api/rooms', authenticateToken, requirePermission('read'), (req, res) => {
  db.all(`
    SELECT r.*, COUNT(c.id) as course_count
    FROM rooms r
    LEFT JOIN courses c ON r.id = c.room_id
    GROUP BY r.id
    ORDER BY r.name
  `, (err, rooms) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rooms);
  });
});

app.post('/api/rooms', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Room name is required'),
  body('building').optional(),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('room_type').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, building, capacity, room_type } = req.body;

  db.run(`
    INSERT INTO rooms (name, building, capacity, room_type)
    VALUES (?, ?, ?, ?)
  `, [name, building, capacity, room_type], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT * FROM rooms WHERE id = ?', [this.lastID], (err, room) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(room);
    });
  });
});

app.put('/api/rooms/:id', authenticateToken, requirePermission('edit'), [
  body('name').notEmpty().withMessage('Room name is required'),
  body('building').optional(),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('room_type').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, building, capacity, room_type } = req.body;

  db.run(`
    UPDATE rooms 
    SET name = ?, building = ?, capacity = ?, room_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, building, capacity, room_type, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, room) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(room);
    });
  });
});

app.delete('/api/rooms/:id', authenticateToken, requirePermission('edit'), (req, res) => {
  const { id } = req.params;

  // Check if room has courses
  db.get('SELECT COUNT(*) as count FROM courses WHERE room_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.count > 0) {
      return res.status(400).json({ error: 'Cannot delete room with scheduled courses' });
    }

    db.run('DELETE FROM rooms WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json({ message: 'Room deleted successfully' });
    });
  });
});

// Conflict detection route
app.get('/api/conflicts', authenticateToken, requirePermission('read'), (req, res) => {
  const { year, trimester } = req.query;

  if (!year || !trimester) {
    return res.status(400).json({ error: 'Year and trimester are required' });
  }

  const conflictQuery = `
    SELECT c1.*, c2.*, 
           t1.name as teacher1_name, t2.name as teacher2_name,
           r1.name as room1_name, r2.name as room2_name
    FROM courses c1
    JOIN courses c2 ON (
      (c1.teacher_id = c2.teacher_id OR c1.room_id = c2.room_id) AND
      c1.id < c2.id AND
      c1.day = c2.day AND
      c1.year = c2.year AND
      c1.trimester = c2.trimester AND
      ((c1.start_time <= c2.start_time AND c1.end_time > c2.start_time) OR
       (c1.start_time < c2.end_time AND c1.end_time >= c2.end_time) OR
       (c1.start_time >= c2.start_time AND c1.end_time <= c2.end_time))
    )
    LEFT JOIN teachers t1 ON c1.teacher_id = t1.id
    LEFT JOIN teachers t2 ON c2.teacher_id = t2.id
    LEFT JOIN rooms r1 ON c1.room_id = r1.id
    LEFT JOIN rooms r2 ON c2.room_id = r2.id
    WHERE c1.year = ? AND c1.trimester = ?
  `;

  db.all(conflictQuery, [year, trimester], (err, conflicts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(conflicts);
  });
});

// Statistics route
app.get('/api/stats', authenticateToken, requirePermission('read'), (req, res) => {
  const { year, trimester } = req.query;

  let whereClause = '';
  const params = [];

  if (year && trimester) {
    whereClause = 'WHERE year = ? AND trimester = ?';
    params.push(year, trimester);
  }

  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM courses ${whereClause}) as total_courses,
      (SELECT COUNT(*) FROM teachers) as total_teachers,
      (SELECT COUNT(*) FROM rooms) as total_rooms,
      (SELECT COUNT(*) FROM users) as total_users
  `;

  db.get(statsQuery, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

// Import/Update endpoints
// Import teachers from CSV
app.post('/api/import/teachers', authenticateToken, requirePermission('edit'), upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];
  let lineNumber = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      lineNumber++;
      
      // Validate required fields
      if (!data.name || data.name.trim() === '') {
        errors.push({ line: lineNumber, error: 'Name is required', data });
        return;
      }

      // Clean and prepare data
      const teacherData = {
        name: data.name.trim(),
        department: data.department ? data.department.trim() : null,
        email: data.email ? data.email.trim() : null,
        phone: data.phone ? data.phone.trim() : null
      };

      results.push({ line: lineNumber, data: teacherData });
    })
    .on('end', () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation errors found', 
          errors,
          processed: 0,
          total: lineNumber 
        });
      }

      // Process valid records
      let processed = 0;
      let updated = 0;
      let created = 0;
      const processingErrors = [];

      const processRecord = (index) => {
        if (index >= results.length) {
          return res.json({
            message: 'Import completed',
            processed,
            created,
            updated,
            errors: processingErrors,
            total: results.length
          });
        }

        const { line, data } = results[index];

        // Check if teacher exists (by name)
        db.get('SELECT id FROM teachers WHERE name = ?', [data.name], (err, existing) => {
          if (err) {
            processingErrors.push({ line, error: 'Database error', details: err.message });
            return processRecord(index + 1);
          }

          if (existing) {
            // Update existing teacher
            db.run(`
              UPDATE teachers 
              SET department = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `, [data.department, data.email, data.phone, existing.id], function(err) {
              if (err) {
                processingErrors.push({ line, error: 'Failed to update teacher', details: err.message });
              } else {
                updated++;
                processed++;
              }
              processRecord(index + 1);
            });
          } else {
            // Create new teacher
            db.run(`
              INSERT INTO teachers (name, department, email, phone)
              VALUES (?, ?, ?, ?)
            `, [data.name, data.department, data.email, data.phone], function(err) {
              if (err) {
                processingErrors.push({ line, error: 'Failed to create teacher', details: err.message });
              } else {
                created++;
                processed++;
              }
              processRecord(index + 1);
            });
          }
        });
      };

      processRecord(0);
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
    });
});

// Import courses from CSV
app.post('/api/import/courses', authenticateToken, requirePermission('edit'), upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];
  let lineNumber = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      lineNumber++;
      
      // Validate required fields
      const requiredFields = ['name', 'teacher_name', 'room_name', 'day', 'start_time', 'end_time', 'year', 'trimester'];
      const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
      
      if (missingFields.length > 0) {
        errors.push({ 
          line: lineNumber, 
          error: `Missing required fields: ${missingFields.join(', ')}`, 
          data 
        });
        return;
      }

      // Validate day
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(data.day.trim())) {
        errors.push({ 
          line: lineNumber, 
          error: `Invalid day: ${data.day}. Must be one of: ${validDays.join(', ')}`, 
          data 
        });
        return;
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.start_time.trim()) || !timeRegex.test(data.end_time.trim())) {
        errors.push({ 
          line: lineNumber, 
          error: 'Invalid time format. Use HH:MM format', 
          data 
        });
        return;
      }

      // Validate year and trimester
      const year = parseInt(data.year);
      const trimester = parseInt(data.trimester);
      if (isNaN(year) || year < 2000 || year > 2100) {
        errors.push({ 
          line: lineNumber, 
          error: 'Invalid year. Must be between 2000 and 2100', 
          data 
        });
        return;
      }
      if (isNaN(trimester) || trimester < 1 || trimester > 4) {
        errors.push({ 
          line: lineNumber, 
          error: 'Invalid trimester. Must be between 1 and 4', 
          data 
        });
        return;
      }

      // Clean and prepare data
      const courseData = {
        name: data.name.trim(),
        teacher_name: data.teacher_name.trim(),
        room_name: data.room_name.trim(),
        day: data.day.trim(),
        start_time: data.start_time.trim(),
        end_time: data.end_time.trim(),
        year: year,
        trimester: trimester
      };

      results.push({ line: lineNumber, data: courseData });
    })
    .on('end', () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation errors found', 
          errors,
          processed: 0,
          total: lineNumber 
        });
      }

      // Process valid records
      let processed = 0;
      let updated = 0;
      let created = 0;
      const processingErrors = [];

      const processRecord = (index) => {
        if (index >= results.length) {
          return res.json({
            message: 'Import completed',
            processed,
            created,
            updated,
            errors: processingErrors,
            total: results.length
          });
        }

        const { line, data } = results[index];

        // Find teacher and room IDs
        db.get('SELECT id FROM teachers WHERE name = ?', [data.teacher_name], (err, teacher) => {
          if (err) {
            processingErrors.push({ line, error: 'Database error finding teacher', details: err.message });
            return processRecord(index + 1);
          }

          if (!teacher) {
            processingErrors.push({ line, error: `Teacher not found: ${data.teacher_name}` });
            return processRecord(index + 1);
          }

          db.get('SELECT id FROM rooms WHERE name = ?', [data.room_name], (err, room) => {
            if (err) {
              processingErrors.push({ line, error: 'Database error finding room', details: err.message });
              return processRecord(index + 1);
            }

            if (!room) {
              processingErrors.push({ line, error: `Room not found: ${data.room_name}` });
              return processRecord(index + 1);
            }

            // Check if course exists (by name, year, trimester)
            db.get('SELECT id FROM courses WHERE name = ? AND year = ? AND trimester = ?', 
              [data.name, data.year, data.trimester], (err, existing) => {
              if (err) {
                processingErrors.push({ line, error: 'Database error checking existing course', details: err.message });
                return processRecord(index + 1);
              }

              // Check for conflicts before creating/updating
              const conflictQuery = `
                SELECT * FROM courses 
                WHERE room_id = ? AND day = ? AND year = ? AND trimester = ?
                AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))
                ${existing ? 'AND id != ?' : ''}
              `;
              
              const conflictParams = [
                room.id, data.day, data.year, data.trimester,
                data.start_time, data.start_time, data.end_time, data.end_time, data.start_time, data.end_time
              ];
              
              if (existing) {
                conflictParams.push(existing.id);
              }

              db.get(conflictQuery, conflictParams, (err, conflict) => {
                if (err) {
                  processingErrors.push({ line, error: 'Database error checking conflicts', details: err.message });
                  return processRecord(index + 1);
                }

                if (conflict) {
                  processingErrors.push({ line, error: 'Time slot conflict detected' });
                  return processRecord(index + 1);
                }

                if (existing) {
                  // Update existing course
                  db.run(`
                    UPDATE courses 
                    SET teacher_id = ?, room_id = ?, day = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                  `, [teacher.id, room.id, data.day, data.start_time, data.end_time, existing.id], function(err) {
                    if (err) {
                      processingErrors.push({ line, error: 'Failed to update course', details: err.message });
                    } else {
                      updated++;
                      processed++;
                    }
                    processRecord(index + 1);
                  });
                } else {
                  // Create new course
                  db.run(`
                    INSERT INTO courses (name, teacher_id, room_id, day, start_time, end_time, year, trimester)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `, [data.name, teacher.id, room.id, data.day, data.start_time, data.end_time, data.year, data.trimester], function(err) {
                    if (err) {
                      processingErrors.push({ line, error: 'Failed to create course', details: err.message });
                    } else {
                      created++;
                      processed++;
                    }
                    processRecord(index + 1);
                  });
                }
              });
            });
          });
        });
      };

      processRecord(0);
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
    });
});

// Get import template endpoints
app.get('/api/import/teachers/template', authenticateToken, requirePermission('read'), (req, res) => {
  const csvContent = 'name,department,email,phone\n"Dr. John Smith","Computer Science","john.smith@university.edu","555-1234"\n"Prof. Jane Doe","Mathematics","jane.doe@university.edu","555-5678"';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="teachers_template.csv"');
  res.send(csvContent);
});

app.get('/api/import/courses/template', authenticateToken, requirePermission('read'), (req, res) => {
  const csvContent = 'name,teacher_name,room_name,day,start_time,end_time,year,trimester\n"Introduction to Programming","Dr. Smith","A101","Monday","09:00","10:30",2024,1\n"Advanced Mathematics","Prof. Johnson","B205","Tuesday","14:00","15:30",2024,1';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="courses_template.csv"');
  res.send(csvContent);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

