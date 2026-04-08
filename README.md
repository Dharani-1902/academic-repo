## Student Academic History Repository

A placement-ready full-stack project to store and manage **students**, **courses**, and **academic records** (term-wise), with a simple UI and REST API.

### Tech stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: SQLite (via `better-sqlite3`)

### Features

- **Student management**: create, view, update, delete
- **Course catalog**: list courses
- **Academic records**: add term-wise records per student and view academic history

### Project structure

- `backend/`: Express API + SQLite DB initialization (`backend/db/init.js`)
- `frontend/`: React app
- `docs/`: SRS and documentation

### Setup (Windows / PowerShell)

Open **two terminals**.

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:3001` and creates/uses `backend/db/academic.db`.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at the Vite URL printed in the terminal (commonly `http://localhost:5173`).

### API (quick reference)

- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/students/:id/history`
- `POST /api/students/:id/records`
- `GET /api/courses`
- `POST /api/courses`

### SRS report

See `docs/SRS.md`.

# Student Academic History Repository

A full-stack web app to store and manage student records and their academic history (courses, grades, terms).

## Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** React 18, Vite, React Router

## Setup

### Prerequisites

- Node.js 18+

### Backend

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:3001**. The SQLite database and tables are created automatically on first run, with sample students and courses.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** and proxies `/api` to the backend.

## Features

- **Students:** List, add, edit, delete students (ID, name, email, program, enrollment year).
- **Academic history:** View and add course records per student (course, term, year, grade, credits).
- **Courses:** Seeded list of courses; more can be added via API.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/:id/history` | Get academic history |
| POST | `/api/students/:id/records` | Add academic record |
| GET | `/api/courses` | List courses |
| POST | `/api/courses` | Create course |

## Project structure

```
backend/           # Express API + SQLite
  db/
    init.js        # DB schema + seed
  server.js        # Routes and server
frontend/         # React + Vite
  src/
    components/
    pages/
    api.js
    App.jsx
    index.css
    main.jsx
README.md
```
