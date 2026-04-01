import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, LogOut, Award, Book, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch student's academic records using their username (which is their student_id)
        const res = await api.get(`/records/${user.username}`);
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.username) {
      loadData();
    }
  }, [user]);

  // Group records by semester
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.semester]) {
      acc[record.semester] = [];
    }
    acc[record.semester].push(record);
    return acc;
  }, {});

  // Calculate total credits
  const totalCredits = records.reduce((sum, r) => sum + Number(r.credits), 0);
  
  // Calculate average GPA approx (A=4, B=3, C=2, D=1, F=0)
  const gradePoints = { 'A+':4.0, 'A':4.0, 'A-':3.7, 'B+':3.3, 'B':3.0, 'B-':2.7, 'C+':2.3, 'C':2.0, 'C-':1.7, 'D+':1.3, 'D':1.0, 'F':0 };
  // const gradePoints = { 'O':9.5, 'A+':9.0, 'A':8.0, 'B+':7.0, 'B':6.0, 'C+':5.5, 'C':5.0, 'F':0 };

  let totalGradePoints = 0;
  let gradedCredits = 0;
  records.forEach(r => {
    const points = gradePoints[r.grade.toUpperCase()] !== undefined ? gradePoints[r.grade.toUpperCase()] : null;
    if(points !== null) {
      totalGradePoints += points * Number(r.credits);
      gradedCredits += Number(r.credits);
    }
  });
  const gpa = gradedCredits > 0 ? (totalGradePoints / gradedCredits).toFixed(2) : 'N/A';

  // Find arrears
  const studentArrears = records.filter(r => r.grade.toUpperCase() === 'U');

  return (
    <div className="dashboard-container">
      <header className="topbar">
        <div className="topbar-brand">
          <BookOpen color="var(--accent)"/> Student Academic Hub
        </div>
        <div className="topbar-actions">
          <span className="user-info">Student ID: {user?.username}</span>
          <button onClick={logout} className="logout-btn"><LogOut size={16}/> Logout</button>
        </div>
      </header>

      <main className="content-wrapper">
        <div className="page-header">
          <h2>My Academic History</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)'}}><Book size={32} /></div>
            <div className="stat-details">
              <h3>Total Credits Earned</h3>
              <p>{totalCredits}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color: '#eeb24a', background: 'rgba(245, 158, 11, 0.1)'}}><Award size={32} /></div>
            <div className="stat-details">
              <h3>Cumulative GPA</h3>
              <p>{gpa}</p>
            </div>
          </div>
        </div>

        {studentArrears.length > 0 && (
          <div className="table-container" style={{border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '2rem'}}>
            <div style={{padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)'}}>
              <AlertTriangle color="var(--danger)" size={20}/>
              <h3 style={{color: 'var(--danger)', margin: 0}}>Pending Arrears ({studentArrears.length})</h3>
            </div>
            <div style={{padding: '1rem 1.5rem'}}>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>The following subjects have Arrear (Grade U). Please contact the administrator for re-examination details.</p>
              <ul style={{marginTop: '1rem', listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                {studentArrears.map(a => (
                  <li key={a.id} style={{background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                    <strong style={{color: 'white'}}>{a.subject_name}</strong> <span style={{color: 'var(--text-muted)', marginLeft: '0.5rem'}}>({a.semester})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {Object.keys(groupedRecords).length === 0 ? (
          <div className="table-container" style={{padding: '4rem', textAlign: 'center'}}>
            <BookOpen size={48} color="var(--text-muted)" style={{margin: '0 auto 1rem'}} />
            <h3 style={{color: 'var(--text-muted)'}}>No academic records found.</h3>
            <p style={{color: 'var(--border-color)', marginTop: '0.5rem'}}>Your records will appear here once updated by an administrator.</p>
          </div>
        ) : (
          Object.keys(groupedRecords).sort().map(semester => (
            <div key={semester} className="table-container">
              <div style={{padding: '1.25rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--border-color)'}}>
                <h3 style={{color: 'var(--accent)'}}>{semester}</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRecords[semester].map(record => (
                    <tr key={record.id}>
                      <td>{record.subject_name}</td>
                      <td>{record.credits}</td>
                      <td><strong style={{color: record.grade.includes('F') ? 'var(--danger)' : 'var(--success)'}}>{record.grade}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
