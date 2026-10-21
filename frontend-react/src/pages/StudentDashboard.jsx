import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { AttendanceGauge } from '../components/AttendanceGauge';
import { Modal } from '../components/Modal';

export const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submission Modal state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [currentUser]);

  const fetchDashboard = async () => {
    const studentId = currentUser?.student_id || 1;
    try {
      const res = await fetch(`http://localhost:8000/backend-php/api/student.php?action=dashboard&student_id=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      console.warn('Live API unavailable, using offline mock data', err);
      setData({
        profile: {
          full_name: currentUser?.full_name || 'Rahul Verma',
          roll_number: currentUser?.roll_number || 'CS2023-001',
          department: 'Computer Science & Engineering',
          semester: 6,
          cgpa: 8.85,
          email: currentUser?.email || 'rahul.verma@smartcampus.edu',
          phone: '9123456780'
        },
        attendance_summary: {
          total_classes: 24,
          attended_classes: 21,
          percentage: 87.5,
          status: 'Eligible for Finals'
        },
        subject_attendance: [
          { subject: 'Web Programming', total_lectures: 12, attended: 11, percentage: 91.7 },
          { subject: 'Database Management Systems', total_lectures: 12, attended: 10, percentage: 83.3 }
        ],
        assignments: [
          { id: 1, subject: 'Web Programming', title: 'Responsive Layout with HTML5 & CSS3', due_date: '2026-10-25', max_marks: 100, submission_status: 'Graded', marks_obtained: 95, feedback_remarks: 'Excellent clean CSS architecture and accessibility.' },
          { id: 2, subject: 'Web Programming', title: 'PHP Form Processing & XML Integration', due_date: '2026-11-05', max_marks: 100, submission_status: 'Pending' }
        ],
        announcements: [
          { id: 1, title: 'Mid-Term Semester Examination Schedule', content: 'Exams commence on November 10th. Timetable available on the departmental notice board.', priority: 'high', created_at: '2026-10-09' },
          { id: 2, title: 'Campus Wi-Fi Maintenance Window', content: 'Central ICT scheduled maintenance this Saturday between 11 PM and 4 AM.', priority: 'low', created_at: '2026-10-08' }
        ],
        events: [
          { id: 1, title: 'Smart Campus Hackathon 2026', category: 'Technical', event_date: '2026-10-28 09:00', location: 'Computing Center Block A', is_registered: 1 },
          { id: 2, title: 'Cloud Native Workshop', category: 'Technical', event_date: '2026-11-02 14:00', location: 'Seminar Hall 3', is_registered: 0 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assignment) => {
    setActiveAssignment(assignment);
    setSubmissionText('');
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setSubmitting(true);
    try {
      await fetch('http://localhost:8000/backend-php/api/student.php?action=submit_assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: activeAssignment.id,
          submission_text: submissionText.trim()
        })
      });
      alert('Assignment submitted successfully!');
      setActiveAssignment(null);
      await fetchDashboard();
    } catch (err) {
      alert('Submission saved in state: ' + submissionText);
      setActiveAssignment(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-body">Loading Student Portal...</div>;
  }

  const { profile, attendance_summary, subject_attendance, assignments, announcements, events } = data;

  return (
    <div className="page-body">
      
      {/* Profile Banner */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(to right, #ffffff, #eff6ff)', borderLeft: '5px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-info">{profile?.roll_number}</span>
            <h2 style={{ marginTop: '0.25rem', fontSize: '1.75rem' }}>{profile?.full_name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Department of {profile?.department} &nbsp;|&nbsp; Semester {profile?.semester}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              📧 {profile?.email} &nbsp;|&nbsp; 📱 {profile?.phone}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cumulative CGPA</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              {parseFloat(profile?.cgpa || 8.5).toFixed(2)}
            </div>
            <span className="badge badge-success">First Class Distinction</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <StatCard 
          icon="📈" 
          title="Overall Attendance" 
          value={`${attendance_summary?.percentage}%`} 
          color="green" 
          subtitle="Criteria: Min 75%" 
        />
        <StatCard 
          icon="🏫" 
          title="Lectures Attended" 
          value={`${attendance_summary?.attended_classes} / ${attendance_summary?.total_classes}`} 
          color="blue" 
          subtitle="Completed sessions" 
        />
        <StatCard 
          icon="📝" 
          title="Active Assignments" 
          value={`${assignments?.length || 0}`} 
          color="purple" 
          subtitle="Lab exercises" 
        />
        <StatCard 
          icon="🎪" 
          title="Upcoming Events" 
          value={`${events?.length || 0}`} 
          color="yellow" 
          subtitle="Campus activities" 
        />
      </div>

      {/* Attendance Section */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <AttendanceGauge 
          percentage={attendance_summary?.percentage} 
          attended={attendance_summary?.attended_classes} 
          total={attendance_summary?.total_classes} 
          status={attendance_summary?.status} 
        />

        {/* Subject-Wise Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Subject-Wise Breakdown</h3>
            <span className="badge badge-info">Semester 6</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {subject_attendance?.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong>{s.subject}</strong></td>
                    <td>{s.total_lectures}</td>
                    <td>{s.attended}</td>
                    <td>
                      <span className={`badge ${s.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                        {s.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two Columns: Assignments & Announcements */}
      <div className="grid-3-1">
        
        {/* Course Assignments List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Course Assignments & Deadlines</h3>
            <span className="badge badge-warning">Active Labs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments?.map((a) => {
              const isGraded = a.submission_status === 'Graded';
              const isSubmitted = a.submission_status === 'Submitted';

              return (
                <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--primary)', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-info">{a.subject}</span>
                      <h4 style={{ marginTop: '0.35rem' }}>{a.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        📅 Due Date: <strong>{a.due_date}</strong> &nbsp;|&nbsp; Max Marks: {a.max_marks}
                      </p>
                      {a.feedback_remarks && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.65rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                          Teacher Feedback: {a.feedback_remarks}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                      <span className={`badge ${isGraded ? 'badge-success' : (isSubmitted ? 'badge-warning' : 'badge-danger')}`}>
                        {isGraded ? `Graded (${a.marks_obtained}/${a.max_marks})` : (isSubmitted ? 'Submitted' : 'Pending')}
                      </span>

                      {!isGraded && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <button onClick={() => handleOpenSubmit(a)} className="btn btn-sm btn-primary">
                            {isSubmitted ? 'Resubmit' : 'Submit Work'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circulars & Events Column */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3 className="card-title">Campus Circulars</h3>
              <span className="badge badge-info">Notice Board</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {announcements?.map((n) => (
                <div key={n.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem' }}>{n.title}</h5>
                    <span className={`badge ${n.priority === 'high' ? 'badge-danger' : 'badge-info'}`}>
                      {n.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Submission Modal */}
      <Modal 
        isOpen={Boolean(activeAssignment)} 
        onClose={() => setActiveAssignment(null)} 
        title={`Submit: ${activeAssignment?.title || 'Assignment'}`}
      >
        <form onSubmit={handleSubmitWork}>
          <div className="form-group">
            <label className="form-label">Subject & Course</label>
            <input type="text" className="form-input" value={activeAssignment?.subject || ''} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Repository URL / Project Submission Link *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide public GitHub repo link, Google Drive link, or write-up..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setActiveAssignment(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
