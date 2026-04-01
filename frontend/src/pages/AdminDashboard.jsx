import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, BookOpen, Search, LogOut, Plus, Trash2, Edit, LayoutDashboard, Database, AlertCircle, ChevronLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [arrears, setArrears] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'records' | 'arrears'

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({ student_id: '', name: '', department: '', year: '', email: '', password: '' });
  const [recordForm, setRecordForm] = useState({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' });

  useEffect(() => {
    fetchStudents();
    fetchArrears();
  }, []);

  const fetchArrears = async () => {
    try {
      const res = await api.get('/records/arrears');
      setArrears(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async (studentId) => {
    try {
      const res = await api.get(`/records/${studentId}`);
      setRecords(res.data);
      setActiveTab('records');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', studentForm);
      setShowStudentModal(false);
      setStudentForm({ student_id: '', name: '', department: '', year: '', email: '', password: '' });
      fetchStudents();
      fetchArrears();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete student and all records?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditRecordModal = (record) => {
    setRecordForm({
      student_id: record.student_id,
      semester: record.semester,
      subject_name: record.subject_name,
      grade: record.grade,
      credits: record.credits
    });
    setEditingRecordId(record.id);
    setIsEditingRecord(true);
    setShowRecordModal(true);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      if (isEditingRecord) {
        await api.put(`/records/${editingRecordId}`, recordForm);
      } else {
        await api.post('/records', recordForm);
      }
      setShowRecordModal(false);
      setIsEditingRecord(false);
      setEditingRecordId(null);
      setRecordForm({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' });
      if (activeTab === 'records' && records.length > 0 && (records[0].student_id === recordForm.student_id || isEditingRecord)) {
        fetchRecords(recordForm.student_id);
      }
      fetchArrears();
    } catch (err) {
      alert(err.response?.data?.message || `Error ${isEditingRecord ? 'updating' : 'creating'} record`);
    }
  };

  const handleDeleteRecord = async (id, student_id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords(student_id);
      fetchArrears();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s =>
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container animate-fade">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BookOpen size={32} style={{ marginBottom: '0.5rem', display: 'block' }} />
          Academia
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('students')}
            className={`btn ${activeTab === 'students' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', background: activeTab === 'students' ? 'var(--primary)' : 'transparent', color: activeTab === 'students' ? 'white' : 'rgba(255,255,255,0.7)' }}
          >
            <Users size={20} /> Students
          </button>
          <button
            onClick={() => setActiveTab('arrears')}
            className={`btn ${activeTab === 'arrears' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', background: activeTab === 'arrears' ? 'var(--primary)' : 'transparent', color: activeTab === 'arrears' ? 'white' : 'rgba(255,255,255,0.7)' }}
          >
            <AlertCircle size={20} /> Arrears
          </button>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="card glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>Logged in as</p>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.username}</p>
            <button onClick={logout} className="btn btn-danger" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="stats-grid">
          <div className="card glass stat-card" onClick={() => setActiveTab('students')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: 'hsla(var(--h-primary), var(--s-primary), var(--l-primary), 0.1)', color: 'var(--primary)' }}><Users size={28} /></div>
            <div className="stat-details">
              <h3>Total Students</h3>
              <p>{students.length}</p>
            </div>
          </div>
          <div className="card glass stat-card" onClick={() => setShowStudentModal(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#0ea5e9' }}><Plus size={28} /></div>
            <div className="stat-details">
              <h3>Register</h3>
              <p style={{ fontSize: '1rem' }}>Add Student</p>
            </div>
          </div>
          <div className="card glass stat-card" onClick={() => setShowRecordModal(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: 'hsla(150, 80%, 40%, 0.1)', color: 'var(--success)' }}><Plus size={28} /></div>
            <div className="stat-details">
              <h3>Grades</h3>
              <p style={{ fontSize: '1rem' }}>Add Record</p>
            </div>
          </div>
          <div className="card glass stat-card" onClick={() => setActiveTab('arrears')} style={{ cursor: 'pointer', border: arrears.length > 0 ? '1px solid var(--danger)' : '1px solid var(--border-color)' }}>
            <div className="stat-icon" style={{ background: 'hsla(0, 85%, 60%, 0.1)', color: 'var(--danger)' }}><AlertCircle size={28} /></div>
            <div className="stat-details">
              <h3>Arrears</h3>
              <p style={{ color: arrears.length > 0 ? 'var(--danger)' : 'inherit' }}>{arrears.length}</p>
            </div>
          </div>
        </div>

        {activeTab === 'students' && (
          <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Student Directory</h2>
              <div className="form-group" style={{ marginBottom: 0, width: '300px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search ID or Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{student.student_id}</span></td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td>{student.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => fetchRecords(student.student_id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View</button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No students found match your search criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setActiveTab('students')} className="btn" style={{ background: 'rgba(0,0,0,0.05)', padding: '0.5rem' }}><ChevronLeft size={20} /></button>
              <h2 style={{ fontSize: '1.75rem' }}>Academic Records Preview</h2>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Target ID</th>
                    <th>Semester</th>
                    <th>Subject</th>
                    <th>Grade</th>
                    <th>Credits</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{r.student_id}</td>
                      <td>{r.semester}</td>
                      <td>{r.subject_name}</td>
                      <td><span style={{ fontWeight: 700, color: r.grade.includes('U') ? 'var(--danger)' : 'var(--success)' }}>{r.grade}</span></td>
                      <td>{r.credits}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditRecordModal(r)} className="btn" style={{ padding: '0.4rem 0.8rem', background: 'hsla(150, 80%, 40%, 0.1)', color: 'var(--success)' }}><Edit size={16} /></button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found for this student.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'arrears' && (
          <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={() => setActiveTab('students')} className="btn" style={{ background: 'rgba(0,0,0,0.05)', padding: '0.5rem' }}><ChevronLeft size={20} /></button>
              <h2 style={{ fontSize: '1.75rem' }}>Arrear History (All Students)</h2>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Semester</th>
                    <th>Subject</th>
                    <th>Grade</th>
                    <th>Credits</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {arrears.map(r => (
                    <tr key={r.id}>
                      <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.student_id}</span></td>
                      <td>{r.semester}</td>
                      <td>{r.subject_name}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--danger)' }}>{r.grade}</span></td>
                      <td>{r.credits}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditRecordModal(r)} className="btn" style={{ padding: '0.4rem 0.8rem', background: 'hsla(150, 80%, 40%, 0.1)', color: 'var(--success)' }}><Edit size={16} /></button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {arrears.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No pending arrears found. High five! 🙌</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showStudentModal && (
        <div className="modal-overlay animate-fade">
          <div className="card glass modal-content" style={{ maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Register Student</h2>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" type="text" placeholder="e.g. S101" required value={studentForm.student_id} onChange={e => setStudentForm({ ...studentForm, student_id: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" placeholder="e.g. John Doe" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label><input className="form-input" type="text" placeholder="e.g. CSE" required value={studentForm.department} onChange={e => setStudentForm({ ...studentForm, department: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="text" placeholder="e.g. 3rd Year" required value={studentForm.year} onChange={e => setStudentForm({ ...studentForm, year: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="email@example.com" required value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Account Password</label><input className="form-input" type="password" placeholder="••••••••" required value={studentForm.password} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register</button>
                <button type="button" onClick={() => setShowStudentModal(false)} className="btn" style={{ flex: 1, background: 'rgba(0,0,0,0.05)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="modal-overlay animate-fade">
          <div className="card glass modal-content" style={{ maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{isEditingRecord ? 'Edit' : 'Add'} Academic Record</h2>
            <form onSubmit={handleCreateRecord}>
              <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" type="text" placeholder="S101" required value={recordForm.student_id} onChange={e => setRecordForm({ ...recordForm, student_id: e.target.value })} disabled={isEditingRecord} /></div>
              <div className="form-group"><label className="form-label">Semester</label><input className="form-input" type="text" placeholder="e.g. Semester 5" required value={recordForm.semester} onChange={e => setRecordForm({ ...recordForm, semester: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" type="text" placeholder="e.g. Operating Systems" required value={recordForm.subject_name} onChange={e => setRecordForm({ ...recordForm, subject_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Grade</label><input className="form-input" type="text" placeholder="A+, B, U..." required value={recordForm.grade} onChange={e => setRecordForm({ ...recordForm, grade: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Credits</label><input className="form-input" type="number" placeholder="4" required value={recordForm.credits} onChange={e => setRecordForm({ ...recordForm, credits: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingRecord ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => { setShowRecordModal(false); setIsEditingRecord(false); setEditingRecordId(null); setRecordForm({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' }); }} className="btn" style={{ flex: 1, background: 'rgba(0,0,0,0.05)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
