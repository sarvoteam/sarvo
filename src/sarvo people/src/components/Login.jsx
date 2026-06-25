import React, { useState } from 'react';
import { Mail, Lock, Shield, User, AlertCircle, School } from 'lucide-react';

const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    employee_id: 'SPWHI001',
    name: 'Admin S.',
    role: 'Reporting Manager',
    department: 'Administration',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'Yet to check-in',
    manager_id: null,
    email: 'admin@spwhitel.com',
    mobile: '91-9999999999',
    work_phone: '9999999999',
    timezone: 'India Standard Time (GMT+05:30)',
    about_me: 'System Administrator and Manager',
    shift: 'General (10:30 AM - 06:30 PM)'
  },
  {
    id: 2,
    employee_id: 'SPWHI015',
    name: 'Rohit Ghanghav',
    role: 'Developer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'Yet to check-in',
    manager_id: 1,
    email: 'rohit.g@spwhitel.com',
    mobile: '91-9335293233',
    work_phone: '9335293233',
    timezone: 'India Standard Time (GMT+05:30)',
    about_me: 'Write a short introduction about yourself',
    shift: 'General (10:30 AM - 06:30 PM)'
  },
  {
    id: 3,
    employee_id: 'SPWHI012',
    name: 'Chetan Ghanghav',
    role: 'UI/UX Designer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'Yet to check-in',
    manager_id: 1,
    email: 'chetan.g@spwhitel.com',
    mobile: '91-9222222222',
    work_phone: '9222222222',
    timezone: 'India Standard Time (GMT+05:30)',
    about_me: 'Creative UI/UX Designer',
    shift: 'General (10:30 AM - 06:30 PM)'
  }
];

export default function Login({ onLoginSuccess }) {
  const [roleMode, setRoleMode] = useState('employee'); // employee, admin, student
  const [email, setEmail] = useState('rohit.g@spwhitel.com');
  const [password, setPassword] = useState('employee123');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRoleChange = (role) => {
    setRoleMode(role);
    if (role === 'admin') {
      setEmail('admin@spwhitel.com');
      setPassword('admin123');
    } else if (role === 'student') {
      setEmail('student@spwhitel.com');
      setPassword('student123');
    } else {
      setEmail('rohit.g@spwhitel.com');
      setPassword('employee123');
    }
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const endpoint = roleMode === 'student' ? '/employees/students/login' : '/employees/login';
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const userObj = data.employee || data.user;
        // Save current session
        localStorage.setItem('sarvo_current_user', JSON.stringify(userObj));
        onLoginSuccess(userObj);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      // Offline fallback: Search local storage or DEFAULT_EMPLOYEES
      console.warn('Backend server not connected. Attempting offline fallback authentication.');
      
      if (roleMode === 'student') {
        const mockStudent = {
          id: 'student-id-mock-123',
          first_name: 'Om',
          last_name: 'Kolekar',
          email: 'student@sarvo.com',
          role: 'Student',
          status: 'active'
        };
        localStorage.setItem('sarvo_current_user', JSON.stringify(mockStudent));
        onLoginSuccess(mockStudent);
        return;
      }

      const localEmps = localStorage.getItem('sarvo_admin_employees');
      const employeeList = localEmps ? JSON.parse(localEmps) : DEFAULT_EMPLOYEES;

      const user = employeeList.find(emp => emp.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        setErrorMsg('No employee registered with this email.');
        return;
      }

      // Check role-based password
      const isAdmin = user.role === 'Reporting Manager' || user.role === 'Admin' || user.department === 'Administration';
      const expectedPassword = isAdmin ? 'admin123' : 'employee123';

      if (password !== expectedPassword) {
        setErrorMsg('Invalid password.');
        return;
      }

      // Successful mock login
      localStorage.setItem('sarvo_current_user', JSON.stringify(user));
      onLoginSuccess(user);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Brand Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">S</div>
            <span className="login-logo-text">sarvo People</span>
          </div>

          {/* Title Header */}
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please log in using your employee credentials</p>
          </div>

          {/* Role Quick Selector Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab-btn ${roleMode === 'employee' ? 'active' : ''}`}
              onClick={() => handleRoleChange('employee')}
            >
              <User size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Employee Login
            </button>
            <button
              type="button"
              className={`login-tab-btn ${roleMode === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              <School size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Student Login
            </button>
            <button
              type="button"
              className={`login-tab-btn ${roleMode === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <Shield size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Admin Login
            </button>
          </div>

          {/* Error alerts */}
          {errorMsg && (
            <div className="login-alert-error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="login-form-group">
              <label>Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" size={16} />
                <input
                  type="email"
                  className="login-input"
                  placeholder="e.g. name@spwhitel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" size={16} />
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-login-submit">
              Sign In
            </button>
          </form>

          {/* Default credentials reference card */}
          <div className="login-info-box">
            <div className="login-info-title">Quick Test Credentials</div>
            <div className="login-info-row">
              <span>Email:</span>
              <span className="login-info-value">{email}</span>
            </div>
            <div className="login-info-row">
              <span>Password:</span>
              <span className="login-info-value">{password}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
