import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, BookOpen, Search, LogOut, Plus, Trash2, Edit, AlertCircle, ChevronLeft, Eye, GraduationCap, UserPlus, FileText, Zap, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [arrears, setArrears] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'records' | 'arrears' | 'skills' | 'activities'

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  
  // Skills/Activities Modals
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({ student_id: '', name: '', department: '', year: '', email: '', password: '' });
  const [recordForm, setRecordForm] = useState({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' });
  const [skillsForm, setSkillsForm] = useState({ student_id: '', skills: '', skills_status: 'Ongoing' });
  const [activitiesForm, setActivitiesForm] = useState({ student_id: '', extra_activities: '', activities_status: 'Ongoing' });

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

  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    try {
      let studentIdToUpdate = currentStudentId;
      if (!isEditingSkills) {
        const student = students.find(s => s.student_id === skillsForm.student_id);
        if (!student) return alert('Student not found');
        studentIdToUpdate = student.id;
      }
      await api.put(`/students/${studentIdToUpdate}`, { 
        skills: skillsForm.skills,
        skills_status: skillsForm.skills_status 
      });
      setShowSkillsModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating skills');
    }
  };

  const handleUpdateActivities = async (e) => {
    e.preventDefault();
    try {
      const student = students.find(s => s.student_id === activitiesForm.student_id);
      if (!student) return alert('Student not found');
      
      await api.put(`/students/${student.id}`, { 
        extra_activities: activitiesForm.extra_activities,
        activities_status: activitiesForm.activities_status
      });
      setShowActivitiesModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating activities');
    }
  };

  const filteredStudents = students.filter(s =>
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container animate-fade">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <GraduationCap size={26} style={{ flexShrink: 0 }} />
          Academia
        </div>

        <nav>
          <button
            onClick={() => setActiveTab('students')}
            className={`sidebar-btn ${activeTab === 'students' ? 'active' : ''}`}
          >
            <Users size={18} /> Students
          </button>
          <button
            onClick={() => setActiveTab('arrears')}
            className={`sidebar-btn ${activeTab === 'arrears' ? 'active' : ''}`}
          >
            <AlertCircle size={18} /> Arrears
            {arrears.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--danger)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                minWidth: '20px',
                textAlign: 'center',
              }}>
                {arrears.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`sidebar-btn ${activeTab === 'skills' ? 'active' : ''}`}
          >
            <Zap size={18} /> Skills
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`sidebar-btn ${activeTab === 'activities' ? 'active' : ''}`}
          >
            <Trophy size={18} /> Activities
          </button>
        </nav>

        <div className="sidebar-user">
          <p className="sidebar-user-label">Logged in as</p>
          <p className="sidebar-user-name">{user?.username}</p>
          <button onClick={logout} className="sidebar-logout-btn">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        {/* Stats */}
        <div className="stats-grid animate-stagger">
          <div className="stat-card stat-card--primary" onClick={() => setActiveTab('students')}>
            <div className="stat-card-header">
              <span className="stat-title">Total Students</span>
              <div className="stat-icon stat-icon--primary"><Users size={22} /></div>
            </div>
            <p className="stat-value">{students.length}</p>
            <p className="stat-label">enrolled</p>
          </div>

          <div className="stat-card stat-card--info" onClick={() => setShowStudentModal(true)}>
            <div className="stat-card-header">
              <span className="stat-title">Register</span>
              <div className="stat-icon stat-icon--info"><UserPlus size={22} /></div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Student</p>
            <p className="stat-label">new enrollment</p>
          </div>

          <div className="stat-card stat-card--success" onClick={() => setShowRecordModal(true)}>
            <div className="stat-card-header">
              <span className="stat-title">Grades</span>
              <div className="stat-icon stat-icon--success"><FileText size={22} /></div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Record</p>
            <p className="stat-label">academic entry</p>
          </div>

          <div className="stat-card stat-card--danger" onClick={() => setActiveTab('arrears')}>
            <div className="stat-card-header">
              <span className="stat-title">Arrears</span>
              <div className="stat-icon stat-icon--danger"><AlertCircle size={22} /></div>
            </div>
            <p className="stat-value" style={{ color: arrears.length > 0 ? 'var(--danger)' : 'inherit' }}>{arrears.length}</p>
            <p className="stat-label">pending</p>
          </div>

          <div className="stat-card stat-card--primary" onClick={() => { setSkillsForm({ student_id: '', skills: '', skills_status: 'Ongoing' }); setShowSkillsModal(true); setIsEditingSkills(false); }}>
            <div className="stat-card-header">
              <span className="stat-title">Skills</span>
              <div className="stat-icon stat-icon--primary"><Zap size={22} /></div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Skills</p>
            <p className="stat-label">profile update</p>
          </div>

          <div className="stat-card stat-card--warning" onClick={() => { setActivitiesForm({ student_id: '', extra_activities: '', activities_status: 'Ongoing' }); setShowActivitiesModal(true); }}>
            <div className="stat-card-header">
              <span className="stat-title">Activities</span>
              <div className="stat-icon stat-icon--warning"><Trophy size={22} /></div>
            </div>
            <p className="stat-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Activity</p>
            <p className="stat-label">accomplishment</p>
          </div>
        </div>

        {/* ===== STUDENTS TAB ===== */}
        {activeTab === 'students' && (
          <div className="animate-fade">
            <div className="page-header">
              <h2 className="page-title">
                Student Directory
                <span className="page-title-badge">{filteredStudents.length}</span>
              </h2>
              <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search ID or Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                      <td><span className="student-id-tag">{student.student_id}</span></td>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{student.email}</td>
                      <td>
                        <div className="action-btn-group">
                          <button onClick={() => fetchRecords(student.student_id)} className="action-btn action-btn--view">
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="action-btn action-btn--delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <div className="empty-state-icon"><Search size={24} /></div>
                          <p className="empty-state-text">No students match your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== RECORDS TAB ===== */}
        {activeTab === 'records' && (
          <div className="animate-fade">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setActiveTab('students')} className="back-btn"><ChevronLeft size={18} /></button>
                <h2 className="page-title">Academic Records</h2>
              </div>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td><span className="student-id-tag">{r.student_id}</span></td>
                      <td>{r.semester.toLowerCase().includes('semester') ? r.semester : `Semester ${r.semester}`}</td>
                      <td style={{ fontWeight: 500 }}>{r.subject_name}</td>
                      <td>
                        <span className={`grade-badge ${r.grade.includes('U') ? 'grade-badge--fail' : 'grade-badge--pass'}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td>{r.credits}</td>
                      <td>
                        <div className="action-btn-group">
                          <button onClick={() => openEditRecordModal(r)} className="action-btn action-btn--edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="action-btn action-btn--delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <div className="empty-state-icon"><FileText size={24} /></div>
                          <p className="empty-state-text">No records found for this student.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ARREARS TAB ===== */}
        {activeTab === 'arrears' && (
          <div className="animate-fade">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setActiveTab('students')} className="back-btn"><ChevronLeft size={18} /></button>
                <h2 className="page-title">
                  Arrear History
                  {arrears.length > 0 && <span className="page-title-badge" style={{ background: 'hsla(0,78%,58%,0.1)', color: 'var(--danger)' }}>{arrears.length}</span>}
                </h2>
              </div>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arrears.map(r => (
                    <tr key={r.id}>
                      <td><span className="student-id-tag">{r.student_id}</span></td>
                      <td>{r.semester.toLowerCase().includes('semester') ? r.semester : `Semester ${r.semester}`}</td>
                      <td style={{ fontWeight: 500 }}>{r.subject_name}</td>
                      <td>
                        <span className="grade-badge grade-badge--fail">{r.grade}</span>
                      </td>
                      <td>{r.credits}</td>
                      <td>
                        <div className="action-btn-group">
                          <button onClick={() => openEditRecordModal(r)} className="action-btn action-btn--edit">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteRecord(r.id, r.student_id)} className="action-btn action-btn--delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {arrears.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <div className="empty-state-icon">🙌</div>
                          <p className="empty-state-text">No pending arrears found. Great job!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== SKILLS TAB ===== */}
        {activeTab === 'skills' && (
          <div className="animate-fade">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setActiveTab('students')} className="back-btn"><ChevronLeft size={18} /></button>
                <h2 className="page-title">Student Skills</h2>
                <button onClick={() => { setSkillsForm({ student_id: '', skills: '', skills_status: 'Ongoing' }); setShowSkillsModal(true); setIsEditingSkills(false); }} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginLeft: 'auto' }}>
                  <Plus size={14} /> Add Skills
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Technical & Soft Skills</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td><span className="student-id-tag">{s.student_id}</span></td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>
                        {s.skills ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {s.skills.split(',').map((skill, idx) => (
                              <span key={idx} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No skills recorded</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: s.skills_status === 'Completed' ? 'hsla(150, 80%, 40%, 0.1)' : 'hsla(210, 80%, 50%, 0.1)',
                            color: s.skills_status === 'Completed' ? 'var(--success)' : 'var(--primary)',
                            border: '1px solid currentColor'
                          }}>
                            {s.skills_status || 'Ongoing'}
                          </span>
                          <button onClick={() => { 
                            setSkillsForm({ student_id: s.student_id, skills: s.skills || '', skills_status: s.skills_status || 'Ongoing' }); 
                            setCurrentStudentId(s.id);
                            setShowSkillsModal(true); 
                            setIsEditingSkills(true); 
                          }} className="action-btn action-btn--edit">
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ACTIVITIES TAB ===== */}
        {activeTab === 'activities' && (
          <div className="animate-fade">
            <div className="page-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setActiveTab('students')} className="back-btn"><ChevronLeft size={18} /></button>
                <h2 className="page-title">Extra-Curricular Activities</h2>
                <button onClick={() => { setActivitiesForm({ student_id: '', extra_activities: '', activities_status: 'Ongoing' }); setShowActivitiesModal(true); }} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginLeft: 'auto' }}>
                  <Plus size={14} /> Add Activity
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Activities & Accomplishments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td><span className="student-id-tag">{s.student_id}</span></td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {s.extra_activities || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activities recorded</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: s.activities_status === 'Completed' ? 'hsla(150, 80%, 40%, 0.1)' : 'hsla(40, 80%, 50%, 0.1)',
                            color: s.activities_status === 'Completed' ? 'var(--success)' : 'var(--warning)',
                            border: '1px solid currentColor'
                          }}>
                            {s.activities_status || 'Ongoing'}
                          </span>
                          <button onClick={() => { 
                            setActivitiesForm({ student_id: s.student_id, extra_activities: s.extra_activities || '', activities_status: s.activities_status || 'Ongoing' }); 
                            setCurrentStudentId(s.id);
                            setShowActivitiesModal(true); 
                          }} className="action-btn action-btn--edit">
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="card glass modal-content">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Register Student</h2>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" type="text" placeholder="e.g. S101" required value={studentForm.student_id} onChange={e => setStudentForm({ ...studentForm, student_id: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" placeholder="e.g. John Doe" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label><input className="form-input" type="text" placeholder="e.g. CSE" required value={studentForm.department} onChange={e => setStudentForm({ ...studentForm, department: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Year</label><input className="form-input" type="text" placeholder="e.g. 3rd Year" required value={studentForm.year} onChange={e => setStudentForm({ ...studentForm, year: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="email@example.com" required value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Account Password</label><input className="form-input" type="password" placeholder="••••••••" required value={studentForm.password} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register</button>
                <button type="button" onClick={() => setShowStudentModal(false)} className="btn" style={{ flex: 1, background: 'hsla(var(--h-surface), 20%, 80%, 0.2)', color: 'var(--text-main)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="modal-overlay">
          <div className="card glass modal-content">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>{isEditingRecord ? 'Edit' : 'Add'} Academic Record</h2>
            <form onSubmit={handleCreateRecord}>
              <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" type="text" placeholder="S101" required value={recordForm.student_id} onChange={e => setRecordForm({ ...recordForm, student_id: e.target.value })} disabled={isEditingRecord} /></div>
              <div className="form-group"><label className="form-label">Semester</label><input className="form-input" type="text" placeholder="e.g. 5" required value={recordForm.semester} onChange={e => setRecordForm({ ...recordForm, semester: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" type="text" placeholder="e.g. Operating Systems" required value={recordForm.subject_name} onChange={e => setRecordForm({ ...recordForm, subject_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Grade</label><input className="form-input" type="text" placeholder="A+, B, U..." required value={recordForm.grade} onChange={e => setRecordForm({ ...recordForm, grade: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Credits</label><input className="form-input" type="number" placeholder="4" required value={recordForm.credits} onChange={e => setRecordForm({ ...recordForm, credits: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingRecord ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => { setShowRecordModal(false); setIsEditingRecord(false); setEditingRecordId(null); setRecordForm({ student_id: '', semester: '', subject_name: '', grade: '', credits: '' }); }} className="btn" style={{ flex: 1, background: 'hsla(var(--h-surface), 20%, 80%, 0.2)', color: 'var(--text-main)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSkillsModal && (
        <div className="modal-overlay">
          <div className="card glass modal-content">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Update Student Skills</h2>
            <form onSubmit={handleUpdateSkills}>
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input className="form-input" type="text" placeholder="S101" required value={skillsForm.student_id} onChange={e => setSkillsForm({ ...skillsForm, student_id: e.target.value })} disabled={isEditingSkills} />
              </div>
              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <textarea className="form-input" placeholder="React, Node.js, Problem Solving..." required value={skillsForm.skills} onChange={e => setSkillsForm({ ...skillsForm, skills: e.target.value })} style={{ height: '120px', resize: 'none' }}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Process Status</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="skills_status" value="Ongoing" checked={skillsForm.skills_status === 'Ongoing'} onChange={e => setSkillsForm({ ...skillsForm, skills_status: e.target.value })} /> Ongoing
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="skills_status" value="Completed" checked={skillsForm.skills_status === 'Completed'} onChange={e => setSkillsForm({ ...skillsForm, skills_status: e.target.value })} /> Completed
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Skills</button>
                <button type="button" onClick={() => setShowSkillsModal(false)} className="btn" style={{ flex: 1, background: 'hsla(var(--h-surface), 20%, 80%, 0.2)', color: 'var(--text-main)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActivitiesModal && (
        <div className="modal-overlay">
          <div className="card glass modal-content">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Update Extra Activities</h2>
            <form onSubmit={handleUpdateActivities}>
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input className="form-input" type="text" placeholder="S101" required value={activitiesForm.student_id} onChange={e => setActivitiesForm({ ...activitiesForm, student_id: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Accomplishments</label>
                <textarea className="form-input" placeholder="Participated in national level hackathon..." required value={activitiesForm.extra_activities} onChange={e => setActivitiesForm({ ...activitiesForm, extra_activities: e.target.value })} style={{ height: '120px', resize: 'none' }}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Process Status</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="activities_status" value="Ongoing" checked={activitiesForm.activities_status === 'Ongoing'} onChange={e => setActivitiesForm({ ...activitiesForm, activities_status: e.target.value })} /> Ongoing
                  </label>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="activities_status" value="Completed" checked={activitiesForm.activities_status === 'Completed'} onChange={e => setActivitiesForm({ ...activitiesForm, activities_status: e.target.value })} /> Completed
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Record</button>
                <button type="button" onClick={() => setShowActivitiesModal(false)} className="btn" style={{ flex: 1, background: 'hsla(var(--h-surface), 20%, 80%, 0.2)', color: 'var(--text-main)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
