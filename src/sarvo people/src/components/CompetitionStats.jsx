import React from 'react';
import { Trophy, CheckCircle, Clock } from 'lucide-react';

const CompetitionStats = ({ competitions }) => {
  const total = competitions.length;
  const active = competitions.filter((c) => c.status === 'active').length;
  const completed = competitions.filter((c) => c.status === 'completed').length;

  const stats = [
    {
      label: 'Total Competitions',
      value: total,
      icon: Trophy,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Active Events',
      value: active,
      icon: Clock,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Completed Events',
      value: completed,
      icon: CheckCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: stat.bg,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
                {stat.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompetitionStats;
