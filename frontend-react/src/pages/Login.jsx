import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(username, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Smart Campus Connect</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>React Interactive Portal Dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or College Email</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rahul_v or admin"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
            ⚡ 1-Click Demo Accounts (Password@123)
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="button" onClick={() => setDemoAccount('rahul_v', 'Password@123')} className="btn btn-sm btn-secondary">
              👨‍🎓 Student: Rahul Verma (CS2023-001)
            </button>
            <button type="button" onClick={() => setDemoAccount('prof_sharma', 'Password@123')} className="btn btn-sm btn-secondary">
              👩‍🏫 Faculty: Prof. Rajesh Sharma
            </button>
            <button type="button" onClick={() => setDemoAccount('admin', 'Password@123')} className="btn btn-sm btn-secondary">
              🏛️ Administrator: Principal Dr. Kumar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
