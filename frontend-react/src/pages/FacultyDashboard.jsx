import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

export const FacultyDashboard = () => {
  const { currentUser } = useAuth();

  // Attendance Sheet state
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(6);
  const [subject, setSubject] = useState('Web Programming');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Assignment states
  const [assignments, setAssignments] = useState([]);
  const [isCreateAssignOpen, setIsCreateAssignOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().substring(0, 10);
  });
  const [newMaxMarks, setNewMaxMarks] = useState(100);

  useEffect(() => {
    fetchRoster();
    fetchAssignments();
  }, [department, semester]);

  const fetchRoster = async () => {
    try {
      const res = await fetch(`http://localhost:8000/backend-php/api/attendance.php?action=students&department=${encodeURIComponent(department)}&semester=${semester}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data);
        const initRecs = {};
        json.data.forEach(s => {
          initRecs[s.student_id] = { status: 'Present', remarks: '' };
        });
        setAttendanceRecords(initRecs);
      }
    } catch (err) {
      // Mock fallback
      const mockStudents = [
        { student_id: 1, roll_number: 'CS2023-001', full_name: 'Rahul Verma' },
        { student_id: 2, roll_number: 'CS2023-002', full_name: 'Priya Sharma' },
        { student_id: 3, roll_number: 'CS2023-003', full_name: 'Arjun Mehta' },
        { student_id: 4, roll_number: 'CS2023-004', full_name: 'Sneha Reddy' }
      ];
      setStudents(mockStudents);
      const initRecs = {};
      mockStudents.forEach(s => {
        initRecs[s.student_id] = { status: 'Present', remarks: '' };
      });
      setAttendanceRecords(initRecs);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:8000/backend-php/api/assignments.php?action=list');
      const json = await res.json();
      if (json.success) {
        setAssignments(json.data);
      }
    } catch (err) {
      setAssignments([
        { id: 1, subject: 'Web Programming', title: 'Responsive Layout with HTML5 & CSS3', due_date: '2026-10-25', max_marks: 100, total_submissions: 2 },
        { id: 2, subject: 'Web Programming', title: 'PHP Form Processing & XML Integration', due_date: '2026-11-05', max_marks: 100, total_submissions: 0 }
      ]);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.student_id] = { ...attendanceRecords[s.student_id], status: 'Present' };
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    const payload = {
      subject,
      attendance_date: attendanceDate,
      records: Object.keys(attendanceRecords).map(sid => ({
        student_id: parseInt(sid, 10),
        status: attendanceRecords[sid].status,
        remarks: attendanceRecords[sid].remarks
      }))
    };

    try {
      await fetch('http://localhost:8000/backend-php/api/attendance.php?action=mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert(`Attendance recorded for ${students.length} students in ${subject}!`);
    } catch (err) {
      alert(`Attendance saved in component state for ${subject} on ${attendanceDate}!`);
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const payload = {
      subject,
      title: newTitle,
      description: newDesc,
      due_date: newDueDate,
      max_marks: parseInt(newMaxMarks, 10)
    };

    try {
      await fetch('http://localhost:8000/backend-php/api/assignments.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Assignment published successfully!');
    } catch (err) {
      alert('Assignment published in state: ' + newTitle);
      setAssignments(prev => [...prev, { ...payload, id: Date.now(), total_submissions: 0 }]);
    } finally {
      setIsCreateAssignOpen(false);
      setNewTitle('');
      setNewDesc('');
      await fetchAssignments();
    }
  };

  return (
    <div className="page-body">
      
      {/* Attendance Management */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <span className="badge badge-success" style={{ marginBottom: '0.25rem' }}>Unit 3 & 4: Faculty Module</span>
            <h3 className="card-title">Mark Class Attendance</h3>
          </div>
          <button onClick={markAllPresent} className="btn btn-sm btn-secondary">
            ✓ Mark All Present
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Semester</label>
            <select className="form-select" value={semester} onChange={(e) => setSemester(parseInt(e.target.value, 10))}>
              <option value={6}>Semester 6</option>
              <option value={4}>Semester 4</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject *</label>
            <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Attendance Date *</label>
            <input type="date" className="form-input" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
          </div>
        </div>

        {/* Roster Table */}
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const rec = attendanceRecords[s.student_id] || { status: 'Present', remarks: '' };
                return (
                  <tr key={s.student_id}>
                    <td>{idx + 1}</td>
                    <td><strong>{s.roll_number}</strong></td>
                    <td>{s.full_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {['Present', 'Absent', 'Late'].map(st => (
                          <label key={st} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="radio"
                              name={`status_${s.student_id}`}
                              checked={rec.status === st}
                              onChange={() => handleStatusChange(s.student_id, st)}
                            />
                            <span style={{ fontWeight: 600, color: st === 'Present' ? 'var(--success)' : (st === 'Absent' ? 'var(--danger)' : 'var(--warning)') }}>
                              {st}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional remarks"
                        value={rec.remarks}
                        onChange={(e) => handleRemarkChange(s.student_id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.825rem' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSaveAttendance} disabled={savingAttendance} className="btn btn-success" style={{ padding: '0.65rem 1.8rem' }}>
            {savingAttendance ? 'Saving Attendance...' : '💾 Save Attendance Batch'}
          </button>
        </div>
      </div>

      {/* Assignment Management */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="badge badge-warning" style={{ marginBottom: '0.25rem' }}>Lab Work & Grading</span>
            <h3 className="card-title">Manage Course Assignments</h3>
          </div>
          <button onClick={() => setIsCreateAssignOpen(true)} className="btn btn-primary">
            + Post New Assignment
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-info">{a.subject}</span>
                  <h4 style={{ marginTop: '0.35rem' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    📅 Due Date: <strong>{a.due_date}</strong> &nbsp;|&nbsp; Max Marks: {a.max_marks}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-warning">{a.total_submissions || 0} Submissions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal isOpen={isCreateAssignOpen} onClose={() => setIsCreateAssignOpen(false)} title="Create New Course Assignment">
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input type="text" className="form-input" placeholder="e.g. Lab Project: React Dashboard" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Instructions *</label>
            <textarea className="form-textarea" rows={3} placeholder="Provide instructions and rubric..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required />
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input type="date" className="form-input" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Max Marks *</label>
              <input type="number" className="form-input" value={newMaxMarks} onChange={(e) => setNewMaxMarks(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateAssignOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
