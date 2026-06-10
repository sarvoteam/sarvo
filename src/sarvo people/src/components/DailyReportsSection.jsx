import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, FileText, Plus, X, MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';

const INITIAL_REPORTS = [
  {
    id: 1,
    date: '2026-06-09',
    internName: 'Aditya Patil',
    internEmail: 'intern@sarvo.com',
    hoursWorked: 8.5,
    summary: 'Completed integration of AuthSection component. Styled register cards with responsive grid systems. Added local storage validations.',
    challenges: 'Framer motion initial transition layout was blocking element inputs. Handled by adjusting z-index priorities.',
    mentorFeedback: 'Excellent progress! The styling layout is highly professional. Please align z-index parameters globally.',
    reviewed: true
  },
  {
    id: 2,
    date: '2026-06-08',
    internName: 'Aditya Patil',
    internEmail: 'intern@sarvo.com',
    hoursWorked: 7.0,
    summary: 'Created first outline for LMS course registry. Styled interactive quizzes dashboards, question timers, and answer sheets.',
    challenges: 'None.',
    mentorFeedback: '',
    reviewed: false
  }
];

export default function DailyReportsSection({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [formHours, setFormHours] = useState('8.0');
  const [formSummary, setFormSummary] = useState('');
  const [formChallenges, setFormChallenges] = useState('');

  // Mentor Review States
  const [activeReport, setActiveReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const isAdminOrMentor = currentUser?.role === 'Admin' || currentUser?.role === 'Reporting Manager';

  // Load reports
  useEffect(() => {
    const saved = localStorage.getItem('zoho_daily_reports');
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      setReports(INITIAL_REPORTS);
      localStorage.setItem('zoho_daily_reports', JSON.stringify(INITIAL_REPORTS));
    }
  }, []);

  const handleInternSubmit = (e) => {
    e.preventDefault();
    if (!formHours || !formSummary) return;

    setSubmitting(true);
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        internName: currentUser.name,
        internEmail: currentUser.email,
        hoursWorked: Number(formHours),
        summary: formSummary,
        challenges: formChallenges || 'None.',
        mentorFeedback: '',
        reviewed: false
      };

      const updated = [newReport, ...reports];
      setReports(updated);
      localStorage.setItem('zoho_daily_reports', JSON.stringify(updated));

      // Reset
      setIsModalOpen(false);
      setFormHours('8.0');
      setFormSummary('');
      setFormChallenges('');
      setSubmitting(false);
      alert('Daily report submitted successfully!');
    }, 800);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const updated = reports.map(r => {
      if (r.id === activeReport.id) {
        return {
          ...r,
          reviewed: true,
          mentorFeedback: feedbackText
        };
      }
      return r;
    });

    setReports(updated);
    localStorage.setItem('zoho_daily_reports', JSON.stringify(updated));
    alert('Feedback submitted successfully!');
    setActiveReport(null);
    setFeedbackText('');
  };

  const visibleReports = isAdminOrMentor
    ? reports
    : reports.filter(r => r.internEmail === currentUser?.email);

  return (
    <div className="daily-reports-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Daily Work Logs</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Log hours worked, summaries of accomplishments, and address challenges.</p>
        </div>

        {!isAdminOrMentor && (
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--active-blue)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 10px rgba(0, 123, 245, 0.15)'
            }}
          >
            <Plus size={15} /> Log Work
          </button>
        )}
      </div>

      {/* Reports Listing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdminOrMentor && activeReport ? '1.2fr 1fr' : '1fr', gap: '20px' }}>
        
        {/* Timeline List of reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {visibleReports.map(report => (
            <div key={report.id} className="card" style={{ padding: '16px', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderLeft: report.reviewed ? '4px solid #10b981' : '4px solid #f59e0b' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--active-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {report.date}
                  </span>
                  
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {report.hoursWorked} Hours
                  </span>
                </div>

                {isAdminOrMentor && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: 700, marginBottom: '6px' }}>
                    Intern: {report.internName} ({report.internEmail})
                  </div>
                )}

                <div style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '8px' }}>
                  <strong>Summary:</strong> {report.summary}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Challenges:</strong> {report.challenges}
                </div>

                {report.mentorFeedback ? (
                  <div style={{ marginTop: '12px', padding: '10px', background: 'var(--primary-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong>Feedback:</strong> "{report.mentorFeedback}"
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#f59e0b', fontStyle: 'italic' }}>
                    Awaiting mentor review
                  </div>
                )}
              </div>

              {/* Admin/Mentor review action */}
              {isAdminOrMentor && !report.reviewed && (
                <div style={{ alignSelf: 'center', marginLeft: '16px' }}>
                  <button
                    onClick={() => { setActiveReport(report); setFeedbackText(report.mentorFeedback || ''); }}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(245,158,11,0.08)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {visibleReports.length === 0 && (
            <div style={{ padding: '40px', border: '1px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No daily reports logged yet.
            </div>
          )}
        </div>

        {/* Mentor feedback editor panel */}
        {isAdminOrMentor && activeReport && (
          <div className="card animate-fade-in" style={{ padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Review Intern Log</h4>
              <button onClick={() => setActiveReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={15} /></button>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'left' }}>
              <div>Intern: <strong>{activeReport.internName}</strong></div>
              <div>Date: {activeReport.date} | Hours: {activeReport.hoursWorked}</div>
              <div style={{ marginTop: '8px', padding: '8px', background: 'var(--primary-bg)', borderRadius: '6px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                "{activeReport.summary}"
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Mentor Feedback Comments *</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter evaluation remarks or help for code struggles..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    outline: 'none',
                    marginTop: '4px'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Approve & Submit Feedback
              </button>
            </form>
          </div>
        )}

      </div>

      {/* INTERN SUBMIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Submit Work Log</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInternSubmit} className="modal-form">
              <div className="form-group">
                <label>Hours Worked *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Accomplishments / Work Summary *</label>
                <textarea
                  placeholder="Summarize what files you worked on, milestones achieved..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Challenges / Obstacles Faced</label>
                <textarea
                  placeholder="Any logic blockades, package issues, or design ambiguities..."
                  value={formChallenges}
                  onChange={(e) => setFormChallenges(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-submit">
                  {submitting ? 'Submitting Log...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
