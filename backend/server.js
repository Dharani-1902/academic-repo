import express from 'express';
import cors from 'cors';
import { getDb } from './db/init.js';

const app = express();
app.use(cors());
app.use(express.json());

const db = getDb();

// --- Students ---
app.get('/api/students', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.*, 
        (
          SELECT SUM(
            CASE ar.grade 
              WHEN 'A' THEN 10.0
              WHEN 'A-' THEN 9.0
              WHEN 'B+' THEN 8.0
              WHEN 'B' THEN 7.0
              WHEN 'B-' THEN 6.0
              WHEN 'C+' THEN 5.0
              WHEN 'C' THEN 4.0
              WHEN 'D' THEN 3.0
              WHEN 'U' THEN 0.0
              WHEN 'F' THEN 0.0
              ELSE 0.0
            END * c.credits
          ) / SUM(c.credits)
          FROM academic_records ar
          JOIN courses c ON ar.course_id = c.id
          WHERE ar.student_id = s.id
        ) as cgpa
      FROM students s
      ORDER BY s.name
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/students/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT s.*, 
        (
          SELECT SUM(
            CASE ar.grade 
              WHEN 'A' THEN 10.0
              WHEN 'A-' THEN 9.0
              WHEN 'B+' THEN 8.0
              WHEN 'B' THEN 7.0
              WHEN 'B-' THEN 6.0
              WHEN 'C+' THEN 5.0
              WHEN 'C' THEN 4.0
              WHEN 'D' THEN 3.0
              WHEN 'U' THEN 0.0
              WHEN 'F' THEN 0.0
              ELSE 0.0
            END * c.credits
          ) / SUM(c.credits)
          FROM academic_records ar
          JOIN courses c ON ar.course_id = c.id
          WHERE ar.student_id = s.id
        ) as cgpa
      FROM students s
      WHERE s.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/students', (req, res) => {
  try {
    const { student_id, name, email, program, enrollment_year } = req.body;
    const result = db.prepare(
      'INSERT INTO students (student_id, name, email, program, enrollment_year) VALUES (?, ?, ?, ?, ?)'
    ).run(student_id, name, email || null, program || null, enrollment_year || null);
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/students/:id', (req, res) => {
  try {
    const { student_id, name, email, program, enrollment_year } = req.body;
    db.prepare(
      'UPDATE students SET student_id=?, name=?, email=?, program=?, enrollment_year=? WHERE id=?'
    ).run(student_id, name, email, program, enrollment_year, req.params.id);
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Student not found' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Academic history for a student ---
app.get('/api/students/:id/history', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ar.*, c.code as course_code, c.name as course_name, c.credits
      FROM academic_records ar
      JOIN courses c ON ar.course_id = c.id
      WHERE ar.student_id = ?
      ORDER BY ar.year DESC, ar.term
    `).all(req.params.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/students/:id/records', (req, res) => {
  try {
    const { course_id, term, year, grade, credits_earned } = req.body;
    const result = db.prepare(
      'INSERT INTO academic_records (student_id, course_id, term, year, grade, credits_earned) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.params.id, course_id, term, year, grade || null, credits_earned ?? null);
    const row = db.prepare(`
      SELECT ar.*, c.code as course_code, c.name as course_name, c.credits
      FROM academic_records ar JOIN courses c ON ar.course_id = c.id
      WHERE ar.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Courses ---
app.get('/api/courses', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM courses ORDER BY code').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/courses', (req, res) => {
  try {
    const { code, name, credits } = req.body;
    const result = db.prepare('INSERT INTO courses (code, name, credits) VALUES (?, ?, ?)').run(code, name, credits ?? 0);
    const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));