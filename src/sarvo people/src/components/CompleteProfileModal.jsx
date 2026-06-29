import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User, BookOpen, Briefcase } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';

const formatMonthYear = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function CompleteProfileModal({ student, onClose, onUpdateSuccess }) {
  // Tabs: personal, academic, placement
  const [activeTab, setActiveTab] = useState('personal');

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');

  // Academic States
  const [qualification, setQualification] = useState('');
  const [skills, setSkills] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [collegeGraduationYear, setCollegeGraduationYear] = useState('');
  const [collegeCgpa, setCollegeCgpa] = useState('');

  // Placement States
  const [placementStatus, setPlacementStatus] = useState('Unplaced');
  const [placementCompanyName, setPlacementCompanyName] = useState('');
  const [placementCompanyAddress, setPlacementCompanyAddress] = useState('');
  const [placementRole, setPlacementRole] = useState('');
  const [placementPackage, setPlacementPackage] = useState('');

  // Apti, JD, Round States
  const [aptiDetails, setAptiDetails] = useState('');
  const [aptiDate, setAptiDate] = useState('');
  const [jdDetails, setJdDetails] = useState('');
  const [jdDate, setJdDate] = useState('');
  const [roundDetails, setRoundDetails] = useState('');
  const [roundDate, setRoundDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (student) {
      setFirstName(student.first_name || '');
      setLastName(student.last_name || '');
      setEmail(student.email || '');
      setPhone(student.phone || '');
      setDateOfBirth(student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '');
      setGender(student.gender || '');
      setAddress(student.address || '');
      setLinkedinProfile(student.linkedin_profile || '');

      setQualification(student.qualification || '');
      setSkills(student.skills || '');
      setCollegeName(student.college_name || '');
      setCollegeGraduationYear(student.college_graduation_year || '');
      setCollegeCgpa(student.college_cgpa || '');

      setPlacementStatus(student.placement_status || 'Unplaced');
      setPlacementCompanyName(student.placement_company_name || '');
      setPlacementCompanyAddress(student.placement_company_address || '');
      setPlacementRole(student.placement_role || '');
      setPlacementPackage(student.placement_package || '');

      setAptiDetails(student.apti_details || '');
      setAptiDate(student.apti_date ? new Date(student.apti_date).toISOString().split('T')[0] : '');
      setJdDetails(student.jd_details || '');
      setJdDate(student.jd_date ? new Date(student.jd_date).toISOString().split('T')[0] : '');
      setRoundDetails(student.round_details || '');
      setRoundDate(student.round_date ? new Date(student.round_date).toISOString().split('T')[0] : '');

      setAlertMsg(null);
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cohortApi.updateStudentProfile(student.id, {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        qualification,
        skills,
        linkedinProfile,
        collegeName,
        collegeGraduationYear,
        collegeCgpa,
        placementStatus,
        placementCompanyName: placementStatus === 'Placed' ? placementCompanyName : null,
        placementCompanyAddress: placementStatus === 'Placed' ? placementCompanyAddress : null,
        placementRole: placementStatus === 'Placed' ? placementRole : null,
        placementPackage: placementStatus === 'Placed' ? placementPackage : null,
        aptiDetails: aptiDetails || null,
        aptiDate: aptiDate || null,
        jdDetails: jdDetails || null,
        jdDate: jdDate || null,
        roundDetails: roundDetails || null,
        roundDate: roundDate || null
      });

      setAlertMsg({ type: 'success', text: 'Student profile updated successfully!' });
      setTimeout(() => {
        onUpdateSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setAlertMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg)',
        width: '100%',
        maxWidth: '550px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              Complete Student Profile
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Updating details for {firstName} {lastName}
            </p>
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {student.cohort_name && (
          <div style={{
            background: 'var(--primary-bg)',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Batch: </span>
              <strong>{student.cohort_name}</strong>
            </div>
            {(student.cohort_start_date || student.cohort_end_date) && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {student.cohort_start_date && formatMonthYear(student.cohort_start_date)}
                {student.cohort_end_date && ` - ${formatMonthYear(student.cohort_end_date)}`}
              </div>
            )}
          </div>
        )}

        {/* Tab Header */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--primary-bg)',
          padding: '0 10px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '12px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              color: activeTab === 'personal' ? 'var(--active-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'personal' ? '2px solid var(--active-blue)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={14} /> Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            style={{
              padding: '12px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              color: activeTab === 'academic' ? 'var(--active-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'academic' ? '2px solid var(--active-blue)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={14} /> Academic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('placement')}
            style={{
              padding: '12px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              color: activeTab === 'placement' ? 'var(--active-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'placement' ? '2px solid var(--active-blue)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Briefcase size={14} /> Placement Details
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {alertMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              background: alertMsg.type === 'error' ? '#fef2f2' : '#e8f7f2',
              border: alertMsg.type === 'error' ? '1px solid #fca5a5' : '1px solid #a3e635',
              color: alertMsg.type === 'error' ? '#dc2626' : '#15803d'
            }}>
              {alertMsg.type === 'error' ? <AlertCircle size={15} /> : <Check size={15} />}
              <span>{alertMsg.text}</span>
            </div>
          )}

          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>LinkedIn Profile URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinProfile}
                  onChange={(e) => setLinkedinProfile(e.target.value)}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && !/^https?:\/\//i.test(val)) {
                      setLinkedinProfile(`https://${val}`);
                    }
                  }}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Residential Address</label>
                <textarea
                  placeholder="Enter current address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Academic Details */}
          {activeTab === 'academic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Current College / University</label>
                <input
                  type="text"
                  placeholder="e.g. COEP Technological University"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Graduation Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={collegeGraduationYear}
                    onChange={(e) => setCollegeGraduationYear(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>College CGPA / Marks</label>
                  <input
                    type="text"
                    placeholder="e.g. 9.1 CGPA or 85%"
                    value={collegeCgpa}
                    onChange={(e) => setCollegeCgpa(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Qualification / Degree</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Key Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Placement Details */}
          {activeTab === 'placement' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Placement Status</label>
                <select
                  value={placementStatus}
                  onChange={(e) => setPlacementStatus(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                >
                  <option value="Unplaced">Unplaced</option>
                  <option value="Placed">Placed</option>
                  <option value="In Process">In Process</option>
                </select>
              </div>

              {/* Conditional Placement Fields */}
              {placementStatus === 'Placed' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Google"
                        value={placementCompanyName}
                        onChange={(e) => setPlacementCompanyName(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Role Selected For</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer"
                        value={placementRole}
                        onChange={(e) => setPlacementRole(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Annual Package (LPA / Salary)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 LPA"
                      value={placementPackage}
                      onChange={(e) => setPlacementPackage(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Company Address</label>
                    <textarea
                      placeholder="e.g. Silicon Valley, CA"
                      value={placementCompanyAddress}
                      onChange={(e) => setPlacementCompanyAddress(e.target.value)}
                      rows={2}
                      style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                    />
                  </div>
                </>
              )}

              {placementStatus === 'In Process' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Aptitude (Apti) Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Cleared, 85 Marks, Pending"
                        value={aptiDetails}
                        onChange={(e) => setAptiDetails(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Aptitude (Apti) Date</label>
                      <input
                        type="date"
                        value={aptiDate}
                        onChange={(e) => setAptiDate(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Job Description (JD) Details</label>
                      <input
                        type="text"
                        placeholder="e.g. React Developer JD"
                        value={jdDetails}
                        onChange={(e) => setJdDetails(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Job Description (JD) Date</label>
                      <input
                        type="date"
                        value={jdDate}
                        onChange={(e) => setJdDate(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Interview Round Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Technical Round 1"
                        value={roundDetails}
                        onChange={(e) => setRoundDetails(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Interview Round Date</label>
                      <input
                        type="date"
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              className="btn-drawer-cancel"
              style={{ padding: '8px 16px', fontSize: '12.5px' }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-drawer-submit"
              style={{ padding: '8px 16px', fontSize: '12.5px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
