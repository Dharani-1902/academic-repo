import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, LogOut, Award, Book, AlertTriangle, UserCircle, Briefcase, Calendar, Mail } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
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

  // Calculate average GPA approx
  const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0, 'U': 0 };

  let totalGradePoints = 0;
  let gradedCredits = 0;
  records.forEach(r => {
    const points = gradePoints[r.grade.toUpperCase()] !== undefined ? gradePoints[r.grade.toUpperCase()] : null;
    if (points !== null) {
      totalGradePoints += points * Number(r.credits);
      gradedCredits += Number(r.credits);
    }
  });
  const gpa = gradedCredits > 0 ? (totalGradePoints / gradedCredits).toFixed(2) : 'N/A';

  // Find arrears
  const studentArrears = records.filter(r => r.grade.toUpperCase() === 'U');

  return (
    <div className="dashboard-container animate-fade">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BookOpen size={32} style={{ marginBottom: '0.5rem', display: 'block' }} />
          Academia
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="btn btn-primary" style={{ justifyContent: 'flex-start', cursor: 'default' }}>
            <Book size={20} /> My Academic Hub
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="card glass" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <UserCircle size={32} style={{ color: 'var(--primary)' }} />
              <div>
                <p style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Student ID</p>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.username}</p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-danger" style={{ width: '100%', padding: '0.5rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', background: 'linear-gradient(to right, var(--text-main), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome back!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your academic progress and grade history here.</p>
        </div>

        <div className="stats-grid">
          <div className="card glass stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#0ea5e9' }}><Book size={28} /></div>
            <div className="stat-details">
              <h3>Earned Credits</h3>
              <p>{totalCredits}</p>
            </div>
          </div>
          <div className="card glass stat-card">
            <div className="stat-icon" style={{ background: 'hsla(40, 95%, 55%, 0.1)', color: 'var(--warning)' }}><Award size={28} /></div>
            <div className="stat-details">
              <h3>Cumulative GPA</h3>
              <p>{gpa}</p>
            </div>
          </div>
          <div className="card glass stat-card" style={{ border: studentArrears.length > 0 ? '1px solid var(--danger)' : '1px solid var(--border-color)' }}>
            <div className="stat-icon" style={{ background: 'hsla(0, 85%, 60%, 0.1)', color: 'var(--danger)' }}><AlertTriangle size={28} /></div>
            <div className="stat-details">
              <h3>Pending Arrears</h3>
              <p style={{ color: studentArrears.length > 0 ? 'var(--danger)' : 'inherit' }}>{studentArrears.length}</p>
            </div>
          </div>
        </div>

        {studentArrears.length > 0 && (
          <div className="card animate-fade" style={{ border: '1px solid hsla(0, 85%, 60%, 0.2)', background: 'hsla(0, 85%, 60%, 0.03)', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle className="animate-bounce-subtle" color="var(--danger)" size={20} />
              <h3 style={{ color: 'var(--danger)', fontSize: '1.1rem' }}>Attention Required</h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', opacity: 0.8 }}>The following subjects have an Arrear (Grade U). Please coordinate with the administration for the re-examination process.</p>
            <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {studentArrears.map(a => (
                <span key={a.id} className="card glass" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid hsla(0, 85%, 60%, 0.1)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)', background: 'white' }}>
                  {a.subject_name} <span style={{ opacity: 0.5, fontWeight: 400, marginLeft: '0.5rem' }}>({a.semester})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(groupedRecords).length === 0 ? (
          <div className="card glass animate-fade" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <BookOpen size={64} style={{ color: 'var(--border-color)', marginBottom: '1.5rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>No academic records found</h3>
            <p style={{ marginTop: '0.75rem', opacity: 0.7 }}>Your academic profile is being updated. Please check back later.</p>
          </div>
        ) : (
          Object.keys(groupedRecords).sort().reverse().map(semester => (
            <div key={semester} className="animate-fade" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{semester}</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '60%' }}>Subject Name</th>
                      <th>Credits</th>
                      <th style={{ textAlign: 'right' }}>Grade Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedRecords[semester].map(record => (
                      <tr key={record.id}>
                        <td><span style={{ fontWeight: 500 }}>{record.subject_name}</span></td>
                        <td>{record.credits}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            background: record.grade.toUpperCase() === 'U' ? 'hsla(0, 85%, 60%, 0.1)' : 'hsla(150, 80%, 40%, 0.1)',
                            color: record.grade.toUpperCase() === 'U' ? 'var(--danger)' : 'var(--success)'
                          }}>
                            {record.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
