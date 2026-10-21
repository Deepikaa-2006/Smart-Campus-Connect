import React from 'react';

export const StatCard = ({ title, value, icon, color = 'blue', subtitle }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-details" style={{ flex: 1 }}>
        <div className="value">{value}</div>
        <div className="label">{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</div>}
      </div>
    </div>
  );
};
