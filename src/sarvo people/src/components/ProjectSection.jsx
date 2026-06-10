import React, { useState, useEffect } from 'react';
import { Folder, GitBranch, ExternalLink, Star, MessageSquare, AlertCircle, FileText, CheckCircle, Clock, RefreshCw } from 'lucide-react';

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'E-Commerce Admin Dashboard',
    description: 'Build a secure, modern admin dashboard utilizing React, Chart.js, Express, and PostgreSQL to manage products, orders, and sales analytics.',
    assignedTo: 'Aditya Patil',
    assignedToEmail: 'intern@sarvo.com',
    deadline: '2026-06-25',
    status: 'In Progress', // To Do, In Progress, In Review, Completed
    githubLink: '',
    liveLink: '',
    docText: '',
    rating: 0,
    reviewComments: '',
    aiEvaluation: null
  },
  {
    id: 2,
    title: 'Task Scheduler API Service',
    description: 'Design and build a scalable REST API using Node.js, Express, and Redis to queue email notifications, verify user registration tokens, and execute cron schedules.',
    assignedTo: 'Aditya Patil',
    assignedToEmail: 'intern@sarvo.com',
    deadline: '2026-06-12',
    status: 'In Review',
    githubLink: 'https://github.com/aditya-patil/node-task-scheduler',
    liveLink: 'https://scheduler-api.sarvo.demo',
    docText: 'Implemented redis queue using BullMQ. Added cron schedules for nightly DB backups. Standard JWT validation is in place.',
    rating: 0,
    reviewComments: '',
    aiEvaluation: {
      score: 85,
      codeQuality: 'High',
      securityCheck: 'Passed with minor warnings (JWT expiry should be shorter)',
      scalability: 'Excellent (Uses Redis connection pooler)',
      insights: 'The modular file structure is clean. Strongly recommend adding unit tests for the Redis connector.'
    }
  },
  {
    id: 3,
    title: 'Collaborative Rich Text Editor',
    description: 'Create a real-time collaborative text editor supporting collaborative cursors, Markdown shortcuts, and document sharing using Socket.io and React.',
    assignedTo: 'Aditya Patil',
    assignedToEmail: 'intern@sarvo.com',
    deadline: '2026-07-10',
    status: 'To Do',
    githubLink: '',
    liveLink: '',
    docText: '',
    rating: 0,
    reviewComments: '',
    aiEvaluation: null
  }
];

