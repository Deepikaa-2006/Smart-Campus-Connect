import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role || 'student';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['student', 'faculty', 'admin'] },
    { id: 'events', label: 'College Events', icon: '🎪', roles: ['student', 'faculty', 'admin'] },
    { id: 'feedback', label: 'Feedback & Grievances', icon: '💬', roles: ['student', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ height: '70px', display: 'flex', alignItems: 'center', paddingInline: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>
          <span>🎓</span>
          <span>Smart Campus</span>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', paddingInline: '0.75rem', marginBottom: '0.25rem' }}>
          Portal Navigation ({role.toUpperCase()})
        </span>

        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (setIsOpen) setIsOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === item.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === item.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === item.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              borderLeft: activeTab === item.id ? '4px solid var(--primary)' : '4px solid transparent'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('switch-account')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'switch-account' ? 'var(--primary-light)' : 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <span>🔄</span>
            <span>Switch Role / Login</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
        <button onClick={logout} className="btn btn-sm btn-secondary btn-block">
          Log Out
        </button>
      </div>
    </aside>
  );
};
