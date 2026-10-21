import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title = 'Campus Portal', onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onToggleSidebar}
          style={{ 
            display: 'none', 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer' 
          }}
          className="mobile-toggle"
        >
          ☰
        </button>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {currentUser ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {currentUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </div>
              </div>
            </div>

            <button onClick={logout} className="btn btn-sm btn-secondary">
              Sign Out
            </button>
          </>
        ) : (
          <span className="badge badge-info">Guest Mode</span>
        )}
      </div>
    </header>
  );
};
