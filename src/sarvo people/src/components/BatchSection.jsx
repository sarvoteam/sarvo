import React, { useState, useEffect } from 'react';
import { Users, User, Calendar, Plus, X, FolderMinus, Sparkles, BookOpen, Check } from 'lucide-react';
import { cohortApi } from '../../../apis/cohortApi';

const INITIAL_BATCHES = [
  {
    id: 1,
    name: 'Summer Full-Stack BootCamp 2026',
    mentorName: 'Aditya Patil',
    mentorEmail: 'mentor@sarvo.com',
    startDate: '2026-06-01',
    progress: 75,
    studentsCount: 1,
    description: 'Core training program focusing on React/Node/PostgreSQL stack development, server deployment, and scaling.'
  },
  {
    id: 2,
    name: 'UI/UX Design Studio Batch A',
    mentorName: 'Chetan Ghanghav',
    mentorEmail: 'chetan@sarvo.com',
    startDate: '2026-06-05',
    progress: 30,
    studentsCount: 0,
    description: 'Interactive workshop on typography, visual balance, grid styles, auto-layouts, and Figma vector tools.'
  }
];

export default function BatchSection({ currentUser }) {
  const [batches, setBatches] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Roster lists for selectors
  const [availableInterns, setAvailableInterns] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [selectedInterns, setSelectedInterns] = useState([]);

  // Form States
  const [formName, setFormName] = useState('');
  const [formMentor, setFormMentor] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const isAdmin = currentUser?.role === 'Admin';

  const mapCohort = (c) => ({
    id: c.id,
    name: c.name,
    mentorName: c.mentor_name || 'Unassigned',
    mentorEmail: c.mentor_email || '',
    startDate: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : '',
    progress: c.progress || 0,
    studentsCount: c.students_count || 0,
    description: c.description
  });

  const loadData = async () => {
    try {
      // Load batches
      const data = await cohortApi.getCohorts();
      if (data && data.length > 0) {
        setBatches(data.map(mapCohort));
      } else {
        setBatches([]);
      }

      // Load available interns
      const interns = await cohortApi.getAvailableInterns();
      const mappedInterns = interns.map(i => ({
        id: i.id,
        name: `${i.first_name} ${i.last_name}`,
        email: i.email
      }));
      setAvailableInterns(mappedInterns);

      // Load available mentors
      const mentors = await cohortApi.getAvailableMentors();
      const mappedMentors = mentors.map(m => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        email: m.email
      }));
      setAvailableMentors(mappedMentors);
      if (mappedMentors.length > 0) {
        setFormMentor(mappedMentors[0].id);
      }
    } catch (err) {
      console.error('Failed to load cohort data:', err);
    }
  };

  // Load batches and interns from database
  useEffect(() => {
    loadData();
  }, []);

  const handleToggleInternSelection = (internEmail) => {
    if (selectedInterns.includes(internEmail)) {
      setSelectedInterns(selectedInterns.filter(e => e !== internEmail));
    } else {
      setSelectedInterns([...selectedInterns, internEmail]);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formName || !formStart || !formMentor) return;

    try {
      const selectedMentor = availableMentors.find(m => m.id === formMentor);
      const cohort = await cohortApi.createCohort({
        name: formName,
        mentorId: selectedMentor?.id,
        mentorName: selectedMentor?.name,
        mentorEmail: selectedMentor?.email,
        startDate: formStart,
        progress: 0,
        description: formDesc
      });

      // Add selected interns to the cohort
      if (cohort && selectedInterns.length > 0) {
        for (const email of selectedInterns) {
          const internObj = availableInterns.find(i => i.email === email);
          if (internObj) {
            await cohortApi.addCohortMember(cohort.id, internObj.id);
          }
        }
      }

      await loadData();

      // Reset Form
      setIsDrawerOpen(false);
      setFormName('');
      setFormStart('');
      setFormDesc('');
      setSelectedInterns([]);
      alert('New Batch created successfully!');
    } catch (err) {
      console.error('Failed to create batch:', err);
    }
  };

  return (
    <div className="batches-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Batch Registries & Tracking</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Track cohort progress, assigned mentors, and students roster.</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsDrawerOpen(true)}
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
            <Plus size={15} /> Create Batch
          </button>
        )}
      </div>

      {/* Batch Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {batches.map(batch => (
          <div key={batch.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)', textTransform: 'uppercase' }}>
                  Cohort
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Started: {batch.startDate}
                </span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {batch.name}
              </h4>
              
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                {batch.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <div>
                  <span>Assigned Mentor</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px' }}>
                    {batch.mentorName}
                  </strong>
                </div>
                <div>
                  <span>Total Interns</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Users size={12} /> {batch.studentsCount} Students
                  </strong>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Course Syllabus Progress</span>
                  <strong>{batch.progress}%</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--primary-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${batch.progress}%`, height: '100%', background: 'var(--active-blue)', borderRadius: '10px' }} />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ADMIN DRAWER MODAL FOR CREATE BATCH */}
      {isDrawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="admin-drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="admin-drawer-header">
              <h3>Create Training Batch</h3>
              <button className="admin-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="admin-drawer-body">
              
              <div className="admin-form-group">
                <label>Batch / Cohort Name *</label>
                <input
                  type="text"
                  placeholder="e.g. MERN Summer Bootcamp 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Assign Mentor *</label>
                <select value={formMentor} onChange={(e) => setFormMentor(e.target.value)} required>
                  <option value="">Select Mentor</option>
                  {availableMentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Cohort Description</label>
                <textarea
                  placeholder="Provide syllabus outline or description..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Intern Selection Checkboxes */}
              <div className="admin-form-group">
                <label>Assign Registered Interns ({selectedInterns.length} Selected)</label>
                <div style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--primary-bg)',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  {availableInterns.map(intern => {
                    const isSelected = selectedInterns.includes(intern.email);
                    return (
                      <div
                        key={intern.id}
                        onClick={() => handleToggleInternSelection(intern.email)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 8px',
                          background: isSelected ? 'rgba(0,123,245,0.05)' : 'none',
                          border: isSelected ? '1px solid var(--active-blue)' : '1px solid transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-main)'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: '1.5px solid var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? 'var(--active-blue)' : 'none',
                          borderColor: isSelected ? 'var(--active-blue)' : 'var(--text-muted)'
                        }}>
                          {isSelected && <Check size={10} color="white" />}
                        </div>
                        <div>
                          <strong>{intern.name}</strong> • <span style={{ color: 'var(--text-muted)' }}>{intern.email}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'none' }}>
                <button type="submit" id="batch-submit-hidden">Submit</button>
              </div>
            </form>

            <div className="admin-drawer-footer">
              <button type="button" className="btn-drawer-cancel" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-drawer-submit"
                onClick={() => document.getElementById('batch-submit-hidden').click()}
              >
                Create Batch
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
