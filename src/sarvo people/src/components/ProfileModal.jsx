import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, Briefcase, Award, ShieldCheck, Heart, Key } from 'lucide-react';
import { employeeApi } from '../apis/employeeApi';

export default function ProfileModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Update states
  const [showUpdatePasswordView, setShowUpdatePasswordView] = useState(false);
  const [pwStep, setPwStep] = useState(1); // 1 = send OTP, 2 = verify and update
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await employeeApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProfile = () => {
    setShowUpdatePasswordView(false);
    setPwStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setPwSuccess('');
    setPwError('');
  };

  const handleClose = () => {
    handleBackToProfile();
    onClose();
  };

  const handleSendOTP = async () => {
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await employeeApi.sendOTP();
      setPwSuccess('Verification code (OTP) sent successfully to your registered email.');
      setPwStep(2);
    } catch (err) {
      console.error(err);
      setPwError(err.response?.data?.error || err.message || 'Failed to send OTP.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      setPwError('Verification code (OTP) is required.');
      return;
    }
    if (newPassword.length < 5) {
      setPwError('New password must be at least 5 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await employeeApi.updatePassword(otp, newPassword);
      setPwSuccess('Password updated successfully!');
      setTimeout(() => {
        handleBackToProfile();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPwError(err.response?.data?.error || err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (!isOpen) return null;

  const userInitials = profile?.first_name 
    ? profile.first_name.charAt(0).toUpperCase() 
    : 'U';

  return (
    <div className="admin-drawer-overlay" onClick={handleClose} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="admin-drawer-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '95%', 
          borderRadius: '16px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--active-blue, #007bf5) 0%, #00d2ff 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              {userInitials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                {profile ? `${profile.first_name} ${profile.last_name || ''}` : 'Loading...'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', display: 'block', marginTop: '2px' }}>
                {profile?.employee_code} · {profile?.designation_name || profile?.role || 'User'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--text-muted, #64748b)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px' }}>Fetching profile details...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px dashed #fca5a5' }}>
            {error}
          </div>
        ) : showUpdatePasswordView ? (
          /* Password Update View */
          <div style={{ textAlign: 'left', minHeight: '200px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--active-blue, #007bf5)' }} /> Update Password
            </h4>

            {pwError && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', fontSize: '12.5px', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', borderRadius: '8px', fontSize: '12.5px', color: '#15803d', backgroundColor: '#e8f7f2', border: '1px solid #a3e635' }}>
                {pwSuccess}
              </div>
            )}

            {pwStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)', lineHeight: '1.5', margin: 0 }}>
                  To ensure account security, we will send a One-Time Verification Code (OTP) to your registered email address:
                  <strong style={{ color: 'var(--text-main, #0f172a)', display: 'block', marginTop: '4px' }}>{profile?.email}</strong>
                </p>

                <button
                  onClick={handleSendOTP}
                  disabled={pwLoading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: 'var(--active-blue, #007bf5)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: pwLoading ? 'not-allowed' : 'pointer',
                    width: 'fit-content',
                    marginTop: '8px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                  onMouseOut={e => e.currentTarget.style.opacity = 1}
                >
                  {pwLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                  Enter the 6-digit verification code sent to your email and set your new password.
                </p>

                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Verification Code (OTP) *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--primary-bg)', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>New Password *</label>
                    <input
                      type="password"
                      placeholder="Minimum 5 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--primary-bg)', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Confirm New Password *</label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--primary-bg)', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={pwLoading}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: 'var(--btn-green, #10b981)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: pwLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {pwLoading ? 'Updating...' : 'Verify & Update Password'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPwStep(1)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Back option */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={handleBackToProfile}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--active-blue, #007bf5)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                &larr; Back to Profile Details
              </button>
            </div>
          </div>
        ) : profile ? (
          /* Profile Details Content */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Personal Info & Org Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Personal Information */}
              <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                  <User size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Personal Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Email Address</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.email}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Phone Number</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.phone || '-'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Date of Birth</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                        {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Gender</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.gender || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Blood Group</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.blood_group || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                  <Briefcase size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Organization Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Employee Code</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.employee_code}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Role</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.role}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Department</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.department_name || '-'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Designation</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.designation_name || '-'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Academic Info */}
            <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                <Award size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Academic Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Qualification</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.qualification || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>University / Board</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.university || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Passing Year</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.passing_year || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Percentage / CGPA</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.percentage_marks || '-'}</span>
                </div>
              </div>
            </div>

            {/* 3. Address details */}
            <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                <MapPin size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Address Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Current Address</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main, #0f172a)', lineHeight: '1.4' }}>{profile.current_address || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Permanent Address</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main, #0f172a)', lineHeight: '1.4' }}>{profile.permanent_address || '-'}</span>
                </div>
              </div>
            </div>

            {/* 4. Emergency Contacts */}
            <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                <Heart size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Emergency & Family Contact
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Emergency Name</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.emergency_contact_name || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Emergency Phone</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.emergency_contact_phone || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Parent Contact</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.parent_contact || '-'}</span>
                </div>
              </div>
            </div>

            {/* 5. Documents & Links */}
            <div style={{ background: 'var(--primary-bg, #f8fafc)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
                <ShieldCheck size={15} style={{ color: 'var(--active-blue, #007bf5)' }} /> Documents & Links
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>PAN Card Number</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.pan_card_number || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>Aadhaar Card Number</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{profile.aadhar_card_number || '-'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', display: 'block' }}>LinkedIn Profile</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-main, #0f172a)' }}>
                    {profile.linkedin_profile ? (
                      <a 
                        href={profile.linkedin_profile} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: 'var(--active-blue, #007bf5)', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        View Link
                      </a>
                    ) : '-'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ) : null}

        {/* Footer */}
        {!showUpdatePasswordView && !loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px' }}>
            <button 
              onClick={() => setShowUpdatePasswordView(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                background: 'var(--active-blue, #007bf5)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.9}
              onMouseOut={e => e.currentTarget.style.opacity = 1}
            >
              <Key size={14} />
              Update Password
            </button>
            
            <button 
              onClick={handleClose} 
              className="btn-drawer-cancel"
              style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
            >
              Close Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
