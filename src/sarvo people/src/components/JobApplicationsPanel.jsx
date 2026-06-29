import React, { useState, useEffect } from 'react';
import { Briefcase, Mail, Phone, Calendar, CheckCircle2, Clock, AlertCircle, X, Search, FileText, ExternalLink } from 'lucide-react';
import { jobApi } from '../apis/jobApi';

export default function JobApplicationsPanel() {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await jobApi.getApplications();
      setApplications(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to load job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (appId, status, intDate = null) => {
    setUpdatingId(appId);
    try {
      await jobApi.updateApplicationStatus(appId, status, intDate);
      await fetchApplications();
      alert(`Application status updated to "${status}" successfully!`);
      setShowScheduleModal(false);
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const fullName = `${app.first_name} ${app.last_name}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.phone && app.phone.includes(query)) ||
      (app.job_title && app.job_title.toLowerCase().includes(query))
    );
  });

  const getStatusBadgeColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'hired' || s === 'placed') return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981', label: 'Hired' };
    if (s === 'selected') return { bg: 'rgba(139, 92, 246, 0.08)', text: '#8b5cf6', label: 'Selected' };
    if (s === 'interview scheduled' || s === 'interview') return { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', label: 'Interview' };
    if (s === 'rejected') return { bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', label: 'Rejected' };
    return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', label: 'Applied' };
  };

  return (
    <div style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Job Applications</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review candidate applications, schedule interviews, and manage the talent funnel.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Candidates</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{applications.length}</h4>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interviews Pending</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {applications.filter(a => a.status === 'Interview Scheduled').length}
          </h4>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Offers Extended</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
            {applications.filter(a => a.status === 'selected').length}
          </h4>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Successful Placements</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {applications.filter(a => a.status === 'placed' || a.status === 'hired').length}
          </h4>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-bg)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search candidates by name, email, phone, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid var(--border-color)', borderTopColor: 'var(--active-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' }} />
            Loading applications...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
            {error}
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No job applications found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--primary-bg)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Job / Dept</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Links</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Applied On</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => {
                  const badge = getStatusBadgeColor(app.status);
                  const isUpdating = updatingId === app.id;
                  
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div><strong>{app.first_name} {app.last_name}</strong></div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {app.email}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {app.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div><strong>{app.job_title}</strong></div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{app.department_name || 'General'}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
                          {app.resume_url && (
                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--active-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <FileText size={12} /> View Resume
                            </a>
                          )}
                          {app.linkedin_url && (
                            <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0072b1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <ExternalLink size={12} /> LinkedIn
                            </a>
                          )}
                          {app.portfolio_url && (
                            <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <ExternalLink size={12} /> Portfolio
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, backgroundColor: badge.bg, color: badge.text, textTransform: 'capitalize' }}>
                          {badge.label}
                        </span>
                        {app.status === 'Interview Scheduled' && app.interview_date && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
                            Date: {app.interview_date}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {app.status !== 'Interview Scheduled' && app.status !== 'placed' && app.status !== 'hired' && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setInterviewDate('');
                                setShowScheduleModal(true);
                              }}
                              disabled={isUpdating}
                              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Schedule
                            </button>
                          )}
                          {app.status !== 'selected' && app.status !== 'placed' && app.status !== 'hired' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'selected')}
                              disabled={isUpdating}
                              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', border: 'none', color: '#8b5cf6', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Select
                            </button>
                          )}
                          {app.status !== 'placed' && app.status !== 'hired' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'placed')}
                              disabled={isUpdating}
                              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', border: 'none', color: '#10b981', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Hire
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              disabled={isUpdating}
                              style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interview Schedule Modal */}
      {showScheduleModal && selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setShowScheduleModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Schedule Interview</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Schedule interview for <strong>{selectedApp.first_name} {selectedApp.last_name}</strong> for the <strong>{selectedApp.job_title}</strong> role.
            </p>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Interview Date/Time</label>
              <input
                type="text"
                placeholder="e.g. 2026-06-25 at 02:30 PM"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--primary-bg)', color: 'var(--text-main)', marginTop: '4px', fontSize: '12.5px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowScheduleModal(false)} style={{ padding: '8px 16px', border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-main)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedApp.id, 'Interview Scheduled', interviewDate)}
                disabled={!interviewDate.trim()}
                style={{ padding: '8px 16px', background: 'var(--active-blue)', border: 'none', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
