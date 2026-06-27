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
import { employeeApi } from '../apis/employeeApi';
import { attendanceApi } from '../apis/attendanceApi';
import { leaveApi } from '../apis/leaveApi';
import { projectApi } from '../apis/projectApi';
import EditEmployeeProfileModal from './EditEmployeeProfileModal';

const getAvatarColor = (name) => {
  const colors = [
    { bg: 'rgba(79, 70, 229, 0.1)', text: '#4f46e5' },   // Indigo
    { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },  // Green
    { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },  // Amber
    { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },  // Blue
    { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' },  // Purple
    { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },  // Pink
    { bg: 'rgba(20, 184, 166, 0.1)', text: '#14b8a6' }   // Teal
  ];
  if (!name) return colors[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function AdminPanel() {
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('sarvo_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTab, setSelectedTab] = useState('profile'); // profile, attendance, leaves
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(true);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formRole, setFormRole] = useState(''); // Designation ID
  const [formUserRole, setFormUserRole] = useState('Admin'); // System Role
  const [formDept, setFormDept] = useState(''); // Department ID
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTimezone, setFormTimezone] = useState('India Standard Time (GMT+05:30)');
  const [formShift, setFormShift] = useState('General (10:30 AM - 06:30 PM)');
  const [formAbout, setFormAbout] = useState('');

  // Organization Meta (Departments, Designations)
  const [orgMeta, setOrgMeta] = useState({ departments: [], designations: [] });
  
  // Tracked records state
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [adminRemarksMap, setAdminRemarksMap] = useState({});
  const [adminApprovingIds, setAdminApprovingIds] = useState({});

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null);

  // Project filtering state
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [projectMemberEmployeeIds, setProjectMemberEmployeeIds] = useState([]);

  // Load Employees and Org Meta
  const fetchEmployeesAndMeta = async () => {
    try {
      const data = await employeeApi.getEmployees();
      const mappedEmps = data
        .filter(emp => emp.role?.toLowerCase() !== 'student')
        .map(emp => ({
          id: emp.id,
          employee_id: emp.employee_code,
          name: `${emp.first_name} ${emp.last_name}`,
          role: emp.designation_name || emp.role || 'Employee',
          department: emp.department_name || 'Engineering',
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (emp.id * 100000)}?w=150` || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          status: emp.status || 'Yet to check-in',
          email: emp.email,
          mobile: emp.phone || '9999999999',
          work_phone: emp.phone || '9999999999',
          timezone: 'India Standard Time (GMT+05:30)',
          about_me: 'Registered employee',
          shift: 'General (10:30 AM - 06:30 PM)'
        }));
      setEmployees(mappedEmps);

      const meta = await employeeApi.getMeta();
      setOrgMeta(meta);
      if (meta.departments.length > 0) setFormDept(meta.departments[0].id);
      if (meta.designations.length > 0) setFormRole(meta.designations[0].id);

      const projs = await projectApi.getProjects();
      setProjectsList(projs || []);

      setIsBackendLive(true);
    } catch (err) {
      console.error('Failed to load employees or metadata:', err);
      setIsBackendLive(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndMeta();
  }, []);

  useEffect(() => {
    if (selectedProjectFilter === 'all') {
      setProjectMemberEmployeeIds([]);
      return;
    }
    const fetchProjectMembers = async () => {
      try {
        const members = await projectApi.getProjectMembers(selectedProjectFilter);
        const empIds = (members || []).map(m => m.employee_id || m.student_employee_id).filter(id => id);
        setProjectMemberEmployeeIds(empIds);
      } catch (err) {
        console.error('Failed to fetch project members:', err);
      }
    };
    fetchProjectMembers();
  }, [selectedProjectFilter]);

  const fetchProfileDetails = async (empId) => {
    try {
      const profile = await employeeApi.getEmployeeProfile(empId);
      setSelectedEmployeeProfile(profile);
    } catch (e) {
      console.error('Failed to fetch detailed profile:', e);
    }
  };

  // Fetch record tracking details when selected employee or tab changes
  useEffect(() => {
    if (!selectedEmployee) return;

    const fetchSelectedDetails = async () => {
      const empId = selectedEmployee.id;
      
      // Fetch Attendance logs for selected employee
      try {
        const attData = await attendanceApi.getWeeklyLogs(empId);
        
        // Map to last 7 days
        const daysOfWeek = [];
        const shortDaysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          const dayOfWeek = d.getDay();
          
          const log = attData.find(l => {
            const lDateStr = new Date(l.date).getFullYear() + '-' + String(new Date(l.date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(l.date).getDate()).padStart(2, '0');
            return lDateStr === dateStr;
          });
          
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isToday = i === 0;
          
          let status = 'Absent';
          if (log) {
            status = log.status === 'present' ? 'Present' : 'Absent';
          } else if (isWeekend) {
            status = 'Weekend';
          }
          
          daysOfWeek.push({
            date: dateStr,
            dayName: shortDaysNames[dayOfWeek],
            dayNum: d.getDate(),
            isToday,
            status,
            check_in: log ? log.check_in_time : null,
            check_out: log ? log.check_out_time : null,
            total_hours: log ? Number(log.total_hours) : 0.00
          });
        }
        setAttendanceLogs(daysOfWeek);
      } catch (e) {
        console.error('Failed to fetch attendance logs:', e);
      }

      // Fetch Leaves
      try {
        const balancesData = await leaveApi.getBalances(empId);
        setLeaveBalances(balancesData);
        
        const historyData = await leaveApi.listApplications(empId);
        setLeaveHistory(historyData);
      } catch (e) {
        console.error('Failed to fetch leave info:', e);
      }

      // Fetch detailed profile
      await fetchProfileDetails(selectedEmployee.id);
    };

    fetchSelectedDetails();
  }, [selectedEmployee, selectedTab]);

  const getProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = [
      profile.date_of_birth,
      profile.gender,
      profile.blood_group,
      profile.current_address,
      profile.parent_contact,
      profile.qualification,
      profile.university,
      profile.tenth_certificate,
      profile.twelfth_certificate,
      profile.bachelors_certificate
    ];
    const filled = fields.filter(val => 
      val !== null && 
      val !== undefined && 
      String(val).trim() !== '' && 
      String(val).trim() !== 'Not Submitted'
    ).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Master Search Filtering
  const filteredEmployees = employees.filter(emp => {
    if (selectedProjectFilter !== 'all' && !projectMemberEmployeeIds.includes(emp.id)) {
      return false;
    }
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

    const names = formName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';

    const empData = {
      employeeCode: formId,
      firstName,
      lastName,
      email: formEmail || `${firstName.toLowerCase()}@sarvo.com`,
      phone: formMobile || formPhone || '9999999999',
      role: formUserRole,
      departmentId: formDept,
      designationId: formRole
    };

    try {
      await employeeApi.addEmployee(empData);
      alert('registered successfull and credentials sent successfully');
      setAlertMsg({ type: 'success', text: 'registered successfull and credentials sent successfully' });
      await fetchEmployeesAndMeta();
      resetForm();
      setIsDrawerOpen(false);
      setAlertMsg(null);
    } catch (err) {
      alert(err.message || 'Failed to add employee.');
      setAlertMsg({ type: 'error', text: err.message || 'Failed to add employee.' });
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormId('');
    setFormUserRole('Admin');
    if (orgMeta.departments.length > 0) setFormDept(orgMeta.departments[0].id);
    if (orgMeta.designations.length > 0) setFormRole(orgMeta.designations[0].id);
    setFormEmail('');
    setFormMobile('');
    setFormPhone('');
    setFormAbout('');
  };

  const handleAdminStatusUpdate = async (applicationId, status) => {
    const remarks = adminRemarksMap[applicationId] || '';
    try {
      setAdminApprovingIds(prev => ({ ...prev, [applicationId]: true }));
      await leaveApi.updateStatus(applicationId, status, remarks);
      
      // Refresh leave history and balances
      if (selectedEmployee) {
        const empId = selectedEmployee.id;
        const balancesData = await leaveApi.getBalances(empId);
        setLeaveBalances(balancesData);
        
        const historyData = await leaveApi.listApplications(empId);
        setLeaveHistory(historyData);
      }
      
      setAdminRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[applicationId];
        return copy;
      });
    } catch (err) {
      alert(err.message || `Failed to update status to ${status}`);
    } finally {
      setAdminApprovingIds(prev => ({ ...prev, [applicationId]: false }));
    }
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

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTimelineStyle = (day) => {
    if (!day.check_in) return { left: '0%', width: '0%' };
    const dateParts = day.date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const dateNum = parseInt(dateParts[2], 10);
    
    const shiftStart = new Date(year, month, dateNum, 10, 30, 0, 0);
    const shiftEnd = new Date(year, month, dateNum, 18, 30, 0, 0);
    const totalShiftMs = shiftEnd - shiftStart;
    
    const checkInTime = new Date(day.check_in);
    const checkOutTime = day.check_out ? new Date(day.check_out) : new Date();
    
    const leftMs = checkInTime - shiftStart;
    let leftPercent = (leftMs / totalShiftMs) * 100;
    if (leftPercent < 0) leftPercent = 0;
    if (leftPercent > 100) leftPercent = 100;
    
    const durationMs = checkOutTime - checkInTime;
    let widthPercent = (durationMs / totalShiftMs) * 100;
    if (widthPercent < 0) widthPercent = 0;
    if (leftPercent + widthPercent > 100) {
      widthPercent = 100 - leftPercent;
    }
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
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
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
          <div className="admin-search-input-box" style={{ flexGrow: 1 }}>
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

          <div className="project-filter-dropdown-container">
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="admin-project-select"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                minWidth: '180px',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
            >
              <option value="all">All Projects</option>
              {projectsList.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
          </div>
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
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '16px' }}>
            {filteredEmployees.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No employees match your search query.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--primary-bg)' }}>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee ID</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designation</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => {
                      const isCurrentUser = emp.id === currentUser?.id;
                      return (
                        <tr 
                          key={emp.employee_id} 
                          onClick={() => setSelectedEmployee(emp)}
                          style={{ 
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            backgroundColor: isCurrentUser ? 'rgba(0, 123, 245, 0.08)' : 'transparent'
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {(() => {
                              const colors = getAvatarColor(emp.name);
                              return (
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12.5px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  border: `1px solid ${colors.text}33`,
                                  flexShrink: 0
                                }}>
                                  {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                                </div>
                              );
                            })()}
                            <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {emp.name}
                              {isCurrentUser && (
                                <span style={{
                                  fontSize: '10px',
                                  backgroundColor: 'var(--active-blue, #007bf5)',
                                  color: '#ffffff',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  letterSpacing: '0.5px'
                                }}>
                                  You
                                </span>
                              )}
                            </strong>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>{emp.employee_id}</td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>{emp.role}</td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>{emp.department}</td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>{emp.email}</td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>{emp.mobile}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span className={`admin-card-status-pill ${emp.status === 'Checked-in' ? 'status-checked-in' : ''}`}>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-track-view-wrapper">
          {/* Back button and profile summary */}
          <div className="admin-track-back-bar">
            <button className="btn-track-back" onClick={() => { setSelectedEmployee(null); setSelectedEmployeeProfile(null); }}>
              <ArrowLeft size={16} />
              Back to Employee List
            </button>
          </div>

          <div className="admin-track-profile-summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {(() => {
                const colors = getAvatarColor(selectedEmployee.name);
                return (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: `1px solid ${colors.text}33`,
                    flexShrink: 0
                  }}>
                    {selectedEmployee.name ? selectedEmployee.name.charAt(0).toUpperCase() : 'E'}
                  </div>
                );
              })()}
              <div className="admin-track-intro">
                <span className="admin-track-name">{selectedEmployee.name}</span>
                <span className="admin-track-meta">{selectedEmployee.employee_id} · {selectedEmployee.role} · {selectedEmployee.department}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* Circular progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', width: '42px', height: '42px' }}>
                  <svg width="42" height="42" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="none" 
                      stroke="var(--active-blue)" 
                      strokeWidth="3" 
                      strokeDasharray={`${getProfileCompletion(selectedEmployeeProfile)} ${100 - getProfileCompletion(selectedEmployeeProfile)}`}
                      strokeDashoffset="0"
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--text-main)'
                  }}>
                    {getProfileCompletion(selectedEmployeeProfile)}%
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Profile Completion</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Required details updated</span>
                </div>
              </div>

              <button 
                className="btn-add-employee" 
                onClick={() => setIsEditProfileOpen(true)}
                style={{ padding: '8px 16px', fontSize: '12px', height: 'fit-content' }}
              >
                Complete Profile
              </button>
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
                {/* 1. Personal Details */}
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
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Date of Birth</span>
                    <span className="admin-profile-value">
                      {selectedEmployeeProfile?.date_of_birth 
                        ? new Date(selectedEmployeeProfile.date_of_birth).toLocaleDateString() 
                        : '-'}
                    </span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Gender</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.gender || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Blood Group</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.blood_group || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Parent Contact</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.parent_contact || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Emergency Name</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.emergency_contact_name || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Emergency Phone</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.emergency_contact_phone || '-'}</span>
                  </div>
                  <div className="admin-profile-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span className="admin-profile-label">Current Address</span>
                    <span className="admin-profile-value" style={{ fontWeight: 500, textAlign: 'left' }}>
                      {selectedEmployeeProfile?.current_address || '-'}
                    </span>
                  </div>
                  <div className="admin-profile-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span className="admin-profile-label">Permanent Address</span>
                    <span className="admin-profile-value" style={{ fontWeight: 500, textAlign: 'left' }}>
                      {selectedEmployeeProfile?.permanent_address || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. Academic Details */}
                <div className="admin-profile-card-section">
                  <h4 className="admin-profile-section-title">Academic Details</h4>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Highest Qualification</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.qualification || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">University / Board</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.university || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Passing Year</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.passing_year || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Percentage / CGPA</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.percentage_marks || '-'}</span>
                  </div>
                </div>

                {/* 3. Documents & Links */}
                <div className="admin-profile-card-section">
                  <h4 className="admin-profile-section-title">Documents & Links</h4>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">PAN Card Number</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.pan_card_number || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Aadhaar Card Number</span>
                    <span className="admin-profile-value">{selectedEmployeeProfile?.aadhar_card_number || '-'}</span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">LinkedIn Profile</span>
                    <span className="admin-profile-value">
                      {selectedEmployeeProfile?.linkedin_profile ? (
                        <a 
                          href={selectedEmployeeProfile.linkedin_profile} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--active-blue)', textDecoration: 'underline' }}
                        >
                          View Profile
                        </a>
                      ) : '-'}
                    </span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">10th Certificate</span>
                    <span className="admin-profile-value">
                      {selectedEmployeeProfile?.tenth_certificate || 'Not Submitted'}
                    </span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">12th Certificate</span>
                    <span className="admin-profile-value">
                      {selectedEmployeeProfile?.twelfth_certificate || 'Not Submitted'}
                    </span>
                  </div>
                  <div className="admin-profile-row">
                    <span className="admin-profile-label">Bachelor's Certificate</span>
                    <span className="admin-profile-value">
                      {selectedEmployeeProfile?.bachelors_certificate || 'Not Submitted'}
                    </span>
                  </div>
                </div>

                {/* 4. Settings & About */}
                <div className="admin-profile-card-section" style={{ gridColumn: 'span 3' }}>
                  <h4 className="admin-profile-section-title">Work & Shift Settings</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                    <div className="admin-profile-row" style={{ borderBottom: 'none' }}>
                      <span className="admin-profile-label">Shift Details:</span>
                      <span className="admin-profile-value">{selectedEmployee.shift}</span>
                    </div>
                    <div className="admin-profile-row" style={{ borderBottom: 'none' }}>
                      <span className="admin-profile-label">Timezone:</span>
                      <span className="admin-profile-value">{selectedEmployee.timezone}</span>
                    </div>
                    <div className="admin-profile-row" style={{ borderBottom: 'none' }}>
                      <span className="admin-profile-label">Status:</span>
                      <span className="admin-profile-value">{selectedEmployee.status}</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <h5 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '6px' }}>About Employee</h5>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#4b5563' }}>{selectedEmployee.about_me}</p>
                  </div>
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
                                  style={getTimelineStyle(day)}
                                >
                                  <span className="progress-dot start">
                                    <span className="dot-time-label">{formatTime(day.check_in)}</span>
                                  </span>
                                  <span className="progress-dot end">
                                    <span className="dot-time-label">
                                      {day.check_out ? formatTime(day.check_out) : 'Active'}
                                    </span>
                                  </span>
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
                          <th>Remarks</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveHistory.map((app) => {
                          const isUpdating = adminApprovingIds[app.id];
                          return (
                            <tr key={app.id}>
                              <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                              <td>{new Date(app.start_date).toLocaleDateString()}</td>
                              <td>{new Date(app.end_date).toLocaleDateString()}</td>
                              <td>{app.reason || '-'}</td>
                              <td>
                                {app.status === 'pending' ? (
                                  <input 
                                    type="text" 
                                    placeholder="Remarks..." 
                                    style={{
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      width: '120px'
                                    }}
                                    value={adminRemarksMap[app.id] || ''}
                                    onChange={(e) => setAdminRemarksMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                                    disabled={isUpdating}
                                  />
                                ) : (
                                  app.approval_remarks || '-'
                                )}
                              </td>
                              <td>
                                <span className={`admin-leaves-history-status status-${app.status}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td>
                                {app.status === 'pending' ? (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button 
                                      onClick={() => handleAdminStatusUpdate(app.id, 'approved')}
                                      style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                      }}
                                      disabled={isUpdating}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleAdminStatusUpdate(app.id, 'rejected')}
                                      style={{
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                      }}
                                      disabled={isUpdating}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Reviewed
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
                  placeholder="Enter Full Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  placeholder="Enter Employee ID"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Role *</label>
                  <select value={formUserRole} onChange={(e) => setFormUserRole(e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Intern">Intern</option>
                    <option value="Mentor">Mentor</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Designation *</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                    {orgMeta.designations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Department *</label>
                <select value={formDept} onChange={(e) => setFormDept(e.target.value)}>
                  {orgMeta.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
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

      {isEditProfileOpen && (
        <EditEmployeeProfileModal
          employee={selectedEmployee}
          onClose={() => setIsEditProfileOpen(false)}
          onUpdateSuccess={() => {
            fetchProfileDetails(selectedEmployee.id);
            fetchEmployeesAndMeta();
          }}
        />
      )}
    </div>
  );
}
