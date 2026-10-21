import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const [category, setCategory] = useState('Infrastructure');
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const sid = currentUser?.student_id || 1;
    try {
      const res = await fetch(`http://localhost:8000/backend-php/api/feedback.php?action=list&role=student&student_id=${sid}`);
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch (e) {
      setHistory([
        { id: 1, category: 'Infrastructure', subject: 'Lab 3 power sockets', message: 'Laptops run out of charge during practicals.', status: 'Resolved', rating: 4, admin_response: '12 new modular sockets will be installed this Saturday.' }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const sid = currentUser?.student_id || 1;

    const payload = {
      student_id: sid,
      category,
      rating,
      subject,
      message
    };

    try {
      await fetch('http://localhost:8000/backend-php/api/feedback.php?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Feedback submitted to administration!');
    } catch (err) {
      alert('Feedback submitted in component state!');
      setHistory(prev => [{ ...payload, id: Date.now(), status: 'Pending' }, ...prev]);
    } finally {
      setSubmitting(false);
      setSubject('');
      setMessage('');
      setRating(5);
      await fetchHistory();
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Unit 3 & 4: Grievance Resolution</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Student Feedback & Grievances</h1>
        <p style={{ color: 'var(--text-muted)' }}>Direct channel for student suggestions and grievance redressal.</p>
      </div>

      <div className="grid-2">
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Submit Feedback / Suggestion</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Academics">Academics & Faculty</option>
                <option value="Infrastructure">Campus Infrastructure & Labs</option>
                <option value="Library">Library & Reading Rooms</option>
                <option value="Canteen">Cafeteria & Food Services</option>
                <option value="General">General Campus Governance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Satisfaction Rating</label>
              <div style={{ display: 'flex', gap: '0.35rem', fontSize: '1.75rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.5rem', alignSelf: 'center' }}>
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief summary of your grievance or recommendation..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Details *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Please describe the issue clearly with context..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
              {submitting ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Grievance History & Status</h3>
            <span className="badge badge-success">Tracking</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map(item => (
              <div key={item.id} className="card" style={{ borderLeft: `4px solid ${item.status === 'Resolved' ? 'var(--success)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-info">{item.category}</span>
                    <span className={`badge ${item.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '0.5rem' }}>
                      {item.status}
                    </span>
                    <h4 style={{ marginTop: '0.35rem' }}>{item.subject}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.message}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Rating: {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </p>
                    {item.admin_response && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
                        Admin Resolution: {item.admin_response}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
