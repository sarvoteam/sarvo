import React from 'react';
import { Edit2, Trash2, Calendar, Award } from 'lucide-react';

const CompetitionTable = ({ competitions, onEdit, onDelete, onRowClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'var(--card-shadow)',
      width: '100%'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.02)'
            }}>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)' }}>Timeline</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.length > 0 ? (
              competitions.map((comp) => (
                <tr key={comp.id} style={{
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.2s ease',
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(e) => {
                  if (e.target.closest('button')) return;
                  if (onRowClick) onRowClick(comp);
                }}
                >
                  {/* Title & Description preview */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{comp.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comp.description}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: comp.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: comp.status === 'active' ? '#10b981' : '#ef4444',
                      border: comp.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      {comp.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>

                  {/* Date timeline */}
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{formatDate(comp.start_date)} - {formatDate(comp.end_date)}</span>
                    </div>
                  </td>



                  {/* Action buttons */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button
                        onClick={() => onEdit(comp)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="Edit Competition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(comp.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="Delete Competition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No competitions configured yet. Click "Add Competition" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitionTable;
