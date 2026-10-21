import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const EventsPage = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const fetchEvents = async () => {
    try {
      const catParam = category !== 'All' ? `&category=${encodeURIComponent(category)}` : '';
      const sid = currentUser?.student_id || 1;
      const res = await fetch(`http://localhost:8000/backend-php/api/events.php?action=list&student_id=${sid}${catParam}`);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (err) {
      setEvents([
        { id: 1, title: 'Smart Campus Hackathon 2026', category: 'Technical', event_date: '2026-10-28 09:00:00', location: 'Computing Center Block A', description: '24-hour inter-departmental coding hackathon focusing on Campus Innovation.', max_participants: 120, registered_count: 45, is_registered: 1 },
        { id: 2, title: 'Cloud Native Workshop', category: 'Technical', event_date: '2026-11-02 14:00:00', location: 'Seminar Hall 3', description: 'Hands-on session with industry experts on Docker and Kubernetes.', max_participants: 80, registered_count: 28, is_registered: 0 },
        { id: 3, title: 'Tarang 2026 - Annual Cultural Fest', category: 'Cultural', event_date: '2026-11-15 17:00:00', location: 'College Main Amphitheater', description: 'Annual cultural festival with musical nights, dance battles, and dramatics.', max_participants: 500, registered_count: 150, is_registered: 0 },
        { id: 4, title: 'Inter-College Sports Meet', category: 'Sports', event_date: '2026-11-20 08:30:00', location: 'College Sports Complex', description: 'Football, Basketball, Cricket, and Athletics championship.', max_participants: 300, registered_count: 85, is_registered: 0 }
      ]);
    }
  };

  const handleToggleReg = async (eventId, isRegistered) => {
    const action = isRegistered ? 'unregister' : 'register';
    const sid = currentUser?.student_id || 1;

    try {
      await fetch(`http://localhost:8000/backend-php/api/events.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, student_id: sid })
      });
    } catch (e) {}

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          is_registered: isRegistered ? 0 : 1,
          registered_count: isRegistered ? e.registered_count - 1 : e.registered_count + 1
        };
      }
      return e;
    }));
  };

  const filteredEvents = events.filter(e => {
    const matchCat = category === 'All' || e.category === category;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Unit 3 & 4: College Events</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Campus Events & Activities</h1>
        <p style={{ color: 'var(--text-muted)' }}>Discover hackathons, seminars, sports, and cultural festivals.</p>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Technical', 'Cultural', 'Sports'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {filteredEvents.map(e => (
          <div key={e.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-info">{e.category}</span>
              <span className="badge badge-success">{e.registered_count} / {e.max_participants} Enrolled</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{e.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem' }}>
              {e.description}
            </p>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <div>📅 <strong>Date:</strong> {e.event_date}</div>
              <div>📍 <strong>Venue:</strong> {e.location}</div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {e.is_registered ? (
                <button onClick={() => handleToggleReg(e.id, true)} className="btn btn-block btn-secondary">
                  ✓ Registered (Cancel)
                </button>
              ) : (
                <button onClick={() => handleToggleReg(e.id, false)} className="btn btn-block btn-primary">
                  Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
