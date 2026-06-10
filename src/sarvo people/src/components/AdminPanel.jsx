import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  ChevronLeft, 
  User, 
  Clock, 
  Umbrella, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';

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

const DEFAULT_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', available: 4, booked: 0, icon_type: 'sun', color_theme: 'blue' },
  { id: 2, name: 'Compensatory Off', available: 0, booked: 0, icon_type: 'co', color_theme: 'green' },
  { id: 3, name: 'Earned Leave', available: 12, booked: 0, icon_type: 'clock', color_theme: 'green-light' },
  { id: 4, name: 'Leave Without Pay', available: 0, booked: 0, icon_type: 'lwop', color_theme: 'red' },
  { id: 5, name: 'Paternity Leave', available: 0, booked: 0, icon_type: 'baby', color_theme: 'orange' },
  { id: 6, name: 'Sick Leave', available: 12, booked: 0, icon_type: 'cross', color_theme: 'purple' }
];

export default function AdminPanel() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTab, setSelectedTab] = useState('profile'); // profile, attendance, leaves
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(true);

  // Form State
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formRole, setFormRole] = useState('Developer');
  const [formDept, setFormDept] = useState('Engineering');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTimezone, setFormTimezone] = useState('India Standard Time (GMT+05:30)');
  const [formShift, setFormShift] = useState('General (10:30 AM - 06:30 PM)');
  const [formAbout, setFormAbout] = useState('');
  
  // Tracked records state
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null);

  // Load Employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employees');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmployees(data);
      setIsBackendLive(true);
    } catch (err) {
      setIsBackendLive(false);
      const localEmps = localStorage.getItem('zoho_admin_employees');
      if (localEmps) {
        setEmployees(JSON.parse(localEmps));
      } else {
        setEmployees(DEFAULT_EMPLOYEES);
        localStorage.setItem('zoho_admin_employees', JSON.stringify(DEFAULT_EMPLOYEES));
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch record tracking details when selected employee or tab changes
  useEffect(() => {
    if (!selectedEmployee) return;

    const fetchSelectedDetails = async () => {
      const empId = selectedEmployee.employee_id;
      
      // Fetch Attendance logs for selected employee
      try {
        const attRes = await fetch(`http://localhost:5000/api/attendance/week/${empId}`);
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendanceLogs(attData);
        }
      } catch (e) {
        const localAtt = localStorage.getItem(`zoho_attendance_${empId}`);
        if (localAtt) {
          setAttendanceLogs(JSON.parse(localAtt));
        } else {
          // Generate a default weekly log
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          const defaultAtt = weekDays.map((day, idx) => {
            const date = new Date();
            date.setDate(today.getDate() - today.getDay() + idx + 1);
            const dateStr = date.toISOString().split('T')[0];
            const isWeekend = idx === 5 || idx === 6;
            return {
              employee_id: empId,
              date: dateStr,
              dayNum: date.getDate(),
              dayName: day,
              check_in: null,
              check_out: null,
              status: isWeekend ? 'Weekend' : 'Absent',
              shift_name: 'General',
              isToday: dateStr === todayStr
            };
          });
          setAttendanceLogs(defaultAtt);
          localStorage.setItem(`zoho_attendance_${empId}`, JSON.stringify(defaultAtt));
        }
      }

      // Fetch Leaves
      try {
        const leavesRes = await fetch('http://localhost:5000/api/leaves/types');
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          setLeaveBalances(leavesData);
        }
        
        const historyRes = await fetch(`http://localhost:5000/api/leaves/applications/${empId}`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setLeaveHistory(historyData);
        }
      } catch (e) {
        const localLeaves = localStorage.getItem(`zoho_leaves_${empId}`);
        if (localLeaves) {
          setLeaveBalances(JSON.parse(localLeaves));
        } else {
          setLeaveBalances(DEFAULT_LEAVE_TYPES);
          localStorage.setItem(`zoho_leaves_${empId}`, JSON.stringify(DEFAULT_LEAVE_TYPES));
        }

        const localHistory = localStorage.getItem(`zoho_leave_applications_${empId}`);
        setLeaveHistory(localHistory ? JSON.parse(localHistory) : []);
      }
    };

    fetchSelectedDetails();
  }, [selectedEmployee, selectedTab]);

  // Master Search Filtering
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.employee_id.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query)
    );
  });

  const suggestions = employees.filter(emp => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.employee_id.toLowerCase().includes(query)
    );
  }).slice(0, 5);

  // Form Submit (Add Employee)
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formId || !formRole || !formDept) {
      setAlertMsg({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    const randomId = Math.floor(Math.random() * 1000) + 100;
    const unsplashAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
    ];
    const randomAvatar = unsplashAvatars[Math.floor(Math.random() * unsplashAvatars.length)];

    const empData = {
      employee_id: formId,
      name: formName,
      role: formRole,
      department: formDept,
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '.')}@spwhitel.com`,
      mobile: formMobile || '91-0000000000',
      work_phone: formPhone || '0000000000',
      timezone: formTimezone,
      shift: formShift,
      about_me: formAbout || 'Write a short introduction about yourself',
      avatar: randomAvatar
    };

    if (isBackendLive) {
      try {
        const res = await fetch('http://localhost:5000/api/employees/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empData)
        });
        if (res.ok) {
          setAlertMsg({ type: 'success', text: 'Employee added successfully!' });
          fetchEmployees();
          resetForm();
          setTimeout(() => {
            setIsDrawerOpen(false);
            setAlertMsg(null);
          }, 1500);
        } else {
          const errData = await res.json();
          setAlertMsg({ type: 'error', text: errData.error || 'Failed to add employee.' });
        }
      } catch (err) {
        setAlertMsg({ type: 'error', text: 'Error connecting to server.' });
      }
    } else {
      // Mock save to local storage
      const newEmpList = [...employees, { ...empData, id: randomId, status: 'Yet to check-in' }];
      setEmployees(newEmpList);
      localStorage.setItem('zoho_admin_employees', JSON.stringify(newEmpList));
      
      setAlertMsg({ type: 'success', text: 'Employee added to mock storage successfully!' });
      resetForm();
      setTimeout(() => {
        setIsDrawerOpen(false);
        setAlertMsg(null);
      }, 1500);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormId('');
    setFormRole('Developer');
    setFormDept('Engineering');
    setFormEmail('');
    setFormMobile('');
    setFormPhone('');
    setFormAbout('');
  };

  // Helper: Calculate worked hours
  const calculateHoursWorked = (day) => {
    if (day.status === 'Absent' || day.status === 'Weekend') return '00:00';
    if (!day.check_in) return '00:00';
    
    const end = day.check_out ? new Date(day.check_out) : new Date();
    const start = new Date(day.check_in);
    const diffMs = end - start;
    if (diffMs < 0) return '00:00';

    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const getProgressWidthPercent = (day) => {
    if (!day.check_in) return '0%';
    const end = day.check_out ? new Date(day.check_out) : new Date();
    const start = new Date(day.check_in);
    const durationMs = end - start;
    const percent = Math.min(100, (durationMs / 28800000) * 100);
    return `${percent}%`;
  };

  return (
    <div className="admin-panel-container" onClick={() => setShowSuggestions(false)}>
      {/* 1. Header Bar */}
      <div className="admin-header-bar">
        <div className="admin-header-title">
          <h2>Administrative Portal</h2>
          <p>{isBackendLive ? 'Database Status: Connected' : 'Database Status: Offline (Running Mock Mode)'}</p>
        </div>
        <button className="btn-add-employee" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* 2. Master Search Box */}
      <div className="admin-master-search-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="admin-search-input-box">
          <Search className="admin-search-icon" size={18} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search employees by Name, Employee ID, Department, or Role..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery && (
            <button className="admin-search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Suggestions list */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="admin-search-suggestions">
            {suggestions.map(emp => (
              <div
                key={emp.employee_id}
                className="admin-suggestion-item"
                onClick={() => {
                  setSelectedEmployee(emp);
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
              >
                <div className="admin-suggestion-left">
                  <img src={emp.avatar} alt={emp.name} className="admin-suggestion-avatar" />
                  <div className="admin-suggestion-info">
                    <span className="admin-suggestion-name">{emp.name}</span>
                    <span className="admin-suggestion-meta">{emp.employee_id} · {emp.role}</span>
                  </div>
                </div>
                <div className="admin-suggestion-right">
                  {emp.department}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Body - Grid of Employees OR Selected employee tracker */}
      {!selectedEmployee ? (
        <div>
          <h3 className="admin-employees-grid-title">All Registered Employees ({filteredEmployees.length})</h3>
          <div className="admin-employees-grid">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.employee_id} 
                className="admin-employee-card"
                onClick={() => setSelectedEmployee(emp)}
              >
                <img src={emp.avatar} alt={emp.name} className="admin-card-avatar" />
                <span className="admin-card-name">{emp.name}</span>
                <span className="admin-card-id">{emp.employee_id}</span>
                <span className="admin-card-role">{emp.role}</span>
                <span className="admin-card-dept">{emp.department}</span>
                <span className={`admin-card-status-pill ${emp.status === 'Checked-in' ? 'status-checked-in' : ''}`}>
                  {emp.status}
                </span>
              </div>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="admin-no-results">No employees match your search query.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-track-view-wrapper">
          {/* Back button and profile summary */}
          <div className="admin-track-back-bar">
            <button className="btn-track-back" onClick={() => setSelectedEmployee(null)}>
              <ArrowLeft size={16} />
              Back to Employee List
            </button>
          </div>

          <div className="admin-track-profile-summary">
            <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="admin-track-avatar" />
            <div className="admin-track-intro">
              <span className="admin-track-name">{selectedEmployee.name}</span>
              <span className="admin-track-meta">{selectedEmployee.employee_id} · {selectedEmployee.role} · {selectedEmployee.department}</span>
            </div>
          </div>

          {/* Record Tracking Tabs */}
          <div className="admin-track-tabs">
            <button 
              className={`admin-track-tab-btn ${selectedTab === 'profile' ? 'active' : ''}`}
              onClick={() => setSelectedTab('profile')}
            >
              Profile Details
            </button>
            <button 
              className={`admin-track-tab-btn ${selectedTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setSelectedTab('attendance')}
            >
              Attendance logs
            </button>
            <button 
              className={`admin-track-tab-btn ${selectedTab === 'leaves' ? 'active' : ''}`}
              onClick={() => setSelectedTab('leaves')}
            >
              Leave Tracker
            </button>
          </div>

          <div className="admin-track-tab-pane">
            {/* 3a. Profile View */}
            {selectedTab === 'profile' && (
              <div className="admin-profile-details-grid">
                <div className="admin-profile-card-section">
                  <h4 className="admin-profile-section-title">Personal Information</h4>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Email Address</span>
                    <span className="admin-profile-value">{selectedEmployee.email}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Mobile Number</span>
                    <span className="admin-profile-value">{selectedEmployee.mobile}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Work Phone</span>
                    <span className="admin-profile-value">{selectedEmployee.work_phone}</span>
                  </div>
                </div>

                <div className="admin-profile-card-section">
                  <h4 className="admin-profile-section-title">Work & Shift Settings</h4>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Shift Details</span>
                    <span className="admin-profile-value">{selectedEmployee.shift}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Timezone</span>
                    <span className="admin-profile-value">{selectedEmployee.timezone}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Status</span>
                    <span className="admin-profile-value">{selectedEmployee.status}</span>
                  </div>
                </div>

                <div className="admin-profile-card-section" style={{ gridColumn: 'span 2' }}>
                  <h4 className="admin-profile-section-title">About Employee</h4>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4b5563' }}>{selectedEmployee.about_me}</p>
                </div>
              </div>
            )}

            {/* 3b. Attendance logs View */}
            {selectedTab === 'attendance' && (
              <div className="attendance-timeline-card" style={{ border: 'none', boxShadow: 'none' }}>
                <div className="timeline-grid-wrapper" style={{ padding: 0 }}>
                  <div className="timeline-rows-list">
                    {attendanceLogs.map((day) => {
                      const isAbsent = day.status === 'Absent';
                      const isWeekend = day.status === 'Weekend';
                      const hoursWorked = calculateHoursWorked(day);

                      return (
                        <div key={day.date} className="timeline-row-item">
                          <div className="timeline-day-label">
                            <span className="day-name-txt">{day.dayName}</span>
                            <div className={`day-circle-num ${day.isToday ? 'active-day-circle' : ''}`}>
                              {String(day.dayNum).padStart(2, '0')}
                            </div>
                          </div>

                          <div className="timeline-bar-container">
                            <div className="timeline-bar-track">
                              {isAbsent ? (
                                <div className="timeline-absent-bar">
                                  <span>Absent</span>
                                </div>
                              ) : isWeekend ? (
                                <div className="timeline-weekend-bar">
                                  <span>Weekend</span>
                                </div>
                              ) : day.check_in ? (
                                <div 
                                  className="timeline-present-progress-bar"
                                  style={{ width: getProgressWidthPercent(day) }}
                                >
                                  <span className="progress-dot start"></span>
                                  <span className="progress-dot end"></span>
                                </div>
                              ) : (
                                <div className="timeline-weekend-bar" style={{ background: '#f9fafb', border: '1px dotted #e5e7eb' }}>
                                  <span style={{ color: '#9ca3af' }}>Yet to check-in</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="timeline-hours-worked">
                            <span className="hours-worked-num">{hoursWorked}</span>
                            <span className="hours-worked-lbl">Hrs worked</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="timeline-time-axes" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className="day-label-placeholder"></div>
                    <div className="axes-labels-list">
                      <span>10:30AM</span>
                      <span>11:30AM</span>
                      <span>12:30PM</span>
                      <span>01:30PM</span>
                      <span>02:30PM</span>
                      <span>03:30PM</span>
                      <span>04:30PM</span>
                      <span>05:30PM</span>
                      <span>06:30PM</span>
                    </div>
                    <div className="hours-label-placeholder"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 3c. Leave Tracker View */}
            {selectedTab === 'leaves' && (
              <div className="admin-leave-cards-wrapper">
                <div className="leave-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {leaveBalances.map((type) => (
                    <div key={type.id} className="leave-card" style={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                      <div className="leave-card-header">
                        <span className="leave-card-title" style={{ fontSize: '12px' }}>{type.name}</span>
                      </div>
                      <div className="leave-card-details">
                        <div className="detail-row">
                          <span className="detail-label">Available</span>
                          <span className={`detail-val ${type.available > 0 ? 'highlight-green' : ''}`}>
                            {type.name === 'Leave Without Pay' ? '-' : type.available}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Booked</span>
                          <span className="detail-val">{type.booked}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '12px' }}>Leave Applications History</h4>
                  {leaveHistory.length === 0 ? (
                    <div style={{ padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                      No leaves applied yet by this employee.
                    </div>
                  ) : (
                    <table className="admin-leaves-history-table">
                      <thead>
                        <tr>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveHistory.map((app) => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                            <td>{new Date(app.start_date).toLocaleDateString()}</td>
                            <td>{new Date(app.end_date).toLocaleDateString()}</td>
                            <td>{app.reason || '-'}</td>
                            <td>
                              <span className={`admin-leaves-history-status status-${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Slide-out Drawer overlay for Add Employee */}
      {isDrawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="admin-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <h3>Register New Employee</h3>
              <button className="admin-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployeeSubmit} className="admin-drawer-body">
              {alertMsg && (
                <div className={`admin-alert-success ${alertMsg.type === 'error' ? 'admin-alert-error' : ''}`} style={alertMsg.type === 'error' ? { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' } : {}}>
                  {alertMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                  <span>{alertMsg.text}</span>
                </div>
              )}

              <div className="admin-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chetan Ghanghav"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  placeholder="e.g. SPWHI012"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Role / Designation *</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                    <option value="Developer">Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Reporting Manager">Reporting Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="HR Manager">HR Manager</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Department *</label>
                  <select value={formDept} onChange={(e) => setFormDept(e.target.value)}>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Administration">Administration</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@spwhitel.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    placeholder="91-XXXXXXXXXX"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Work Phone</label>
                  <input
                    type="text"
                    placeholder="XXXXXXXXXX"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Shift Timing</label>
                <select value={formShift} onChange={(e) => setFormShift(e.target.value)}>
                  <option value="General (10:30 AM - 06:30 PM)">General (10:30 AM - 06:30 PM)</option>
                  <option value="Night Shift (09:00 PM - 05:00 AM)">Night Shift (09:00 PM - 05:00 AM)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>About Employee</label>
                <textarea
                  placeholder="Brief summary..."
                  value={formAbout}
                  onChange={(e) => setFormAbout(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submitting inside body handles layout better */}
              <div style={{ display: 'none' }}>
                <button type="submit" id="admin-submit-hidden">Submit</button>
              </div>
            </form>
            
            <div className="admin-drawer-footer">
              <button type="button" className="btn-drawer-cancel" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-drawer-submit" 
                onClick={() => document.getElementById('admin-submit-hidden').click()}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
