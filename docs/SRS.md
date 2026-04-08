## Software Requirements Specification (SRS)

### 1. Introduction

- **Project title**: Student Academic History Repository
- **Purpose**: Provide a centralized system to manage student profiles, course catalog, and term-wise academic records for quick viewing and reporting (useful for academic tracking and placement documentation).
- **Intended audience**: Students, academic coordinators, admins, and evaluators/interviewers reviewing the project.
- **Scope**: CRUD for students, manage courses, add/view academic records per student (by term & year), and enforce data integrity (no duplicate record for same student-course-term-year).

### 2. Overall description

#### 2.1 Product perspective

The system is a web application with:

- **Frontend UI** (React) for interacting with data
- **Backend REST API** (Express) exposing endpoints
- **Relational database** (SQLite in this implementation; schema is compatible with MySQL concepts)

#### 2.2 User classes and characteristics

- **Admin/Coordinator**: adds/updates students and courses, enters academic records
- **Student**: views their academic history (read-only usage)

#### 2.3 Operating environment

- Windows 10/11, macOS, Linux
- Node.js runtime for backend
- Modern browser for frontend

#### 2.4 Assumptions and dependencies

- Single-institute deployment, moderate concurrency
- SQLite file DB is sufficient for demo/placement use; can be migrated to MySQL if needed

### 3. Functional requirements

#### FR-1 Student management

- **FR-1.1** Create a student with fields: `student_id`, `name`, `email`, `program`, `enrollment_year`
- **FR-1.2** View list of students
- **FR-1.3** View a student profile by internal `id`
- **FR-1.4** Update a student profile
- **FR-1.5** Delete a student and their dependent academic records

#### FR-2 Course management

- **FR-2.1** Create a course with fields: `code`, `name`, `credits`
- **FR-2.2** View list of courses

#### FR-3 Academic records management

- **FR-3.1** Add an academic record for a given student with fields:
  - `course_id`, `term`, `year`, `grade`, `credits_earned`
- **FR-3.2** View academic history for a given student
- **FR-3.3** Enforce uniqueness:
  - A student cannot have duplicate records for the same `(course_id, term, year)`

### 4. External interface requirements

#### 4.1 User interface (UI)

- **Students screen**: list + select student
- **Student details**: profile + academic history table grouped by `year term`
- **Add academic record**: select course, term, year, grade, credits earned

#### 4.2 Software interfaces (REST API)

Base path: `/api`

- **Students**
  - `GET /students`
  - `GET /students/:id`
  - `POST /students`
  - `PUT /students/:id`
  - `DELETE /students/:id`
  - `GET /students/:id/history`
  - `POST /students/:id/records`
- **Courses**
  - `GET /courses`
  - `POST /courses`

### 5. Non-functional requirements

- **NFR-1 Performance**: typical API responses under 300ms on local machine for small datasets
- **NFR-2 Reliability**: input validation and meaningful error messages for invalid requests
- **NFR-3 Security (baseline)**:
  - CORS configured
  - No secrets stored in repo
  - (Future) authentication/authorization for admin features
- **NFR-4 Maintainability**:
  - clear separation of frontend/backend
  - database schema managed in one place (`backend/db/init.js`)

### 6. Data requirements (logical design)

#### 6.1 Entities

- **students**
  - `id` (PK), `student_id` (unique), `name`, `email`, `program`, `enrollment_year`, `created_at`
- **courses**
  - `id` (PK), `code` (unique), `name`, `credits`, `created_at`
- **academic_records**
  - `id` (PK)
  - `student_id` (FK → students.id)
  - `course_id` (FK → courses.id)
  - `term`, `year`, `grade`, `credits_earned`, `created_at`
  - **unique**: `(student_id, course_id, term, year)`

#### 6.2 Indexing

- Index by `student_id` and `course_id` for faster history queries

### 7. Use cases (high level)

#### UC-1 Add student

- **Actor**: Admin/Coordinator
- **Preconditions**: none
- **Flow**: Enter details → Save → Student appears in list
- **Postconditions**: new row in `students`

#### UC-2 Add academic record

- **Actor**: Admin/Coordinator
- **Preconditions**: Student and course exist
- **Flow**: Select student → Add record → choose course + term + year → Save
- **Postconditions**: new row in `academic_records` unless uniqueness violation

#### UC-3 View student academic history

- **Actor**: Student/Admin
- **Preconditions**: Student exists
- **Flow**: Open student → system displays records grouped by term/year

### 8. Validation rules

- `student_id` must be unique and non-empty
- `course.code` must be unique and non-empty
- `term` must be one of: `Spring`, `Summer`, `Fall`, `Winter` (UI constraint)
- `year` must be a reasonable integer (e.g., 1990–2030 in UI)

### 9. Testing approach (placement-friendly)

- **API tests (manual)**:
  - create student → list students
  - create course → list courses
  - add academic record → fetch history
  - attempt duplicate record (same student-course-term-year) → expect validation error
- **UI tests (manual)**:
  - create/select student (if UI supports it)
  - add record form works and updates history

### 10. Future enhancements

- Authentication (admin login)
- GPA/CGPA calculation + downloadable transcript PDF
- Import/export (CSV)
- Migration to MySQL/PostgreSQL for production deployment

