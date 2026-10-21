import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_students: 4,
    total_faculty: 2,
    total_courses: 3,
    total_events: 4,
    avg_attendance: 87.5,
    pending_feedback: 1
  });

  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // Add Student Modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '', roll: '', username: '', email: '', dept: 'Computer Science & Engineering', sem: 6, cgpa: 8.5
  });

  // Announcement Form
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceRole, setAnnounceRole] = useState('all');
  const [announcePriority, setAnnouncePriority] = useState('medium');

  useEffect(() => {
    fetchStats();
    fetchStudents();
    fetchFaculty();
    fetchFeedback();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/admin.php?action=stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (e) {
      // fallback in place
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/admin.php?action=students');
      const json = await res.json();
      if (json.success) setStudents(json.data);
    } catch (e) {
      setStudents([
        { student_id: 1, roll_number: 'CS2023-001', full_name: 'Rahul Verma', email: 'rahul.verma@smartcampus.edu', department: 'Computer Science & Engineering', semester: 6, cgpa: 8.85 },
        { student_id: 2, roll_number: 'CS2023-002', full_name: 'Priya Sharma', email: 'priya.sharma@smartcampus.edu', department: 'Computer Science & Engineering', semester: 6, cgpa: 9.15 },
        { student_id: 3, roll_number: 'CS2023-003', full_name: 'Arjun Mehta', email: 'arjun.mehta@smartcampus.edu', department: 'Computer Science & Engineering', semester: 6, cgpa: 7.90 },
        { student_id: 4, roll_number: 'CS2023-004', full_name: 'Sneha Reddy', email: 'sneha.reddy@smartcampus.edu', department: 'Computer Science & Engineering', semester: 6, cgpa: 8.40 }
      ]);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/admin.php?action=faculty');
      const json = await res.json();
      if (json.success) setFaculty(json.data);
    } catch (e) {
      setFaculty([
        { faculty_id: 1, employee_id: 'FAC-CS-101', full_name: 'Prof. Rajesh Sharma', email: 'sharma@smartcampus.edu', department: 'Computer Science & Engineering', designation: 'Associate Professor' },
        { faculty_id: 2, employee_id: 'FAC-CS-102', full_name: 'Dr. Anita Deshmukh', email: 'anita.deshmukh@smartcampus.edu', department: 'Computer Science & Engineering', designation: 'Assistant Professor' }
      ]);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/feedback.php?action=list&role=admin');
      const json = await res.json();
      if (json.success) setFeedback(json.data);
    } catch (e) {
      setFeedback([
        { id: 1, category: 'Infrastructure', subject: 'Lab 3 power sockets', message: 'Laptops run out of charge during practicals.', status: 'Resolved', student_name: 'Rahul Verma', roll_number: 'CS2023-001', admin_response: '12 new modular sockets will be installed this Saturday.' },
        { id: 3, category: 'Canteen', subject: 'More healthy lunch options', message: 'Requesting millet and fruit salads in cafeteria.', status: 'Pending', student_name: 'Arjun Mehta', roll_number: 'CS2023-003' }
      ]);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const payload = {
      full_name: studentForm.name,
      roll_number: studentForm.roll,
      username: studentForm.username,
      email: studentForm.email,
      department: studentForm.dept,
      semester: parseInt(studentForm.sem, 10),
      cgpa: parseFloat(studentForm.cgpa)
    };

    try {
      await fetch('http://localhost:8000/backend-php/api/admin.php?action=add_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Student created successfully!');
    } catch (err) {
      alert('Student created in state: ' + studentForm.name);
      setStudents(prev => [...prev, { ...payload, student_id: Date.now() }]);
    } finally {
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', roll: '', username: '', email: '', dept: 'Computer Science & Engineering', sem: 6, cgpa: 8.5 });
      await fetchStudents();
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Delete student record for "${name}"?`)) return;
    try {
      await fetch('http://localhost:8000/backend-php/api/admin.php?action=delete_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: id })
      });
    } catch (e) {}
    setStudents(prev => prev.filter(s => s.student_id !== id));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/backend-php/api/announcements.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announceTitle,
          content: announceContent,
          target_role: announceRole,
          priority: announcePriority
        })
      });
      alert('Circular broadcasted to campus!');
    } catch (err) {
      alert('Circular broadcasted in state: ' + announceTitle);
    } finally {
      setAnnounceTitle('');
      setAnnounceContent('');
    }
  };

  const handleResolveFeedback = async (id) => {
    const res = prompt('Enter administrative response notes:');
    if (!res) return;

    try {
      await fetch('http://localhost:8000/backend-php/api/feedback.php?action=respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_id: id,
          admin_response: res,
          status: 'Resolved'
        })
      });
    } catch (e) {}
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: 'Resolved', admin_response: res } : f));
  };

  return (
    <div className="page-body">
      
      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard icon="👨‍🎓" title="Enrolled Students" value={stats.total_students} color="blue" subtitle="Undergraduates" />
        <StatCard icon="👩‍🏫" title="Faculty Members" value={stats.total_faculty} color="green" subtitle="All Departments" />
        <StatCard icon="📊" title="Campus Attendance Avg" value={`${stats.avg_attendance}%`} color="purple" subtitle="Active Semester" />
        <StatCard icon="💬" title="Pending Grievances" value={stats.pending_feedback} color="red" subtitle="Action Needed" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('students')} className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}>
          👨‍🎓 Manage Students
        </button>
        <button onClick={() => setActiveTab('faculty')} className={`btn ${activeTab === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}>
          👩‍🏫 Manage Faculty
        </button>
        <button onClick={() => setActiveTab('circulars')} className={`btn ${activeTab === 'circulars' ? 'btn-primary' : 'btn-secondary'}`}>
          📢 Broadcast Circular
        </button>
        <button onClick={() => setActiveTab('grievances')} className={`btn ${activeTab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}>
          💬 Grievances & Feedback
        </button>
      </div>

      {/* TAB 1: Students */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="card-header">
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.25rem' }}>Unit 4 & 8: Student Records CRUD</span>
              <h3 className="card-title">Enrolled Students Directory</h3>
            </div>
            <button onClick={() => setIsAddStudentOpen(true)} className="btn btn-primary">
              + Add New Student
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Sem</th>
                  <th>CGPA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.student_id}>
                    <td><strong>{s.roll_number}</strong></td>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.department}</td>
                    <td>Sem {s.semester}</td>
                    <td><span className="badge badge-info">{parseFloat(s.cgpa || 8.0).toFixed(2)}</span></td>
                    <td>
                      <button onClick={() => handleDeleteStudent(s.student_id, s.full_name)} className="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Faculty */}
      {activeTab === 'faculty' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Faculty Records Directory</h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map(f => (
                  <tr key={f.faculty_id}>
                    <td><strong>{f.employee_id}</strong></td>
                    <td>{f.full_name}</td>
                    <td>{f.email}</td>
                    <td>{f.department}</td>
                    <td>{f.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Circulars */}
      {activeTab === 'circulars' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <div className="card-header">
            <h3 className="card-title">Broadcast Official Circular</h3>
          </div>

          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Circular Title *</label>
              <input type="text" className="form-input" placeholder="e.g. End Semester Practical Examination Timetable" value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} required />
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select className="form-select" value={announceRole} onChange={(e) => setAnnounceRole(e.target.value)}>
                  <option value="all">Everyone (Students & Faculty)</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={announcePriority} onChange={(e) => setAnnouncePriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High / Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Circular Message *</label>
              <textarea className="form-textarea" rows={4} placeholder="Type official notification body..." value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary">
              📢 Broadcast Circular
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Grievances */}
      {activeTab === 'grievances' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Grievances & Administrative Resolution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {feedback.map(f => (
              <div key={f.id} className="card" style={{ borderLeft: `4px solid ${f.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info">{f.category}</span>
                    <span className={`badge ${f.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '0.5rem' }}>
                      {f.status}
                    </span>
                    <h4 style={{ marginTop: '0.35rem' }}>{f.subject}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{f.message}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Student: <strong>{f.student_name} ({f.roll_number})</strong>
                    </p>
                    {f.admin_response && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
                        Admin Action: {f.admin_response}
                      </div>
                    )}
                  </div>

                  <div>
                    {f.status !== 'Resolved' && (
                      <button onClick={() => handleResolveFeedback(f.id)} className="btn btn-sm btn-primary">
                        Resolve & Respond
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title="Add Student Record">
        <form onSubmit={handleAddStudent}>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input type="text" className="form-input" placeholder="e.g. CS2023-010" value={studentForm.roll} onChange={(e) => setStudentForm({ ...studentForm, roll: e.target.value })} required />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input type="text" className="form-input" value={studentForm.username} onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={studentForm.dept} onChange={(e) => setStudentForm({ ...studentForm, dept: e.target.value })}>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-select" value={studentForm.sem} onChange={(e) => setStudentForm({ ...studentForm, sem: e.target.value })}>
                <option value={1}>Sem 1</option>
                <option value={6}>Sem 6</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddStudentOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Student Account
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
