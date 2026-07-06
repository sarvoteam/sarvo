import React from 'react';
import { Edit2, Trash2, Calendar, Users, CreditCard, Award, CheckCircle, IndianRupee } from 'lucide-react';

const CompetitionTable = ({ competitions, onEdit, onDelete, onRowClick }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFee = (paise) => {
    if (!paise || paise === 0) return null; // null = free
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const parsePrizePool = (raw) => {
    if (!raw) return null;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr[0].reward; // top prize
    } catch (_) {}
    return typeof raw === 'string' ? raw : null;
  };

  const th = {
    padding: '14px 20px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
              <th style={th}>Title</th>
              <th style={th}>Status</th>
              <th style={th}>Timeline</th>
              <th style={{ ...th, textAlign: 'center' }}>Registered</th>
              <th style={{ ...th, textAlign: 'center' }}>Paid</th>
              <th style={th}>Fee</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.length > 0 ? (
              competitions.map((comp) => {
                const fee = formatFee(comp.registration_fee);
                const regCount = comp.registration_count ?? 0;
                const paidCount = comp.paid_count ?? 0;

                return (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease',
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.03)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={(e) => {
                      if (e.target.closest('button')) return;
                      if (onRowClick) onRowClick(comp);
                    }}
                  >
                    {/* Title & Description */}
                    <td style={{ padding: '14px 20px', minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{comp.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comp.description}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: comp.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: comp.status === 'active' ? '#10b981' : '#ef4444',
                        border: comp.status === 'active' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                      }}>
                        {comp.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} />
                        <span>{formatDate(comp.start_date)} — {formatDate(comp.end_date)}</span>
                      </div>
                    </td>

                    {/* Registered Count */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'rgba(59,130,246,0.08)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          color: '#3b82f6',
                          borderRadius: '50px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          <Users size={11} /> {regCount}
                        </span>
                        {regCount > 0 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>students</span>
                        )}
                      </div>
                    </td>

                    {/* Paid Count */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      {paidCount > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            color: '#10b981',
                            borderRadius: '50px',
                            padding: '3px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}>
                            <CheckCircle size={11} /> {paidCount}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>paid</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Fee */}
                    <td style={{ padding: '14px 20px' }}>
                      {fee ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.25)',
                          color: '#d97706',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          <IndianRupee size={11} />{fee.replace('₹', '')}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#10b981',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          Free
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={() => onEdit(comp)}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', transition: 'background 0.15s' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                          title="Edit Competition"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(comp.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', transition: 'background 0.15s' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                          title="Delete Competition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
