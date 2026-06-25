import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, Calendar, DollarSign, Send, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { jobApi } from '../apis/jobApi';

export default function PlacementSection({ currentUser }) {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [applying, setApplying] = useState(false);

  const isAdminOrMentor = currentUser?.role === 'Admin' || currentUser?.role === 'Reporting Manager' || currentUser?.role === 'admin' || currentUser?.role === 'mentor';

  const loadJobsAndApps = async () => {
    try {
      const jobsData = await jobApi.getJobs();
      let appsData = [];
      try {
        appsData = await jobApi.getApplications();
      } catch (e) {
        // Not logged in or unauthorized
      }
      
      const mappedJobs = jobsData.map(j => {
        // Find if current user applied (matches by email)
        const userApp = appsData.find(a => 
          Number(a.job_id) === Number(j.id) && 
          a.email.toLowerCase() === currentUser?.email?.toLowerCase()
        );

        // For Admin, show the first application details so they can perform updates
        const anyApp = appsData.find(a => Number(a.job_id) === Number(j.id));
        const activeApp = isAdminOrMentor ? anyApp : userApp;

        return {
          id: j.id,
          applicationId: activeApp ? activeApp.id : null,
          company: 'Sarvo Technologies',
          role: j.title,
          location: j.location || 'Pune (On-site)',
          salary: j.salary_range || '₹6.5 - ₹8.0 LPA',
          skills: j.skills || ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
          description: j.description,
          applied: !!userApp,
          status: activeApp ? activeApp.status : '',
          interviewDate: activeApp ? activeApp.interview_date : null
        };
      });

      setJobs(mappedJobs);
      if (mappedJobs.length > 0) {
        // Retain selection if valid
        const prevActive = activeJob ? mappedJobs.find(mj => mj.id === activeJob.id) : null;
        setActiveJob(prevActive || mappedJobs[0]);
      }
    } catch (err) {
      console.error('Failed to load job listings:', err);
    }
  };

  useEffect(() => {
    loadJobsAndApps();
  }, [currentUser]);

  const selectJob = (job) => {
    setActiveJob(job);
  };

  const handleApply = async (jobId) => {
    setApplying(true);
    try {
      const names = currentUser?.name ? currentUser.name.split(' ') : ['New', 'Intern'];
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || 'User';

      await jobApi.applyForJob(jobId, {
        firstName,
        lastName,
        email: currentUser?.email || 'intern@sarvo.com',
        phone: currentUser?.phone || '9999999999',
        resumeUrl: 'https://sarvo.com/resumes/default.pdf',
        coverLetter: 'Applied via Sarvo HRMS'
      });
      await loadJobsAndApps();
      setApplying(false);
      alert('Application submitted successfully!');
    } catch (err) {
      setApplying(false);
      alert(err.message || 'Application failed');
    }
  };

  // Status handler for Admin / Mentor to schedule interview
  const handleScheduleInterview = async (jobId, dateStr) => {
    if (!activeJob?.applicationId) {
      alert('No application found to schedule interview for.');
      return;
    }
    try {
      await jobApi.updateApplicationStatus(activeJob.applicationId, 'Interview Scheduled', dateStr);
      await loadJobsAndApps();
      alert('Interview scheduled on ' + dateStr);
    } catch (err) {
      alert(err.message || 'Failed to schedule interview');
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    if (!activeJob?.applicationId) {
      alert('No application found to update status.');
      return;
    }
    try {
      await jobApi.updateApplicationStatus(activeJob.applicationId, newStatus, null);
      await loadJobsAndApps();
      alert('Application status updated to: ' + newStatus);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="placements-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Placements Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Partnerships</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>24 Companies</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Active recruitment partners</p>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placement Rate</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>84.5%</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>84 out of 100 interns placed</p>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highest Package</span>
          <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--active-blue)', marginTop: '4px' }}>₹12.5 LPA</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Secured by Web Dev Intern</p>
        </div>
      </div>

      {/* Test eligibility notice for students */}
      {!isAdminOrMentor && (
        <div style={{
          background: 'rgba(0, 123, 245, 0.05)',
          border: '1px solid rgba(0, 123, 245, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--active-blue)' }}>📋 Placement Aptitude & Course Assessments</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Please complete all mandatory tests and quizzes to remain eligible for active recruitment.
            </p>
          </div>
          <button
            onClick={() => {
              alert('Please select "LMS Study" from the left sidebar to access your courses and start your assessments/quizzes!');
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--active-blue)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Go to LMS Study
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Left Side: Job listings list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Briefcase size={18} className="icon-blue" />
              Job Openings ({jobs.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs.map(job => {
                const isSelected = activeJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => selectJob(job)}
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
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)' }}>{job.company}</span>
                      {job.applied && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          background: job.status === 'Interview Scheduled' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                          color: job.status === 'Interview Scheduled' ? '#f59e0b' : '#10b981'
                        }}>
                          {job.status}
                        </span>
                      )}
                    </div>
                    
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>{job.role}</h4>
                    
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={12} /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><DollarSign size={12} /> {job.salary}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                      {job.skills.map(skill => (
                        <span key={skill} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--primary-bg)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Job Requirements & Admin slots */}
        <div>
          {activeJob ? (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{activeJob.role}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--active-blue)', fontWeight: 600, marginTop: '4px' }}>
                      <Building size={14} /> {activeJob.company}
                    </div>
                  </div>

                  {!isAdminOrMentor && (
                    <button
                      onClick={() => handleApply(activeJob.id)}
                      disabled={activeJob.applied || applying}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        background: activeJob.applied ? '#10b981' : 'var(--active-blue)',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12.5px',
                        cursor: activeJob.applied ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(0, 123, 245, 0.15)'
                      }}
                    >
                      {activeJob.applied ? (
                        <><CheckCircle2 size={14} /> Applied</>
                      ) : applying ? (
                        'Submitting...'
                      ) : (
                        <><Send size={14} /> Quick Apply</>
                      )}
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px', background: 'var(--primary-bg)', padding: '12px', borderRadius: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Location</span>
                    <strong style={{ color: 'var(--text-main)' }}>{activeJob.location}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Salary Package</span>
                    <strong style={{ color: 'var(--text-main)' }}>{activeJob.salary}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Application Status</span>
                    <strong style={{ color: activeJob.applied ? 'var(--active-blue)' : 'var(--text-muted)' }}>
                      {activeJob.applied ? activeJob.status : 'Not Applied'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Job Description</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>{activeJob.description}</p>
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Key Technical Skills Required</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {activeJob.skills.map(s => (
                    <span key={s} style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--primary-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* INTERVIEW DETAIL PANEL */}
              {activeJob.applied && activeJob.status === 'Interview Scheduled' && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.03)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '13.5px', fontWeight: 700 }}>
                    <Calendar size={16} /> Technical Interview Scheduled
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    An online technical panel interview has been scheduled for this application.
                  </p>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Time: {activeJob.interviewDate}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Meeting link will be shared in-app 15 minutes prior to the slot.
                  </div>
                </div>
              )}

              {/* ADMIN ACTIONS: SCHEDULE & UPDATE PIPELINE */}
              {isAdminOrMentor && activeJob.applied && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Recruitment Coordinator Control Panel</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label>Set Interview Date/Time</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleScheduleInterview(activeJob.id, '2026-06-18 at 02:30 PM')}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--primary-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--text-main)'
                          }}
                        >
                          June 18, 2:30 PM
                        </button>
                        <button
                          onClick={() => handleScheduleInterview(activeJob.id, '2026-06-20 at 11:00 AM')}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--primary-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--text-main)'
                          }}
                        >
                          June 20, 11:00 AM
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Pipeline Stage Action</label>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleStatusUpdate(activeJob.id, 'Offered')}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(16, 185, 129, 0.08)',
                            color: '#10b981',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Extend Offer
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(activeJob.id, 'Rejected')}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reject App
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <Briefcase size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>No Opening Selected</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Select a job listing on the left to see company description, packages, requirements, and apply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
