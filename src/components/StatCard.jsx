import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendType, color, onClick }) {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'var(--status-admitted-text)';
    if (trendType === 'negative') return 'var(--status-closed-text)';
    return 'var(--text-light)';
  };

  const getTrendBg = () => {
    if (trendType === 'positive') return 'var(--status-admitted-bg)';
    if (trendType === 'negative') return 'var(--status-closed-bg)';
    return 'var(--border)';
  };

  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {title}
        </span>
        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
          {value}
        </span>
        {trend && (
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: getTrendColor(),
            backgroundColor: getTrendBg(),
            padding: '2px 8px',
            borderRadius: '12px',
            alignSelf: 'flex-start',
            marginTop: '4px'
          }}>
            {trend}
          </span>
        )}
      </div>

      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        backgroundColor: color ? `${color}15` : 'var(--primary-light)',
        color: color || 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {Icon && <Icon size={26} />}
      </div>
    </div>
  );
}
