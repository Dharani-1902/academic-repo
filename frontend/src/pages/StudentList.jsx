import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StudentForm from '../components/StudentForm';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.students.list();
      setStudents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(student) {
    await api.students.create(student);
    setShowForm(false);
    load();
  }

  if (loading) return <div className="page-state">Loading students…</div>;
  if (error) return <div className="page-state error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add student
        </button>
      </div>

      {showForm && (
        <StudentForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ul className="card-list">
        {students.map((s) => (
          <li key={s.id} className="card">
            <Link to={`/students/${s.id}`} className="card-link">
              <span className="card-id">{s.student_id}</span>
              <h3 className="card-title">{s.name}</h3>
              <p className="card-meta">
                {s.program && <span>{s.program}</span>}
                {s.enrollment_year && <span>Enrolled {s.enrollment_year}</span>}
                {s.cgpa !== null && s.cgpa !== undefined && (
                  <span className="card-cgpa">
                    CGPA: <strong>{Number(s.cgpa).toFixed(2)}</strong> / 10
                  </span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {students.length === 0 && !showForm && (
        <p className="empty">No students yet. Add one to get started.</p>
      )}
    </div>
  );
}
