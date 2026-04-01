import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, BookOpen, Search, LogOut, Plus, Trash2, Edit } from 'lucide-react';

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
    if(!window.confirm('Delete student and all records?')) return;
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
      if(activeTab === 'records' && records.length > 0 && (records[0].student_id === recordForm.student_id || isEditingRecord)) {
        fetchRecords(recordForm.student_id);
      }
      fetchArrears();
    } catch (err) {
      alert(err.response?.data?.message || `Error ${isEditingRecord ? 'updating' : 'creating'} record`);
    }
  };

  const handleDeleteRecord = async (id, student_id) => {
    if(!window.confirm('Delete this record?')) return;
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
    <div className="dashboard-container">
      <header className="topbar">
        <div className="topbar-brand">
          <BookOpen /> Admin Portal
        </div>
        <div className="topbar-actions">
          <span className="user-info">Logged in as: {user?.username}</span>
          <button onClick={logout} className="logout-btn"><LogOut size={16}/> Logout</button>
        </div>
      </header>

      <main className="content-wrapper">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => setActiveTab('students')} style={{cursor: 'pointer'}}>
            <div className="stat-icon"><Users size={32} /></div>
            <div className="stat-details">
              <h3>Total Students</h3>
              <p>{students.length}</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => setShowStudentModal(true)} style={{cursor: 'pointer', background: 'rgba(79, 70, 229, 0.1)'}}>
            <div className="stat-icon" style={{color: 'var(--primary)', background: 'transparent'}}><Plus size={32} /></div>
            <div className="stat-details">
              <h3 style={{color: 'var(--primary)'}}>Register New</h3>
              <p style={{fontSize: '1rem', marginTop: '0.5rem'}}>Add Student</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => setShowRecordModal(true)} style={{cursor: 'pointer', background: 'rgba(16, 185, 129, 0.1)'}}>
            <div className="stat-icon" style={{color: 'var(--success)', background: 'transparent'}}><Plus size={32} /></div>
            <div className="stat-details">
              <h3 style={{color: 'var(--success)'}}>Add Grade</h3>
              <p style={{fontSize: '1rem', marginTop: '0.5rem'}}>Add Academic Record</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => setActiveTab('arrears')} style={{cursor: 'pointer', border: arrears.length > 0 ? '2px solid var(--danger)' : 'none'}}>
            <div className="stat-icon" style={{color: 'var(--danger)'}}><Plus size={32} style={{transform: 'rotate(45deg)'}}/></div>
            <div className="stat-details">
              <h3>Arrears (Grade U)</h3>
              <p style={{color: arrears.length > 0 ? 'var(--danger)' : 'inherit', fontWeight: 'bold'}}>{arrears.length}</p>
            </div>
          </div>
        </div>

        {activeTab === 'students' && (
          <>
            <div className="page-header">
              <h2>Student Directory</h2>
              <div className="search-bar" style={{display: 'flex', alignItems:'center', background:'rgba(250, 250, 250, 0.6)', padding:'0.5rem 1rem', borderRadius:'10px', border:'2px solid var(--border-color)'}}>
                <Search size={18} style={{marginRight: '0.5rem', color: 'var(--text-muted)'}}/>
                <input 
                  type="text" 
                  placeholder="Search ID or Name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{background:'transparent', border:'none', color:'black', outline:'none'}}
                />
              </div>
            </div>

            <div className="table-container">
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
                      <td><strong style={{color: 'var(--accent)'}}>{student.student_id}</strong></td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td>{student.email}</td>
                      <td>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <button onClick={() => fetchRecords(student.student_id)} className="btn-primary" style={{padding: '0.25rem 0.5rem', fontSize:'0.85rem'}}>View Records</button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="btn-danger" style={{padding: '0.25rem 0.5rem'}}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'records' && (
          <>
            <div className="page-header">
              <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                <button onClick={() => setActiveTab('students')} className="logout-btn">← Back</button>
                <h2>Academic Records Preview</h2>
              </div>
            </div>

            <div className="table-container">
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
                      <td><strong style={{color: r.grade.includes('U') ? 'var(--danger)' : 'var(--success)'}}>{r.grade}</strong></td>
                      <td>{r.credits}</td>
                      <td>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <button onClick={() => openEditRecordModal(r)} className="btn-primary" style={{padding: '0.25rem 0.5rem', background: 'var(--success)'}}><Edit size={16}/></button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="btn-danger" style={{padding: '0.25rem 0.5rem'}}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No records found for this student.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'arrears' && (
          <>
            <div className="page-header">
              <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                <button onClick={() => setActiveTab('students')} className="logout-btn">← Back</button>
                <h2>Arrear History (All Students)</h2>
              </div>
            </div>

            <div className="table-container">
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
                      <td><strong style={{color: 'var(--accent)'}}>{r.student_id}</strong></td>
                      <td>{r.semester}</td>
                      <td>{r.subject_name}</td>
                      <td><strong style={{color: 'var(--danger)'}}>{r.grade}</strong></td>
                      <td>{r.credits}</td>
                      <td>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <button onClick={() => openEditRecordModal(r)} className="btn-primary" style={{padding: '0.25rem 0.5rem', background: 'var(--success)'}}><Edit size={16}/></button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="btn-danger" style={{padding: '0.25rem 0.5rem'}}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {arrears.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No pending arrears found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginBottom: '1.5rem'}}>Register Student</h2>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group"><input type="text" placeholder="Student ID" required value={studentForm.student_id} onChange={e => setStudentForm({...studentForm, student_id: e.target.value})} /></div>
              <div className="form-group"><input type="text" placeholder="Full Name" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} /></div>
              <div className="form-group"><input type="text" placeholder="Department" required value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})} /></div>
              <div className="form-group"><input type="text" placeholder="Year" required value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: e.target.value})} /></div>
              <div className="form-group"><input type="email" placeholder="Email" required value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} /></div>
              <div className="form-group"><input type="password" placeholder="Account Password" required value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} /></div>
              <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
                <button type="submit" className="btn-primary" style={{flex: 1}}>Save</button>
                <button type="button" onClick={() => setShowStudentModal(false)} className="logout-btn" style={{flex: 1}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginBottom: '1.5rem'}}>{isEditingRecord ? 'Edit' : 'Add'} Academic Record</h2>
            <form onSubmit={handleCreateRecord}>
              <div className="form-group"><input type="text" placeholder="Student ID" required value={recordForm.student_id} onChange={e => setRecordForm({...recordForm, student_id: e.target.value})} disabled={isEditingRecord} /></div>
              <div className="form-group"><input type="text" placeholder="Semester (e.g. Fall 2023)" required value={recordForm.semester} onChange={e => setRecordForm({...recordForm, semester: e.target.value})} /></div>
              <div className="form-group"><input type="text" placeholder="Subject Name" required value={recordForm.subject_name} onChange={e => setRecordForm({...recordForm, subject_name: e.target.value})} /></div>
              <div className="form-group"><input type="text" placeholder="Grade (A, B, C...)" required value={recordForm.grade} onChange={e => setRecordForm({...recordForm, grade: e.target.value})} /></div>
              <div className="form-group"><input type="number" placeholder="Credits" required value={recordForm.credits} onChange={e => setRecordForm({...recordForm, credits: e.target.value})} /></div>
              <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
                <button type="submit" className="btn-primary" style={{flex: 1}}>{isEditingRecord ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => { setShowRecordModal(false); setIsEditingRecord(false); setEditingRecordId(null); setRecordForm({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' }); }} className="logout-btn" style={{flex: 1}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
