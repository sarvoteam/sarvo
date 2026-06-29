import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, User, BookOpen, FileText } from 'lucide-react';
import { employeeApi } from '../apis/employeeApi';

export default function EditEmployeeProfileModal({ employee, onClose, onUpdateSuccess }) {
  const [activeTab, setActiveTab] = useState('personal'); // personal, academic, documents

  // Form Fields
  // Personal Info
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [parentContact, setParentContact] = useState('');

  // Academic Details
  const [qualification, setQualification] = useState('');
  const [university, setUniversity] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [percentageMarks, setPercentageMarks] = useState('');

  // Documents & Links
  const [panCardNumber, setPanCardNumber] = useState('');
  const [aadharCardNumber, setAadharCardNumber] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [tenthCertificate, setTenthCertificate] = useState('Not Submitted');
  const [twelfthCertificate, setTwelfthCertificate] = useState('Not Submitted');
  const [bachelorsCertificate, setBachelorsCertificate] = useState('Not Submitted');

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    if (employee) {
      // Fetch employee profile details from database
      const loadProfileDetails = async () => {
        try {
          const profile = await employeeApi.getEmployeeProfile(employee.id);
          if (profile) {
            setDateOfBirth(profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '');
            setGender(profile.gender || '');
            setBloodGroup(profile.blood_group || '');
            setCurrentAddress(profile.current_address || '');
            setPermanentAddress(profile.permanent_address || '');
            setEmergencyContactName(profile.emergency_contact_name || '');
            setEmergencyContactPhone(profile.emergency_contact_phone || '');
            setParentContact(profile.parent_contact || '');

            setQualification(profile.qualification || '');
            setUniversity(profile.university || '');
            setPassingYear(profile.passing_year || '');
            setPercentageMarks(profile.percentage_marks || '');

            setPanCardNumber(profile.pan_card_number || '');
            setAadharCardNumber(profile.aadhar_card_number || '');
            setLinkedinProfile(profile.linkedin_profile || '');
            setTenthCertificate(profile.tenth_certificate || 'Not Submitted');
            setTwelfthCertificate(profile.twelfth_certificate || 'Not Submitted');
            setBachelorsCertificate(profile.bachelors_certificate || 'Not Submitted');
          }
        } catch (err) {
          console.error('Failed to load detailed profile:', err);
        }
      };
      loadProfileDetails();
      setAlertMsg(null);
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg(null);

    const payload = {
      dateOfBirth,
      gender,
      bloodGroup,
      currentAddress,
      permanentAddress,
      emergencyContactName,
      emergencyContactPhone,
      parentContact,
      qualification,
      university,
      passingYear: passingYear ? Number(passingYear) : null,
      percentageMarks,
      panCardNumber,
      aadharCardNumber,
      linkedinProfile,
      tenthCertificate,
      twelfthCertificate,
      bachelorsCertificate
    };

    try {
      await employeeApi.updateEmployeeProfile(employee.id, payload);
      setAlertMsg({ type: 'success', text: 'Employee profile updated successfully!' });
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

  if (!employee) return null;

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
        maxWidth: '600px',
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
              Complete Employee Profile
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Updating profile for {employee.name} ({employee.employee_id})
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

        {/* Tabs navigation */}
        <div style={{
          display: 'flex',
          background: 'var(--primary-bg)',
          borderBottom: '1px solid var(--border-color)',
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
            onClick={() => setActiveTab('documents')}
            style={{
              padding: '12px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              color: activeTab === 'documents' ? 'var(--active-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === 'documents' ? '2px solid var(--active-blue)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} /> Documents
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+ve"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Parent Contact</label>
                  <input
                    type="text"
                    placeholder="Parent/Guardian Phone"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="Contact person name"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="Emergency Phone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Current Address</label>
                <textarea
                  placeholder="Enter current address"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  rows={2}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Permanent Address</label>
                <textarea
                  placeholder="Enter permanent address (leave empty if same as current)"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
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
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Highest Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>University / Board</label>
                <input
                  type="text"
                  placeholder="e.g. Savitribai Phule Pune University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Passing Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2025"
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Percentage / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 82.5% or 8.9 CGPA"
                    value={percentageMarks}
                    onChange={(e) => setPercentageMarks(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PAN Card Number</label>
                  <input
                    type="text"
                    placeholder="Enter PAN Number"
                    value={panCardNumber}
                    onChange={(e) => setPanCardNumber(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Aadhaar Card Number</label>
                  <input
                    type="text"
                    placeholder="Enter Aadhaar Number"
                    value={aadharCardNumber}
                    onChange={(e) => setAadharCardNumber(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '12px', width: '100%' }}
                  />
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
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>10th Certificate / Result Status</label>
                <select
                  value={tenthCertificate}
                  onChange={(e) => setTenthCertificate(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                >
                  <option value="Not Submitted">Not Submitted</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>12th Certificate / Result Status</label>
                <select
                  value={twelfthCertificate}
                  onChange={(e) => setTwelfthCertificate(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                >
                  <option value="Not Submitted">Not Submitted</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Bachelor's Certificate / Result Status</label>
                <select
                  value={bachelorsCertificate}
                  onChange={(e) => setBachelorsCertificate(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', height: '34px' }}
                >
                  <option value="Not Submitted">Not Submitted</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer buttons */}
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
