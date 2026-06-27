import React, { useState } from 'react';
import { Mail, Lock, User, Users, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, ShieldCheck, KeyRound, School } from 'lucide-react';
import { authApi } from '../apis/authApi';

const STATIC_ADMIN = {
  id: 1,
  employee_id: 'SARVO001',
  name: 'Sarvo Admin',
  role: 'Admin',
  department: 'Administration',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  status: 'Checked-in',
  email: 'admin@sarvo.com',
  shift: 'General (10:30 AM - 06:30 PM)',
  skills: ['Management', 'Administration', 'Operations']
};

const STATIC_MENTOR = {
  id: 2,
  employee_id: 'SARVO002',
  name: 'Om Mentor',
  role: 'Mentor',
  department: 'Engineering',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  status: 'Checked-in',
  manager_id: 1,
  email: 'om@sarvo.com',
  shift: 'General (10:30 AM - 06:30 PM)',
  skills: ['React', 'Node.js', 'SQL', 'System Design']
};

const DEFAULT_INTERN = {
  id: 3,
  employee_id: 'INT2026001',
  name: 'Akanksha Student',
  role: 'Intern',
  department: 'Engineering',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  status: 'Yet to check-in',
  manager_id: 2,
  email: 'akanksha@sarvo.com',
  shift: 'General (10:30 AM - 06:30 PM)',
  college: 'COEP Technological University',
  skills: ['HTML', 'CSS', 'JavaScript'],
  github: 'https://github.com/aditya-patil',
  linkedin: 'https://linkedin.com/in/aditya-patil-coep',
  status_tracking: 'Active',
  attendance_pct: 88
};

