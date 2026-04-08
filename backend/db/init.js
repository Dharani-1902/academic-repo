import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'academic.db');
const db = new Database(dbPath);

function ensureSchemaCompatibility() {
  const columns = db.prepare(`PRAGMA table_info('academic_records')`).all();
  const hasAcademicRecords = Array.isArray(columns) && columns.length > 0;
  const hasTerm = hasAcademicRecords && columns.some((c) => c.name === 'term');

  // If the table exists from an older version, add missing columns safely.
  if (hasAcademicRecords && !hasTerm) {
    db.exec(`ALTER TABLE academic_records ADD COLUMN term TEXT NOT NULL DEFAULT 'Fall';`);
  }

  // Enforce the placement-ready uniqueness rule (student, course, term, year).
  // (Older DBs may have a weaker/incorrect UNIQUE constraint embedded in the table.)
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_records_student_course_term_year
    ON academic_records(student_id, course_id, term, year);
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    program TEXT,
    enrollment_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS academic_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    term TEXT NOT NULL,
    year INTEGER NOT NULL,
    grade TEXT,
    credits_earned REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE INDEX IF NOT EXISTS idx_records_student ON academic_records(student_id);
  CREATE INDEX IF NOT EXISTS idx_records_course ON academic_records(course_id);
`);

ensureSchemaCompatibility();

// Seed sample data if empty
const studentCount = db.prepare('SELECT COUNT(*) as n FROM students').get();
if (studentCount.n === 0) {
  db.exec(`
    INSERT INTO students (student_id, name, email, program, enrollment_year) VALUES
    ('STU001', 'Alex Johnson', 'alex@example.com', 'Computer Science', 2022),
    ('STU002', 'Sam Williams', 'sam@example.com', 'Mathematics', 2023);

    INSERT INTO courses (code, name, credits) VALUES
    ('CS101', 'Introduction to Programming', 4),
    ('CS201', 'Data Structures', 4),
    ('MATH101', 'Calculus I', 3);

    INSERT INTO academic_records (student_id, course_id, term, year, grade, credits_earned) VALUES
    (1, 1, 'Fall', 2022, 'A', 4),
    (1, 2, 'Spring', 2023, 'B+', 4),
    (1, 3, 'Fall', 2022, 'A-', 3),
    (2, 3, 'Spring', 2023, 'B', 3);
  `);
}

export function getDb() {
  return db;
}

export default db;