export default function ProjectSection({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mentor rating/review states
  const [scoreRating, setScoreRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [auditing, setAuditing] = useState(false);

  const isAdminOrMentor = currentUser?.role === 'Admin' || currentUser?.role === 'Reporting Manager';

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('zoho_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('zoho_projects', JSON.stringify(INITIAL_PROJECTS));
    }
  }, []);

  const selectProject = (proj) => {
    setActiveProject(proj);
    setGithubUrl(proj.githubLink || '');
    setLiveUrl(proj.liveLink || '');
    setNotes(proj.docText || '');
    setFeedback(proj.reviewComments || '');
    setScoreRating(proj.rating || 5);
  };

  const handleInternSubmit = (e) => {
    e.preventDefault();
    if (!githubUrl) {
      alert('GitHub Repository Link is required.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const updated = projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            githubLink: githubUrl,
            liveLink: liveUrl,
            docText: notes,
            status: 'In Review',
            // Simulate AI generating evaluation on submit!
            aiEvaluation: {
              score: Math.floor(Math.random() * 21) + 80, // 80 - 100
              codeQuality: 'Good',
              securityCheck: 'Passed',
              scalability: 'Medium',
              insights: 'Code looks highly modular. Found 2 unused packages. Clean styling variable implementations detected.'
            }
          };
        }
        return p;
      });

      setProjects(updated);
      localStorage.setItem('zoho_projects', JSON.stringify(updated));
      
      const matched = updated.find(p => p.id === activeProject.id);
      setActiveProject(matched);
      setSubmitting(false);
      alert('Project submitted for evaluation! AI code check has generated feedback.');
    }, 1200);
  };

  const triggerAICodeAudit = () => {
    if (!activeProject.githubLink) return;
    setAuditing(true);
    setTimeout(() => {
      const updated = projects.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            aiEvaluation: {
              score: Math.floor(Math.random() * 15) + 85, // 85 - 100
              codeQuality: 'Excellent',
              securityCheck: 'Secure (No vulnerable packages found)',
              scalability: 'High (Optimized memory structures)',
              insights: 'AI Code Audit completed. ESLint warnings: 0. Complexity: Low. Good use of modular components.'
            }
          };
        }
        return p;
      });

      setProjects(updated);
      localStorage.setItem('zoho_projects', JSON.stringify(updated));
      const matched = updated.find(p => p.id === activeProject.id);
      setActiveProject(matched);
      setAuditing(false);
    }, 1500);
  };

  const handleMentorReviewSubmit = (e) => {
    e.preventDefault();
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          rating: scoreRating,
          reviewComments: feedback,
          status: 'Completed'
        };
      }
      return p;
    });

    setProjects(updated);
    localStorage.setItem('zoho_projects', JSON.stringify(updated));
    const matched = updated.find(p => p.id === activeProject.id);
    setActiveProject(matched);
    alert('Project rating and review submitted successfully!');
  };

  // Filter projects if Intern (only see their assigned ones)
  const visibleProjects = isAdminOrMentor
    ? projects
    : projects.filter(p => p.assignedToEmail === currentUser?.email);

  return (
    <div className="projects-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Kanban Summary Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {['To Do', 'In Progress', 'In Review', 'Completed'].map(status => {
          const count = visibleProjects.filter(p => p.status === status).length;
          const statusColors = {
            'To Do': { bg: 'var(--primary-bg)', text: 'var(--text-muted)' },
            'In Progress': { bg: 'rgba(0, 123, 245, 0.08)', text: 'var(--active-blue)' },
            'In Review': { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b' },
            'Completed': { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981' }
          };
          return (
            <div key={status} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${statusColors[status].text}` }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{status}</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{count}</h4>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                background: statusColors[status].bg,
                color: statusColors[status].text
              }}>
                Projects
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Left column: List of projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Folder size={18} className="icon-blue" />
              Active Projects ({visibleProjects.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visibleProjects.map(p => {
                const isSelected = activeProject?.id === p.id;
                const statusPills = {
                  'To Do': { bg: 'var(--primary-bg)', text: 'var(--text-muted)' },
                  'In Progress': { bg: 'rgba(0, 123, 245, 0.08)', text: 'var(--active-blue)' },
                  'In Review': { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b' },
                  'Completed': { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981' }
                };
                return (
                  <div
                    key={p.id}
                    onClick={() => selectProject(p)}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(0, 123, 245, 0.03)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: statusPills[p.status].bg,
                        color: statusPills[p.status].text
                      }}>
                        {p.status}
                      </span>
                      {p.rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                          <Star size={11} fill="#f59e0b" /> {p.rating}/5
                        </span>
                      )}
                    </div>
                    
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</h4>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                      {p.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>To: {p.assignedTo}</span>
                      <span>Due: {p.deadline}</span>
                    </div>
                  </div>
                );
              })}
              {visibleProjects.length === 0 && (
                <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  No projects assigned.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Selected Project Workspace */}
        <div>
          {activeProject ? (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{activeProject.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Assigned to: <strong style={{ color: 'var(--text-main)' }}>{activeProject.assignedTo}</strong> | Deadline: {activeProject.deadline}</p>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: activeProject.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'var(--primary-bg)',
                  color: activeProject.status === 'Completed' ? '#10b981' : 'var(--text-muted)'
                }}>
                  {activeProject.status}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Project Description</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>{activeProject.description}</p>
              </div>

              {/* INTERN SUBMISSION BLOCK */}
              {!isAdminOrMentor && (
                <div>
                  {activeProject.status === 'Completed' ? (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.03)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                        <CheckCircle size={16} /> Evaluation Completed
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Your submission has been graded by your mentor.
                      </p>
                      
                      {activeProject.rating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score Rating:</span>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={15} fill={i < activeProject.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                          ))}
                        </div>
                      )}

                      {activeProject.reviewComments && (
                        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <strong>Mentor Feedback:</strong> "{activeProject.reviewComments}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleInternSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Submit Deliverables</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label>GitHub Repository URL *</label>
                          <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'var(--primary-bg)',
                              color: 'var(--text-main)',
                              fontSize: '12.5px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Live Deployment URL</label>
                          <input
                            type="url"
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                            placeholder="https://..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'var(--primary-bg)',
                              color: 'var(--text-main)',
                              fontSize: '12.5px',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label>Documentation / Implementation Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Provide details about challenges faced, tools used, or database structures..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--primary-bg)',
                            color: 'var(--text-main)',
                            fontSize: '12.5px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: '10px 20px',
                          border: 'none',
                          background: 'var(--active-blue)',
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0, 123, 245, 0.2)'
                        }}
                      >
                        {submitting ? 'Uploading deliverables...' : 'Submit Deliverables'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* MENTOR/ADMIN EVALUATION WORKSPACE */}
              {isAdminOrMentor && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Review Deliverables</h4>
                  
                  {activeProject.githubLink ? (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        <a
                          href={activeProject.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'var(--primary-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-main)'
                          }}
                        >
                          <GitBranch size={14} /> Repository Link <ExternalLink size={12} />
                        </a>
                        {activeProject.liveLink && (
                          <a
                            href={activeProject.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              background: 'var(--primary-bg)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-main)'
                            }}
                          >
                            Live URL <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      {activeProject.docText && (
                        <div style={{
                          padding: '14px',
                          background: 'var(--primary-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          fontSize: '12.5px'
                        }}>
                          <strong style={{ color: 'var(--text-main)' }}>Intern Documentation:</strong>
                          <p style={{ marginTop: '4px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{activeProject.docText}</p>
                        </div>
                      )}

                      {/* AI Code Auditor Box */}
                      {activeProject.aiEvaluation ? (
                        <div style={{
                          background: 'rgba(0, 123, 245, 0.03)',
                          border: '1px solid rgba(0, 123, 245, 0.2)',
                          borderRadius: '10px',
                          padding: '16px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--active-blue)', fontSize: '12.5px' }}>AI Code Evaluation Insights</strong>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: 'rgba(0,123,245,0.1)', color: 'var(--active-blue)', borderRadius: '4px' }}>
                              Score: {activeProject.aiEvaluation.score}/100
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>• Code Quality: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeProject.aiEvaluation.codeQuality}</span></div>
                            <div>• Security Audit: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeProject.aiEvaluation.securityCheck}</span></div>
                            <div>• Scalability Rating: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeProject.aiEvaluation.scalability}</span></div>
                            <div style={{ marginTop: '6px', fontStyle: 'italic' }}>"{activeProject.aiEvaluation.insights}"</div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={triggerAICodeAudit}
                          disabled={auditing}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(0,123,245,0.08)',
                            color: 'var(--active-blue)',
                            border: '1px solid rgba(0,123,245,0.2)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '20px'
                          }}
                        >
                          <RefreshCw size={14} className={auditing ? 'anim-spin' : ''} /> {auditing ? 'Running audit...' : 'Trigger AI Code Audit'}
                        </button>
                      )}

                      {/* Mentor Feedback Evaluation Form */}
                      <form onSubmit={handleMentorReviewSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <div className="form-group">
                            <label>Star Rating (1-5)</label>
                            <select
                              value={scoreRating}
                              onChange={(e) => setScoreRating(Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                background: 'var(--primary-bg)',
                                color: 'var(--text-main)',
                                outline: 'none'
                              }}
                            >
                              <option value={5}>5 Stars (Excellent)</option>
                              <option value={4}>4 Stars (Very Good)</option>
                              <option value={3}>3 Stars (Average)</option>
                              <option value={2}>2 Stars (Below Average)</option>
                              <option value={1}>1 Star (Poor)</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Status Update</label>
                            <div style={{ padding: '8px', fontSize: '13px', fontWeight: 600 }}>Will update to: "Completed"</div>
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label>Mentor Feedback / Review Comments</label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Write constructive evaluation notes..."
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              background: 'var(--primary-bg)',
                              color: 'var(--text-main)',
                              fontSize: '12.5px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          style={{
                            padding: '10px 20px',
                            border: 'none',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          Submit Review & Complete Project
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', border: '1px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                      No deliverables submitted yet by the intern.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <Folder size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>No Project Selected</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Select an active project from the sidebar to view requirements and submit deliverables.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
