import React from 'react';
import { ArrowLeft, Calendar, Award, BookOpen, ShieldCheck, Check } from 'lucide-react';

const CompetitionDetailView = ({ competition, onBack }) => {
  const { title, description, detailed_description, start_date, end_date, status, prize_pool, rules, eligibility } = competition;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Convert newline-separated string to bulleted array
  const getListItems = (text) => {
    if (!text) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  return (
    <div className="comps-container">
      <div className="detail-nav">
        <button className="back-to-comps" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Competitions
        </button>
      </div>

      <article className="comp-detail">
        <div className="detail-header">
          <div className="detail-title-block">
            <h1>{title}</h1>
            <div className="detail-meta">
              <span className={`status-badge ${status}`}>
                {status === 'active' ? 'Active / Running' : 'Completed'}
              </span>
              <div className="detail-meta-dot" />
              <span>
                <Calendar size={14} style={{ marginRight: '4px' }} />
                Timeline: {formatDate(start_date)} - {formatDate(end_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Prize Cards Row (placed below title header) */}
        {prize_pool && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%', marginBottom: '2.5rem' }}>
            {(() => {
              try {
                const parsed = JSON.parse(prize_pool);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const cardThemes = [
                    { // Gold / 1st
                      tag: '#f59e0b',
                      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07), rgba(245, 158, 11, 0.02))',
                      badge: 'rgba(245, 158, 11, 0.09)',
                      border: 'rgba(245, 158, 11, 0.25)',
                      glow: 'rgba(245, 158, 11, 0.06)'
                    },
                    { // Silver / 2nd
                      tag: '#3b82f6',
                      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.07), rgba(59, 130, 246, 0.02))',
                      badge: 'rgba(59, 130, 246, 0.09)',
                      border: 'rgba(59, 130, 246, 0.25)',
                      glow: 'rgba(59, 130, 246, 0.06)'
                    },
                    { // Bronze / 3rd
                      tag: '#ea580c',
                      bg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.07), rgba(234, 88, 12, 0.02))',
                      badge: 'rgba(234, 88, 12, 0.09)',
                      border: 'rgba(234, 88, 12, 0.25)',
                      glow: 'rgba(234, 88, 12, 0.06)'
                    },
                    { // Purple / 4th+
                      tag: '#8b5cf6',
                      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.07), rgba(139, 92, 246, 0.02))',
                      badge: 'rgba(139, 92, 246, 0.09)',
                      border: 'rgba(139, 92, 246, 0.25)',
                      glow: 'rgba(139, 92, 246, 0.06)'
                    }
                  ];

                  return parsed.map((p, idx) => {
                    const theme = cardThemes[idx] || cardThemes[3];
                    return (
                      <div key={idx} style={{
                        padding: '16px 20px',
                        background: theme.bg,
                        borderRadius: '16px',
                        border: `1px solid ${theme.border}`,
                        boxShadow: `0 8px 16px ${theme.glow}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '200px',
                        flex: '1 1 calc(25% - 16px)',
                        maxWidth: '280px',
                        alignItems: 'flex-start',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = `0 12px 24px ${theme.glow}`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 8px 16px ${theme.glow}`;
                      }}
                      >
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: theme.tag,
                          background: theme.badge,
                          padding: '4px 10px',
                          borderRadius: '100px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🏆 {p.rank}
                        </span>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.45
                        }}>
                          {p.reward}
                        </div>
                      </div>
                    );
                  });
                }
              } catch (e) {}
              return (
                <div className="detail-prize-card">
                  <span className="detail-prize-card-label">Prize Pool</span>
                  <span className="detail-prize-card-value">🏆 {prize_pool}</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* About Section */}
        <section className="detail-section" style={{ marginTop: '2.5rem' }}>
          <h2><BookOpen size={20} /> About the Competition</h2>
          <p>{detailed_description || description}</p>
        </section>

        {/* Eligibility Section */}
        {eligibility && (
          <section className="detail-section">
            <h2><ShieldCheck size={20} /> Eligibility Criteria</h2>
            <ul className="detail-list">
              {getListItems(eligibility).map((item, idx) => (
                <li key={idx}>
                  <Check size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rules & Guidelines */}
        {rules && (
          <section className="detail-section">
            <h2><Award size={20} /> Rules & Guidelines</h2>
            <ul className="detail-list">
              {getListItems(rules).map((item, idx) => (
                <li key={idx}>
                  <Check size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
};

export default CompetitionDetailView;
