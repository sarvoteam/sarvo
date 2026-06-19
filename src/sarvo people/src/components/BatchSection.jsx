import React, { useState, useEffect } from 'react';
import { Users, User, Calendar, Plus, X, FolderMinus, Sparkles, BookOpen, Check } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';

import BatchDetailsDrawer from './BatchDetailsDrawer';
import StudentsSection from './StudentsSection';

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

export default function BatchSection({ currentUser, subNavItem }) {
  const [batches, setBatches] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  // Roster lists for selectors
  const [availableMentors, setAvailableMentors] = useState([]);

  // Form States
  const [formName, setFormName] = useState('');
  const [formMentor, setFormMentor] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const isAdmin = currentUser?.role === 'Admin';

  const mapCohort = (c) => ({
    id: c.id,
    name: c.name,
    mentorName: c.mentor_name || 'Unassigned',
    mentorEmail: c.mentor_email || '',
    startDate: c.start_date ? new Date(c.start_date).toISOString().split('T')[0] : '',
    endDate: c.end_date ? new Date(c.end_date).toISOString().split('T')[0] : '',
    status: c.status || 'Active',
    progress: c.progress || 0,
    studentsCount: c.students_count || 0,
    description: c.description
  });

  const loadData = async () => {
    try {
      // Load batches
      const data = await cohortApi.getCohorts();
      if (data && data.length > 0) {
        const mapped = data.map(mapCohort);
        setBatches(mapped);
        
        // Update currently viewed batch details if open
        if (selectedBatch) {
          const updated = mapped.find(b => b.id === selectedBatch.id);
          if (updated) {
            setSelectedBatch(updated);
          }
        }
      } else {
        setBatches([]);
      }

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

  // Load batches and mentors from database
  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formName || !formStart || !formMentor) return;

    try {
      const selectedMentor = availableMentors.find(m => m.id === formMentor);
      await cohortApi.createCohort({
        name: formName,
        mentorId: selectedMentor?.id,
        mentorName: selectedMentor?.name,
        mentorEmail: selectedMentor?.email,
        startDate: formStart,
        endDate: formEnd || null,
        progress: 0,
        description: formDesc
      });

      await loadData();

      // Reset Form
      setIsDrawerOpen(false);
      setFormName('');
      setFormStart('');
      setFormEnd('');
      setFormDesc('');
      alert('New Batch created successfully!');
    } catch (err) {
      console.error('Failed to create batch:', err);
    }
  };

  if (subNavItem === 'Students') {
    return (
      <div className="batches-container" style={{ padding: '24px', textAlign: 'left' }}>
        <StudentsSection currentUser={currentUser} />
      </div>
    );
  }

  if (subNavItem === 'Roster Map') {
    return (
      <div className="batches-container" style={{ padding: '24px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Roster Map</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '20px' }}>
          Geographic and team structural distribution of current batches.
        </p>
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Interactive map layout and batch locations tracking modules will load here.
        </div>
      </div>
    );
  }

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
          <div 
            key={batch.id} 
            className="card" 
            onClick={() => setSelectedBatch(batch)}
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifySelf: 'stretch', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)', textTransform: 'uppercase' }}>
                    Cohort
                  </span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: batch.status === 'Active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    color: batch.status === 'Active' ? '#10b981' : '#ef4444'
                  }}>
                    {batch.status}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Duration: {batch.startDate} {batch.endDate ? `to ${batch.endDate}` : ''}
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
                  <span>Total Students</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
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

      {/* BATCH DETAILS & ROSTER DRAWER */}
      <BatchDetailsDrawer
        selectedBatch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        isAdmin={isAdmin}
        onStudentAdded={loadData}
      />

    </div>
  );
}
