import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Plus, Check, AlertCircle } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';

export default function BatchDetailsDrawer({ selectedBatch, onClose, isAdmin, onStudentAdded }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Student Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  const loadStudents = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const data = await cohortApi.getCohortStudents(selectedBatch.id);
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    setAlertMsg(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
  }, [selectedBatch]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    try {
      await cohortApi.addCohortStudent(selectedBatch.id, {
        firstName,
        lastName,
        email,
        phone
      });

      alert('registered successfull and credentials sent successfully');
      setAlertMsg({ type: 'success', text: 'registered successfull and credentials sent successfully' });
      
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');

      // Reload students roster
      await loadStudents();

      // Notify parent to refresh cohort lists (which updates studentsCount)
      if (onStudentAdded) {
        onStudentAdded();
      }

      // Clear success alert after 2.5 seconds
      setTimeout(() => {
        setAlertMsg(null);
      }, 2500);

    } catch (err) {
      console.error('Failed to add student:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to add student.';
      alert(errMsg);
      setAlertMsg({ type: 'error', text: errMsg });
    }
  };

  if (!selectedBatch) return null;

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div className="admin-drawer-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)', textTransform: 'uppercase' }}>
              Batch Details
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {selectedBatch.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status:</span>
              {isAdmin ? (
                <select
                  value={selectedBatch.status || 'Active'}
                  onChange={async (e) => {
                    try {
                      await cohortApi.updateCohortStatus(selectedBatch.id, e.target.value);
                      if (onStudentAdded) onStudentAdded(); // refresh cohort list
                    } catch (err) {
                      alert('Failed to update status: ' + err.message);
                    }
                  }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'var(--primary-bg)',
                    color: (selectedBatch.status || 'Active') === 'Active' ? '#10b981' : '#ef4444',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="Active" style={{ color: '#10b981' }}>Active</option>
                  <option value="Inactive" style={{ color: '#ef4444' }}>Inactive</option>
                </select>
              ) : (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: (selectedBatch.status || 'Active') === 'Active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  color: (selectedBatch.status || 'Active') === 'Active' ? '#10b981' : '#ef4444'
                }}>
                  {selectedBatch.status || 'Active'}
                </span>
              )}
            </div>
          </div>
          <button className="admin-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metadata Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 0.9fr 0.9fr', 
            gap: '12px', 
            background: 'var(--primary-bg)', 
            padding: '14px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)' 
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Mentor</span>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>
                {selectedBatch.mentorName}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedBatch.mentorEmail}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Start Date</span>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} style={{ color: 'var(--active-blue)' }} /> {selectedBatch.startDate}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>End Date</span>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} style={{ color: 'var(--active-blue)' }} /> {selectedBatch.endDate || '-'}
              </strong>
            </div>
          </div>

          {/* Description */}
          {selectedBatch.description && (
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</span>
              <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', lineHeight: '1.5' }}>
                {selectedBatch.description}
              </p>
            </div>
          )}

          {/* Syllabus Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Course Syllabus Progress</span>
              <strong>{selectedBatch.progress}%</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--primary-bg)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${selectedBatch.progress}%`, height: '100%', background: 'var(--active-blue)', borderRadius: '10px' }} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />

          {/* Students Roster list */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} style={{ color: 'var(--active-blue)' }} />
              Students Roster ({students.length})
            </h4>

            {loading ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                Loading students roster...
              </div>
            ) : students.length === 0 ? (
              <div style={{ 
                padding: '24px', 
                textAlign: 'center', 
                background: 'var(--primary-bg)', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '8px', 
                color: 'var(--text-muted)', 
                fontSize: '12.5px' 
              }}>
                No students registered in this batch yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {students.map(student => (
                  <div 
                    key={student.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      background: 'var(--primary-bg)', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)' 
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                        {student.first_name} {student.last_name}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {student.email} {student.phone && `• ${student.phone}`}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '10px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase' 
                    }}>
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Student Sub-form */}
          {isAdmin && (
            <div style={{ 
              marginTop: '10px', 
              padding: '16px', 
              background: 'var(--primary-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '10px' 
            }}>
              <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={14} style={{ color: '#10b981' }} /> Add Student to Batch
              </h5>
              
              <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alertMsg && (
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      background: alertMsg.type === 'error' ? '#fef2f2' : '#e8f7f2',
                      border: alertMsg.type === 'error' ? '1px solid #fca5a5' : '1px solid #a3e635',
                      color: alertMsg.type === 'error' ? '#dc2626' : '#15803d'
                    }}
                  >
                    {alertMsg.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
                    <span>{alertMsg.text}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>First Name *</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      style={{ padding: '8px 10px', fontSize: '12px' }}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Last Name *</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      style={{ padding: '8px 10px', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                  />
                </div>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '6px',
                    padding: '10px',
                    background: 'var(--btn-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 184, 124, 0.15)'
                  }}
                >
                  Register & Assign Student
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="admin-drawer-footer">
          <button type="button" className="btn-drawer-cancel" onClick={onClose}>
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
