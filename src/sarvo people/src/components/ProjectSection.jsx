import React, { useState, useEffect } from 'react';
import { Folder, GitBranch, ExternalLink, Star, MessageSquare, AlertCircle, FileText, CheckCircle, Clock, RefreshCw, Plus, Users, Shield, Trash2, X } from 'lucide-react';
import { projectApi } from '../apis/projectApi';
import { employeeApi } from '../apis/employeeApi';
import { cohortApi } from '../apis/cohortApi';

const normalizeProject = (p) => {
  if (!p) return null;
  let displayStatus = 'To Do';
  const dbStatus = (p.status || '').toLowerCase().trim();
  if (dbStatus === 'active' || dbStatus === 'in progress' || dbStatus === 'in_progress') {
    displayStatus = 'In Progress';
  } else if (dbStatus === 'in review' || dbStatus === 'in_review') {
    displayStatus = 'In Review';
  } else if (dbStatus === 'completed' || dbStatus === 'done') {
    displayStatus = 'Completed';
  } else if (dbStatus === 'todo' || dbStatus === 'to do') {
    displayStatus = 'To Do';
  }

  return {
    ...p,
    title: p.title || p.name || 'Untitled Project',
    status: displayStatus,
    assignedTo: p.assignedTo || p.assigned_to_email || 'Development Team',
    deadline: p.deadline || (p.end_date ? new Date(p.end_date).toLocaleDateString() : 'No Deadline'),
    description: p.description || 'No description provided.',
    category: p.category || 'Company Project'
  };
};

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

  // Assignment & Creation States
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('Company Project');
  const [newProjStart, setNewProjStart] = useState('');
  const [newProjEnd, setNewProjEnd] = useState('');

  const [assignmentTab, setAssignmentTab] = useState('employees');
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [tempAssignedMembers, setTempAssignedMembers] = useState([]);
  
  const [allEmployees, setAllEmployees] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const isAdmin = currentUser?.role === 'Admin';
  const isAdminOrMentor = currentUser?.role === 'Admin' || currentUser?.role === 'Reporting Manager' || currentUser?.role === 'admin' || currentUser?.role === 'mentor';

  const loadProjects = async () => {
    try {
      const data = await projectApi.getProjects();
      const normalized = (data || []).map(normalizeProject);
      setProjects(normalized);
      if (activeProject) {
        const updatedActive = normalized.find(p => p.id === activeProject.id);
        if (updatedActive) {
          setActiveProject(updatedActive);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  // Load from database
  useEffect(() => {
    loadProjects();
    
    const loadResources = async () => {
      try {
        const emps = await employeeApi.getEmployees();
        setAllEmployees(emps || []);
        const studs = await cohortApi.getAllStudents();
        setAllStudents(studs || []);
      } catch (err) {
        console.error('Failed to load resource directories:', err);
      }
    };
    loadResources();
  }, []);

  const selectProject = async (proj) => {
    setActiveProject(proj);
    setGithubUrl(proj.githubLink || '');
    setLiveUrl(proj.liveLink || '');
    setNotes(proj.docText || '');
    setFeedback(proj.reviewComments || '');
    setScoreRating(proj.rating || 5);
    try {
      const members = await projectApi.getProjectMembers(proj.id);
      setAssignedMembers(members || []);
      setTempAssignedMembers(members || []);
    } catch (err) {
      console.error('Failed to load project members:', err);
    }
  };

  const handleSaveMembers = async (updatedList) => {
    const membersPayload = updatedList.map(m => ({
      employeeId: m.employeeId || m.employee_id,
      studentId: m.studentId || m.student_id,
      role: m.role
    }));
    try {
      await projectApi.assignProjectMembers(activeProject.id, membersPayload);
      const refreshed = await projectApi.getProjectMembers(activeProject.id);
      setAssignedMembers(refreshed || []);
      setTempAssignedMembers(refreshed || []);
    } catch (err) {
      alert('Failed to save assignments: ' + err.message);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName) return;
    try {
      await projectApi.createProject({
        name: newProjName,
        description: newProjDesc,
        category: newProjCategory,
        startDate: newProjStart || null,
        endDate: newProjEnd || null
      });
      alert('Project created successfully!');
      setIsCreateDrawerOpen(false);
      setNewProjName('');
      setNewProjDesc('');
      setNewProjCategory('Company Project');
      setNewProjStart('');
      setNewProjEnd('');
      await loadProjects();
    } catch (err) {
      alert('Failed to create project: ' + err.message);
    }
  };

  const handleInternSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) {
      alert('GitHub Repository Link is required.');
      return;
    }

    setSubmitting(true);
    try {
      await projectApi.submitProject({
        projectId: activeProject.id,
        githubLink: githubUrl,
        liveLink: liveUrl,
        docText: notes
      });
      await loadProjects();
      setSubmitting(false);
      alert('Project submitted for evaluation! AI code check has generated feedback.');
    } catch (err) {
      setSubmitting(false);
      alert(err.message || 'Submission failed');
    }
  };

  const triggerAICodeAudit = async () => {
    if (!activeProject.githubLink) return;
    setAuditing(true);
    try {
      // The backend submit auto-audits, but we can call submit again to re-trigger audit
      await projectApi.submitProject({
        projectId: activeProject.id,
        githubLink: activeProject.githubLink,
        liveLink: activeProject.liveLink,
        docText: activeProject.docText
      });
      await loadProjects();
      setAuditing(false);
    } catch (err) {
      setAuditing(false);
      alert('Audit failed');
    }
  };

  const handleMentorReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectApi.reviewProject({
        projectId: activeProject.id,
        rating: scoreRating,
        reviewComments: feedback
      });
      await loadProjects();
      alert('Project rating and review submitted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  // Filter projects if Intern (only see their assigned ones)
  const visibleProjects = isAdminOrMentor
    ? projects
    : projects.filter(p => p.assignedToEmail === currentUser?.email);

  useEffect(() => {
    if (visibleProjects.length > 0) {
      const isStillVisible = activeProject && visibleProjects.some(p => p.id === activeProject.id);
      if (!isStillVisible) {
        selectProject(visibleProjects[0]);
      }
    } else if (projects.length > 0) {
      setActiveProject(null);
      setAssignedMembers([]);
      setTempAssignedMembers([]);
    }
  }, [projects, currentUser, activeProject, isAdminOrMentor]);

  const renderWorkspaceContent = () => {
    if (!activeProject) {
      return (
        <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Folder size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>No Project Selected</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Select an active project from the sidebar to view requirements and submit deliverables.</p>
        </div>
      );
    }

    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{activeProject.title}</h3>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                Category: <strong style={{ color: 'var(--text-main)', marginRight: '16px' }}>{activeProject.category || 'Company Project'}</strong>
                Deadline: <strong style={{ color: 'var(--text-main)' }}>{activeProject.deadline}</strong>
              </div>
              {assignedMembers.length > 0 && (
                <div>
                  Team: <strong style={{ color: 'var(--text-main)' }}>
                    {assignedMembers.map(m => m.employee_first_name ? `${m.employee_first_name} ${m.employee_last_name}` : `${m.student_first_name} ${m.student_last_name}`).join(', ')}
                  </strong>
                </div>
              )}
            </div>
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
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val && !/^https?:\/\//i.test(val)) {
                          setGithubUrl(`https://${val}`);
                        }
                      }}
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
                      type="text"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val && !/^https?:\/\//i.test(val)) {
                          setLiveUrl(`https://${val}`);
                        }
                      }}
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
              <div style={{ background: 'var(--primary-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>GITHUB REPOSITORY</span>
                    <a href={activeProject.githubLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--active-blue)', textDecoration: 'none', fontWeight: 700, marginTop: '2px' }}>
                      <GitBranch size={14} /> View Repository
                    </a>
                  </div>
                  {activeProject.liveLink && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LIVE DEPLOYMENT</span>
                      <a href={activeProject.liveLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#10b981', textDecoration: 'none', fontWeight: 700, marginTop: '2px' }}>
                        <ExternalLink size={14} /> View Deployment
                      </a>
                    </div>
                  )}
                </div>

                {activeProject.docText && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>INTERN IMPLEMENTATION NOTES</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'pre-line' }}>{activeProject.docText}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--primary-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)', marginBottom: '20px' }}>
                <AlertCircle size={28} style={{ color: 'var(--border-color)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', margin: 0 }}>No deliverables submitted yet by the intern.</p>
              </div>
            )}

            <form onSubmit={handleMentorReviewSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>Score Evaluation Rating:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setScoreRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={20} fill={star <= scoreRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Review & Evaluation Comments</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide review feedback or suggestions for the intern..."
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
                disabled={auditing}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'var(--active-blue)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                {auditing ? 'Submitting evaluation...' : 'Complete Evaluation'}
              </button>
            </form>
          </div>
        )}

        {/* MEMBER ASSIGNMENT PANEL */}
        {isAdminOrMentor && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '24px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} /> Manage Project Assignment
            </h4>

            {/* Mentors / Admins Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                Assign Mentors / Admins
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--primary-bg)' }}>
                {allEmployees.filter(emp => emp.role === 'Admin' || emp.role === 'Reporting Manager').map(emp => {
                  const isAssigned = tempAssignedMembers.some(m => (m.employee_id === emp.id || m.employeeId === emp.id) && (m.role === 'Mentor' || m.role === 'Admin'));
                  return (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', background: isAssigned ? 'rgba(0,123,245,0.08)' : 'var(--card-bg)', border: `1px solid ${isAssigned ? 'var(--active-blue)' : 'var(--border-color)'}`, borderRadius: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempAssignedMembers([...tempAssignedMembers, { employee_id: emp.id, employeeId: emp.id, role: emp.role === 'Admin' ? 'Admin' : 'Mentor' }]);
                          } else {
                            setTempAssignedMembers(tempAssignedMembers.filter(m => m.employee_id !== emp.id && m.employeeId !== emp.id));
                          }
                        }}
                      />
                      {emp.first_name} {emp.last_name} ({emp.role})
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Team Members Assignment: Employees and Students */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                Assign Team Members
              </label>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAssignmentTab('employees')}
                  style={{
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: assignmentTab === 'employees' ? '2px solid var(--active-blue)' : 'none',
                    color: assignmentTab === 'employees' ? 'var(--active-blue)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Employees
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentTab('students')}
                  style={{
                    padding: '6px 12px',
                    background: 'none',
                    border: 'none',
                    borderBottom: assignmentTab === 'students' ? '2px solid var(--active-blue)' : 'none',
                    color: assignmentTab === 'students' ? 'var(--active-blue)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Students (Current Batch)
                </button>
              </div>

              {assignmentTab === 'employees' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--primary-bg)' }}>
                  {allEmployees.filter(emp => emp.role !== 'Admin' && emp.role !== 'Reporting Manager').map(emp => {
                    const isAssigned = tempAssignedMembers.some(m => (m.employee_id === emp.id || m.employeeId === emp.id) && m.role === 'Member');
                    return (
                      <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', background: isAssigned ? 'rgba(0,123,245,0.08)' : 'var(--card-bg)', border: `1px solid ${isAssigned ? 'var(--active-blue)' : 'var(--border-color)'}`, borderRadius: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempAssignedMembers([...tempAssignedMembers, { employee_id: emp.id, employeeId: emp.id, role: 'Member' }]);
                            } else {
                              setTempAssignedMembers(tempAssignedMembers.filter(m => m.employee_id !== emp.id && m.employeeId !== emp.id));
                            }
                          }}
                        />
                        {emp.first_name} {emp.last_name}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--primary-bg)' }}>
                  {allStudents.filter(stud => stud.status === 'active').map(stud => {
                    const isAssigned = tempAssignedMembers.some(m => m.student_id === stud.id || m.studentId === stud.id);
                    return (
                      <label key={stud.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px', background: isAssigned ? 'rgba(0,123,245,0.08)' : 'var(--card-bg)', border: `1px solid ${isAssigned ? 'var(--active-blue)' : 'var(--border-color)'}`, borderRadius: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempAssignedMembers([...tempAssignedMembers, { student_id: stud.id, studentId: stud.id, role: 'Student' }]);
                            } else {
                              setTempAssignedMembers(tempAssignedMembers.filter(m => m.student_id !== stud.id && m.studentId !== stud.id));
                            }
                          }}
                        />
                        {stud.first_name} {stud.last_name} ({stud.cohort_name || 'No Batch'})
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assign Confirmation Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => handleSaveMembers(tempAssignedMembers)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--active-blue)',
                  color: 'white',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 123, 245, 0.2)'
                }}
              >
                <CheckCircle size={14} /> Assign Members
              </button>
            </div>

            {/* Assigned Members Summary & Table */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Assigned Personnel ({assignedMembers.length})
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {[
                    assignedMembers.filter(m => m.role === 'Admin').length > 0 && `${assignedMembers.filter(m => m.role === 'Admin').length} Admin(s)`,
                    assignedMembers.filter(m => m.role === 'Mentor').length > 0 && `${assignedMembers.filter(m => m.role === 'Mentor').length} Mentor(s)`,
                    assignedMembers.filter(m => m.role === 'Member').length > 0 && `${assignedMembers.filter(m => m.role === 'Member').length} Employee(s)`,
                    assignedMembers.filter(m => m.role === 'Student').length > 0 && `${assignedMembers.filter(m => m.role === 'Student').length} Student(s)`
                  ].filter(Boolean).join(' | ')}
                </span>
              </div>

              {assignedMembers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--primary-bg)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  No personnel assigned yet. Use the toggles above and confirm assignments.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>Role Type</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>Designation</th>
                        <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedMembers.map(m => {
                        const isStudent = !!m.student_id;
                        const name = isStudent 
                          ? `${m.student_first_name} ${m.student_last_name}` 
                          : `${m.employee_first_name} ${m.employee_last_name}`;
                        const email = isStudent ? m.student_email : m.employee_email;
                        
                        let typeBadgeColor = 'var(--active-blue)';
                        let typeBg = 'rgba(0, 123, 245, 0.08)';
                        if (m.role === 'Admin') {
                          typeBadgeColor = '#ef4444';
                          typeBg = 'rgba(239, 68, 68, 0.08)';
                        } else if (m.role === 'Mentor') {
                          typeBadgeColor = '#f59e0b';
                          typeBg = 'rgba(245, 158, 11, 0.08)';
                        } else if (isStudent) {
                          typeBadgeColor = '#8b5cf6';
                          typeBg = 'rgba(139, 92, 246, 0.08)';
                        }

                        return (
                          <tr key={m.id || `${m.employee_id || m.student_id}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                              <div>{name}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 400 }}>{email}</div>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                color: typeBadgeColor,
                                background: typeBg,
                                textTransform: 'uppercase'
                              }}>
                                {isStudent ? 'Student' : 'Employee'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {m.role}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = assignedMembers.filter(item => {
                                    if (item.employee_id && m.employee_id) return item.employee_id !== m.employee_id;
                                    if (item.student_id && m.student_id) return item.student_id !== m.student_id;
                                    return item.id !== m.id;
                                  });
                                  handleSaveMembers(updated);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {isAdminOrMentor ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* Left column: List of projects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Folder size={18} className="icon-blue" />
                  Active Projects ({visibleProjects.length})
                </h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsCreateDrawerOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--active-blue)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 123, 245, 0.2)'
                    }}
                  >
                    <Plus size={12} /> Add Project
                  </button>
                )}
              </div>

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
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            background: statusPills[p.status]?.bg || 'var(--primary-bg)',
                            color: statusPills[p.status]?.text || 'var(--text-muted)'
                          }}>
                            {p.status}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            background: p.category === 'Company Project' ? 'rgba(0, 123, 245, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                            color: p.category === 'Company Project' ? 'var(--active-blue)' : '#8b5cf6'
                          }}>
                            {p.category || 'Company Project'}
                          </span>
                        </div>
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
            {renderWorkspaceContent()}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top row: Horizontal list of projects in one line */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Folder size={18} className="icon-blue" />
              My Projects ({visibleProjects.length})
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '16px', 
              overflowX: 'auto', 
              padding: '4px 4px 16px 4px', 
              scrollbarWidth: 'thin',
              msOverflowStyle: 'none'
            }}>
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
                      flex: '0 0 320px', // Keep them side by side in one line
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(0, 123, 245, 0.03)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 123, 245, 0.06)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: statusPills[p.status]?.bg || 'var(--primary-bg)',
                          color: statusPills[p.status]?.text || 'var(--text-muted)'
                        }}>
                          {p.status}
                        </span>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: p.category === 'Company Project' ? 'rgba(0, 123, 245, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                          color: p.category === 'Company Project' ? 'var(--active-blue)' : '#8b5cf6'
                        }}>
                          {p.category || 'Company Project'}
                        </span>
                      </div>
                      {p.rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                          <Star size={11} fill="#f59e0b" /> {p.rating}/5
                        </span>
                      )}
                    </div>
                    
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{p.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginTop: '6px', lineHeight: '1.4' }}>
                      {p.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span>To: {p.assignedTo}</span>
                      <span>Due: {p.deadline}</span>
                    </div>
                  </div>
                );
              })}
              {visibleProjects.length === 0 && (
                <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>
                  No projects assigned.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Area: Selected Project Workspace */}
          <div>
            {renderWorkspaceContent()}
          </div>
        </div>
      )}

      {/* Create Project Drawer */}
      {isCreateDrawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setIsCreateDrawerOpen(false)}>
          <div className="admin-drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-drawer-header">
              <h3>Create New Project</h3>
              <button className="admin-drawer-close" onClick={() => setIsCreateDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="admin-drawer-body">
              <div className="admin-form-group">
                <label>Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Supabase DB Integration"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select value={newProjCategory} onChange={(e) => setNewProjCategory(e.target.value)} required>
                  <option value="Company Project">Company Project</option>
                  <option value="Students Project">Students Project</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  placeholder="Provide brief details about the project requirements..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newProjStart}
                    onChange={(e) => setNewProjStart(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newProjEnd}
                    onChange={(e) => setNewProjEnd(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'none' }}>
                <button type="submit" id="proj-submit-hidden">Submit</button>
              </div>
            </form>

            <div className="admin-drawer-footer">
              <button type="button" className="btn-drawer-cancel" onClick={() => setIsCreateDrawerOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-drawer-submit"
                onClick={() => document.getElementById('proj-submit-hidden').click()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
