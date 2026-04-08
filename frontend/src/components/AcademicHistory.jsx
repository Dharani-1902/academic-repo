import { useState, useEffect } from 'react';
import { api } from '../api';
import AddRecordForm from './AddRecordForm';

export default function AcademicHistory({ records, onAddRecord }) {
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.courses.list().then(setCourses);
  }, []);

  const byTerm = records.reduce((acc, r) => {
    const key = `${r.year} ${r.term}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const terms = Object.keys(byTerm).sort((a, b) => {
    const [yA, tA] = a.split(' ');
    const [yB, tB] = b.split(' ');
    if (yA !== yB) return Number(yB) - Number(yA);
    return tB === 'Spring' ? 1 : -1;
  });

  const getGradePoints = (grade) => {
    const mapping = {
      'O': 10.0,
      'A+': 9.5,
      'A': 8.5,
      'B+': 8.0,
      'B': 7.0,
      'C+': 6.5,
      'C': 5.0,
      'D': 3.0,
      'U': 0.0,
      'F': 0.0
    };
    return mapping[grade] || 0.0;
  };

  const calculateTermGPA = (termRecords) => {
    let totalPoints = 0;
    let totalCredits = 0;
    termRecords.forEach(r => {
      const credits = r.credits_earned ?? r.credits ?? 0;
      totalPoints += getGradePoints(r.grade) * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  };

  return (
    <section className="history-section">
      <div className="section-header">
        <h2>Academic history</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          Add record
        </button>
      </div>

      {showAdd && (
        <AddRecordForm
          courses={courses}
          onSubmit={(records) => {
            const list = Array.isArray(records) ? records : [records];
            list.forEach((r) => onAddRecord(r));
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {terms.length === 0 && !showAdd ? (
        <p className="empty">No academic records yet.</p>
      ) : (
        <div className="history-terms">
          {terms.map((termKey) => {
            const termRecords = byTerm[termKey];
            const gpa = calculateTermGPA(termRecords);
            return (
              <div key={termKey} className="term-block">
                <div className="term-header">
                  <h3 className="term-title">{termKey}</h3>
                  {gpa !== null && (
                    <span className="term-gpa">
                      GPA: <strong>{gpa}</strong>
                    </span>
                  )}
                </div>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Grade</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {termRecords.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="course-code">{r.course_code}</span>
                          {r.course_name}
                        </td>
                        <td><span className="grade">{r.grade || '—'}</span></td>
                        <td>{r.credits_earned ?? r.credits ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
