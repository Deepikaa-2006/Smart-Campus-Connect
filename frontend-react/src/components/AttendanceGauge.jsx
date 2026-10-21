import React from 'react';

export const AttendanceGauge = ({ percentage = 85, attended = 21, total = 24, status = 'Eligible' }) => {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const colorClass = pct >= 75 ? 'var(--success)' : (pct >= 65 ? 'var(--warning)' : 'var(--danger)');
  const badgeClass = pct >= 75 ? 'badge-success' : (pct >= 65 ? 'badge-warning' : 'badge-danger');

  return (
    <div className="card" style={{ borderLeft: `5px solid ${colorClass}` }}>
      <div className="card-header">
        <h3 className="card-title">Attendance Gauge & Metric</h3>
        <span className={`badge ${badgeClass}`}>{status}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: colorClass }}>
            {pct}%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Attended {attended} of {total} scheduled lectures
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Threshold</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>75.0%</div>
        </div>
      </div>

      <div className="progress-container">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${pct}%`, 
            background: colorClass 
          }} 
        />
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        {pct >= 75 
          ? '✓ You meet the mandatory university attendance requirement for semester examinations.'
          : '⚠ Warning: Your attendance has dropped below 75%. Meet with your course instructor.'}
      </p>
    </div>
  );
};
