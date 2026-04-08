import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import StudentForm from '../components/StudentForm';
import AcademicHistory from '../components/AcademicHistory';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [s, h] = await Promise.all([
        api.students.get(id),
        api.students.history(id),
      ]);
      setStudent(s);
      setHistory(h);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(updated) {
    await api.students.update(id, updated);
    setEditing(false);
    load();
  }

  async function handleDelete() {
    if (!confirm('Delete this student and their records?')) return;
    await api.students.delete(id);
    navigate('/');
  }

  async function handleAddRecord(record) {
    await api.students.addRecord(id, record);
    load();
  }

  if (loading) return <div className="page-state">Loading…</div>;
  if (error) return <div className="page-state error">Error: {error}</div>;
  if (!student) return null;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      {editing ? (
        <StudentForm
          initial={student}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <section className="detail-section">
          <div className="detail-header">
            <div>
              <span className="detail-id">{student.student_id}</span>
              <h1>{student.name}</h1>
              <p className="detail-meta">
                {student.email && <span>{student.email}</span>}
                {student.program && <span>{student.program}</span>}
                {student.enrollment_year && <span>Enrolled {student.enrollment_year}</span>}
                {student.cgpa !== null && student.cgpa !== undefined && (
                  <span className="detail-cgpa">
                    CGPA: <strong>{Number(student.cgpa).toFixed(2)}</strong> / 10
                  </span>
                )}
              </p>
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>

          <AcademicHistory
            records={history}
            onAddRecord={handleAddRecord}
          />
        </section>
      )}
    </div>
  );
}