export default function AuthSection({ onLoginSuccess, onBackToSite }) {
  const [view, setView] = useState('login'); // login, register, verify, forgot, reset
  const [activeRole, setActiveRole] = useState('intern'); // admin, mentor, intern
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration States (Intern only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regSkills, setRegSkills] = useState('');
  const [regGithub, setRegGithub] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');
  
  // Verification State
  const [otp, setOtp] = useState('');
  const [tempInternData, setTempInternData] = useState(null);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setError('');
    setSuccess('');
    if (role === 'admin') {
      setEmail('admin@sarvo.com');
      setPassword('sarvoadmin@2026');
    } else if (role === 'mentor') {
      setEmail('om@sarvo.com');
      setPassword('sarvoadmin@2026');
    } else if (role === 'student') {
      setEmail('vaishnav@sarvo.com');
      setPassword('sarvoadmin@2026');
    } else {
      setEmail('akanksha@sarvo.com');
      setPassword('sarvoadmin@2026');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.login(email.trim(), password.trim());
      setSuccess('Authentication successful! Loading dashboard...');
      
      // Save details
      sessionStorage.setItem('sarvo_token', data.token);
      localStorage.setItem('sarvo_current_user', JSON.stringify(data.user));
      sessionStorage.setItem('sarvo_people_auth', 'true');
      
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 800);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName || !regEmail || !regPassword || !regCollege) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    const internPayload = {
      name: regName,
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      college: regCollege,
      skills: regSkills,
      github: regGithub || '',
      linkedin: regLinkedin || '',
      phone: ''
    };

    setTempInternData(internPayload);
    setLoading(false);
    setSuccess('Verification OTP sent to ' + regEmail);
    setView('verify');
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp !== '123456' && otp !== '1234') {
      setError('Invalid verification code. Use demo code "123456"');
      return;
    }

    setLoading(true);
    try {
      const createdIntern = await authApi.register(tempInternData);
      setSuccess('Email verified and registered successfully! You can now log in.');
      setEmail(createdIntern.email);
      setPassword(tempInternData.password);
      setActiveRole('intern');
      
      setTimeout(() => {
        setView('login');
        setOtp('');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSuccess('Reset code sent! Check your inbox.');
      setView('reset');
      setLoading(false);
    }, 600);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode || !newPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Handle password update for local users
      const registered = localStorage.getItem('sarvo_registered_interns');
      if (registered) {
        let interns = JSON.parse(registered);
        const userIdx = interns.findIndex(u => u.email === forgotEmail.trim().toLowerCase());
        if (userIdx !== -1) {
          interns[userIdx].password = newPassword;
          localStorage.setItem('sarvo_registered_interns', JSON.stringify(interns));
        }
      }

      setSuccess('Password updated successfully! Redirecting...');
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setView('login');
        setLoading(false);
      }, 1000);
    }, 600);
  };

  return (
    <div className="auth-card-overlay">
      {/* Back Button */}
      <button className="auth-back-btn" onClick={onBackToSite}>
        <ArrowLeft size={16} /> Back to Site
      </button>

      <div className="auth-card-container">
        <div className="auth-glass-card">
          {/* Logo Title */}
          <div className="auth-header">
            <div className="auth-logo-icon">
              <ShieldCheck size={28} />
            </div>
            <h2>Sarvo People</h2>
            <p>Enterprise Internship & Training Portal</p>
          </div>

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <>
              {/* Role Switch Tabs */}
              <div className="role-tabs">
                {['student', 'intern', 'mentor', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSwitch(role)}
                    className={`role-tab-btn ${activeRole === role ? 'active' : ''}`}
                  >
                    {role === 'admin' ? (
                      <ShieldCheck size={14} />
                    ) : role === 'mentor' ? (
                      <User size={14} />
                    ) : role === 'student' ? (
                      <School size={14} />
                    ) : (
                      <Users size={14} />
                    )}
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>

              {error && (
                <div className="auth-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <CheckCircle size={15} />
                  {success}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Password</label>
                    <span className="auth-forgot-link" onClick={() => setView('forgot')}>Forgot?</span>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye-btn"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

               {/* Demo accounts hint */}
              <div className="auth-demo-hint">
                <strong>Demo Credentials ({activeRole.toUpperCase()}):</strong>
                <div>Email: <span className="fill-cred" onClick={() => setEmail(
                  activeRole === 'admin' ? 'admin@sarvo.com' : 
                  activeRole === 'mentor' ? 'om@sarvo.com' : 
                  activeRole === 'intern' ? 'akanksha@sarvo.com' : 'vaishnav@sarvo.com'
                )}>{
                  activeRole === 'admin' ? 'admin@sarvo.com' : 
                  activeRole === 'mentor' ? 'om@sarvo.com' : 
                  activeRole === 'intern' ? 'akanksha@sarvo.com' : 'vaishnav@sarvo.com'
                }</span></div>
                <div>Password: <span className="fill-cred" onClick={() => setPassword('sarvoadmin@2026')}>sarvoadmin@2026</span></div>
              </div>

              <div className="auth-footer-link">
                New Intern? <span onClick={() => setView('register')}>Create profile</span>
              </div>
            </>
          )}

          {/* VIEW: REGISTER */}
          {view === 'register' && (
            <>
              <div className="auth-subheader">
                <h3>Intern Registration</h3>
                <p>Register to access training courses, projects, and placements.</p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="auth-form scrollable">
                <div className="auth-form-group">
                  <label>Full Name *</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Aditya Patil"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>Email Address *</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. aditya@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>Password *</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>College / University *</label>
                  <div className="auth-input-wrapper">
                    <School size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={regCollege}
                      onChange={(e) => setRegCollege(e.target.value)}
                      placeholder="e.g. COEP University"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    placeholder="e.g. React, CSS, Python"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div className="auth-form-row">
                  <div className="auth-form-group">
                    <label>GitHub Profile URL</label>
                    <input
                      type="url"
                      value={regGithub}
                      onChange={(e) => setRegGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div className="auth-form-group">
                    <label>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={regLinkedin}
                      onChange={(e) => setRegLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Creating Account...' : 'Register Profile'}
                </button>
              </form>

              <div className="auth-footer-link">
                Already registered? <span onClick={() => setView('login')}>Sign In</span>
              </div>
            </>
          )}

          {/* VIEW: EMAIL VERIFICATION */}
          {view === 'verify' && (
            <>
              <div className="auth-subheader">
                <h3>Verify Email</h3>
                <p>We've sent a 6-digit verification OTP to your email address.</p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <CheckCircle size={15} />
                  {success}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="auth-form">
                <div className="auth-form-group">
                  <label>Verification Code (OTP)</label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter code (default: 123456)"
                      style={{ letterSpacing: '0.2em', textAlign: 'center' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Use demo code: <strong style={{ color: 'var(--active-blue)' }}>123456</strong>
                </div>
              </form>

              <div className="auth-footer-link">
                <span onClick={() => setView('register')}>Back to Registration</span>
              </div>
            </>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <>
              <div className="auth-subheader">
                <h3>Forgot Password</h3>
                <p>Enter your email address and we'll send a code to reset your password.</p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <CheckCircle size={15} />
                  {success}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label>Registered Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>

              <div className="auth-footer-link">
                Remembered? <span onClick={() => setView('login')}>Sign In</span>
              </div>
            </>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === 'reset' && (
            <>
              <div className="auth-subheader">
                <h3>Reset Password</h3>
                <p>Enter the reset code sent to your email and choose a new password.</p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-alert success">
                  <CheckCircle size={15} />
                  {success}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label>Reset Code</label>
                  <div className="auth-input-wrapper">
                    <KeyRound size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter code"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>

              <div className="auth-footer-link">
                Back to <span onClick={() => setView('login')}>Sign In</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
