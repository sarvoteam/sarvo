import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Users, 
  Clock, 
  Globe, 
  Mail, 
  Smartphone, 
  Phone, 
  Pencil, 
  Check, 
  X,
  Sun,
  Waves,
  Baby,
  Stethoscope,
  Plus,
  Briefcase,
  Folder,
  TrendingUp,
  Cpu,
  Award,
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import foliageBanner from '../assets/foliage_banner.png';
import { dashboardApi } from '../apis/dashboardApi';
import { employeeApi } from '../apis/employeeApi';
import { cohortApi } from '../apis/cohortApi';
import { leaveApi } from '../apis/leaveApi';
import { attendanceApi } from '../apis/attendanceApi';

const DEFAULT_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', available: 4, booked: 0, icon_type: 'sun', color_theme: 'blue' },
  { id: 2, name: 'Compensatory Off', available: 0, booked: 0, icon_type: 'co', color_theme: 'green' },
  { id: 3, name: 'Earned Leave', available: 12, booked: 0, icon_type: 'clock', color_theme: 'green-light' },
  { id: 4, name: 'Leave Without Pay', available: 0, booked: 0, icon_type: 'lwop', color_theme: 'red' },
  { id: 5, name: 'Paternity Leave', available: 0, booked: 0, icon_type: 'baby', color_theme: 'orange' },
  { id: 6, name: 'Sick Leave', available: 12, booked: 0, icon_type: 'cross', color_theme: 'purple' }
];

const THEME_MAP = {
  'Casual Leave': { icon_type: 'sun', color_theme: 'blue' },
  'Compensatory Off': { icon_type: 'co', color_theme: 'green' },
  'Earned Leave': { icon_type: 'clock', color_theme: 'green-light' },
  'Leave Without Pay': { icon_type: 'lwop', color_theme: 'red' },
  'Paternity Leave': { icon_type: 'baby', color_theme: 'orange' },
  'Sick Leave': { icon_type: 'cross', color_theme: 'purple' }
};

export default function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timerText, setTimerText] = useState('00 : 00 : 00');
  const [metrics, setMetrics] = useState(null);

  // Student Batch State
  const [studentBatch, setStudentBatch] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  
  // Profile Inner Tabs
  const [activeInnerTab, setActiveInnerTab] = useState('Attendance');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutMeText, setAboutMeText] = useState('');

  // Leave Tab States
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Add Employee Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formRole, setFormRole] = useState(''); // Designation ID
  const [formDept, setFormDept] = useState(''); // Department ID
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShift, setFormShift] = useState('General (10:30 AM - 06:30 PM)');
  const [formAbout, setFormAbout] = useState('');
  const [orgMeta, setOrgMeta] = useState({ departments: [], designations: [] });
  const [alertMsg, setAlertMsg] = useState(null);

  // Load organization metadata
  useEffect(() => {
    const fetchOrgMetadata = async () => {
      try {
        const meta = await employeeApi.getMeta();
        setOrgMeta(meta);
        if (meta.departments?.length > 0) setFormDept(meta.departments[0].id);
        if (meta.designations?.length > 0) setFormRole(meta.designations[0].id);
      } catch (err) {
        console.error('Failed to load org metadata:', err);
      }
    };
    fetchOrgMetadata();
  }, []);

  // Fetch student's cohort/batch data
  useEffect(() => {
    if (!employee || employee.role !== 'Student') return;
    const fetchStudentBatch = async () => {
      try {
        setBatchLoading(true);
        const allStudents = await cohortApi.getAllStudents();
        const me = allStudents.find(
          (s) => s.email?.toLowerCase() === employee.email?.toLowerCase()
        );
        if (!me || !me.cohort_id) return;

        const cohorts = await cohortApi.getCohorts();
        const myCohort = cohorts.find((c) => c.id === me.cohort_id);
        if (myCohort) {
          setStudentBatch({
            name: myCohort.name,
            startDate: myCohort.start_date
              ? new Date(myCohort.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'N/A',
            endDate: myCohort.end_date
              ? new Date(myCohort.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Ongoing',
            progress: myCohort.progress || 0,
            mentorName: myCohort.mentor_name || null,
            mentorTitle: myCohort.mentor_designation || 'Mentor',
          });
        }
      } catch (err) {
        console.error('Failed to fetch student batch:', err);
      } finally {
        setBatchLoading(false);
      }
    };
    fetchStudentBatch();
  }, [employee]);

  const resetAddEmployeeForm = () => {
    setFormName('');
    setFormId('');
    if (orgMeta.departments?.length > 0) setFormDept(orgMeta.departments[0].id);
    if (orgMeta.designations?.length > 0) setFormRole(orgMeta.designations[0].id);
    setFormEmail('');
    setFormMobile('');
    setFormPhone('');
    setFormAbout('');
  };

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formId || !formRole || !formDept) {
      setAlertMsg({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    const names = formName.trim().split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';

    const selectedDesignation = orgMeta.designations.find(d => Number(d.id) === Number(formRole));
    const roleValue = selectedDesignation?.name === 'Intern' ? 'Intern' : 'Employee';

    const empData = {
      employeeCode: formId,
      firstName,
      lastName,
      email: formEmail || `${firstName.toLowerCase()}@sarvo.com`,
      phone: formMobile || formPhone || '9999999999',
      role: roleValue,
      departmentId: Number(formDept),
      designationId: Number(formRole)
    };

    try {
      await employeeApi.addEmployee(empData);
      setAlertMsg({ type: 'success', text: 'Employee added successfully!' });
      
      // Reload admin metrics dynamically!
      const data = await dashboardApi.getAdminMetrics();
      setMetrics(data);

      resetAddEmployeeForm();
      setTimeout(() => {
        setIsDrawerOpen(false);
        setAlertMsg(null);
      }, 1500);
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to add employee.' });
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const balances = await leaveApi.getBalances();
      const mapped = balances.map(b => {
        const theme = THEME_MAP[b.leave_type_name] || { icon_type: 'sun', color_theme: 'blue' };
        return {
          id: b.leave_type_id,
          leave_balance_id: b.id,
          name: b.leave_type_name,
          available: Number(b.allocated_days) - Number(b.used_days),
          booked: Number(b.used_days),
          icon_type: theme.icon_type,
          color_theme: theme.color_theme
        };
      });
      setLeaveTypes(mapped);
      
      const allowed = mapped.filter(t => t.name !== 'Leave Without Pay' && t.name !== 'Compensatory Off');
      if (allowed.length > 0) {
        setSelectedLeaveTypeId(allowed[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch leave balances:', err);
    }
  };

  const fetchAttendanceLogs = async () => {
    try {
      const statusRes = await attendanceApi.getTodayStatus();
      
      setEmployee(prev => {
        if (!prev) return prev;
        let statusText = 'Yet to check-in';
        if (statusRes.checkedIn && !statusRes.checkedOut) {
          statusText = 'Checked-in';
        } else if (statusRes.checkedIn && statusRes.checkedOut) {
          statusText = 'Checked-out';
        }
        return {
          ...prev,
          status: statusText
        };
      });

      const backendLogs = await attendanceApi.getWeeklyLogs();
      
      const daysOfWeek = [];
      const shortDaysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const dayOfWeek = d.getDay();
        
        const log = backendLogs.find(l => {
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
          shift_name: 'General',
          total_hours: log ? Number(log.total_hours) : 0.00
        });
      }
      
      setAttendance(daysOfWeek);
    } catch (err) {
      console.error('Failed to fetch attendance logs:', err);
    }
  };

  // Fetch initial user data
  useEffect(() => {
    const savedUser = localStorage.getItem('sarvo_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setEmployee(parsed);
      setAboutMeText(parsed.about_me || '');
      
      if (parsed.role === 'Admin') {
        dashboardApi.getAdminMetrics()
          .then(data => setMetrics(data))
          .catch(err => console.error('Failed to fetch admin metrics:', err));
      }
    }

    fetchAttendanceLogs();
    fetchLeaveBalances();
  }, []);

  // Set up live timer tick
  useEffect(() => {
    let interval = null;

    if (employee && employee.status === 'Checked-in') {
      const updateTimer = () => {
        const todayLog = attendance.find(log => log.isToday);
        if (todayLog && todayLog.check_in) {
          const diffMs = new Date() - new Date(todayLog.check_in);
          if (diffMs > 0) {
            const secs = Math.floor((diffMs / 1000) % 60);
            const mins = Math.floor((diffMs / (1000 * 60)) % 60);
            const hrs = Math.floor((diffMs / (1000 * 60 * 60)));
            
            const formatNum = (n) => String(n).padStart(2, '0');
            setTimerText(`${formatNum(hrs)} : ${formatNum(mins)} : ${formatNum(secs)}`);
          } else {
            setTimerText('00 : 00 : 00');
          }
        } else {
          setTimerText('00 : 00 : 00');
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimerText('00 : 00 : 00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [employee, attendance]);

  const getMockWeeklyLogs = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    
    const logs = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      
      let status = 'Absent';
      if (dateStr === todayStr) {
        status = 'Yet to check-in';
      } else if (dateStr > todayStr) {
        status = '-';
      } else if (date.getDay() === 0 || date.getDay() === 6) {
        status = 'Weekend';
      }

      logs.push({
        date: dateStr,
        dayNum: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        check_in: null,
        check_out: null,
        status: status,
        shift_name: 'General',
        isToday: dateStr === todayStr
      });
    }

    return logs;
  };

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      await fetchAttendanceLogs();
    } catch (err) {
      window.alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      await fetchAttendanceLogs();
    } catch (err) {
      window.alert(err.message || 'Check-out failed');
    }
  };

  const handleSaveAboutMe = () => {
    const updatedEmp = { ...employee, about_me: aboutMeText };
    setEmployee(updatedEmp);
    localStorage.setItem('sarvo_current_user', JSON.stringify(updatedEmp));
    setIsEditingAbout(false);
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedLeaveTypeId) return;

    try {
      await leaveApi.applyLeave({
        leaveTypeId: selectedLeaveTypeId,
        startDate,
        endDate,
        reason
      });
      alert('Leave applied successfully!');
      closeLeaveModal();
      await fetchLeaveBalances();
    } catch (err) {
      alert(err.message || 'Leave application failed');
    }
  };

  const closeLeaveModal = () => {
    setIsLeaveModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const renderLeaveIcon = (type) => {
    switch (type) {
      case 'sun': return <Sun size={18} className="icon-blue" />;
      case 'co': return <span className="icon-co-txt" style={{ fontSize: '11px' }}>CO</span>;
      case 'clock': return <Clock size={18} className="icon-green" />;
      case 'lwop': return <Waves size={18} className="icon-red" />;
      case 'baby': return <Baby size={18} className="icon-orange" />;
      case 'cross': return <Stethoscope size={18} className="icon-purple" />;
      default: return <Sun size={18} />;
    }
  };

  const formatRowTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCheckedIn = employee?.status === 'Checked-in';
  const isCheckedOut = employee?.status === 'Checked-out';

  // Render role layout
  const isSystemAdmin = employee?.role === 'Admin';
  const isMentor = employee?.role === 'Mentor';
  const isStudent = employee?.role === 'Student';

  // VIEW 1: SYSTEM ADMIN DASHBOARD
  if (isSystemAdmin) {
    return (
      <div className="main-content" style={{ padding: '24px', textAlign: 'left' }}>
        
        {/* Banner */}
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, #0f1c3f, #162447)', padding: '20px 24px', borderRadius: '14px', color: 'white' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Welcome Back, Administrative Portal</h2>
            <p style={{ fontSize: '12.5px', opacity: 0.8, marginTop: '4px' }}>Analyze performance ratings, batch completion speeds, and active placement pipelines.</p>
          </div>
          <Sparkles size={28} style={{ color: '#00d2ff', opacity: 0.9 }} />
        </div>

        {/* Core metrics cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Interns</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              {metrics ? `${metrics.activeInterns?.count} Interns` : '-'}
            </h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {metrics ? (metrics.activeInterns?.subText || '-') : '-'}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--active-blue)', marginTop: '4px' }}>
              {metrics ? `${metrics.activeStudents?.count} Students` : '-'}
            </h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {metrics ? (metrics.activeStudents?.subText || '-') : '-'}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Training Batches</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--active-blue)', marginTop: '4px' }}>
              {metrics ? `${metrics.trainingBatches?.count} Active` : '-'}
            </h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Avg progress: {metrics?.trainingBatches?.avgProgress !== undefined ? `${metrics.trainingBatches.avgProgress}%` : '-'}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Completion</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
              {metrics ? `${metrics.taskCompletion?.rate}%` : '-'}
            </h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {metrics ? (metrics.taskCompletion?.subText || '-') : '-'}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placement Ratio</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              {metrics ? `${metrics.placementRatio?.rate}%` : '-'}
            </h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {metrics ? (metrics.placementRatio?.subText || '-') : '-'}
            </p>
          </div>
        </div>

        {/* Sub grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '14px' }}>Administrative Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--primary-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Award size={18} style={{ color: '#10b981', margin: '0 auto 6px' }} />
                <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-main)' }}>Certificates</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Validate graduations</span>
              </div>
              <div style={{ padding: '12px', background: 'var(--primary-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <Cpu size={18} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
                <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-main)' }}>ATS Scanner</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Resume checkers</span>
              </div>
            </div>
          </div>

          {/* Recent Activities list */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '14px' }}>System Activities Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(metrics?.activities ?? [
                { text: 'Intern Aditya Patil submitted E-Commerce project repository.', desc: 'Fullstack Cohort • Awaiting mentor review', time: '10 mins ago' },
                { text: 'Placement openings listed: associate engineer at TechnoCorp.', desc: '₹8.0 LPA package • DevOps skills', time: '1 hour ago' },
                { text: 'Weekly performance grades updated for UI/UX Design Cohort.', desc: 'Cohort average: 82% efficiency rating', time: '3 hours ago' }
              ]).map((act, i) => (
                <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', background: 'var(--primary-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-main)' }}>{act.text}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{act.desc}</span>
                  </div>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer overlay for Add Employee */}
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
                      {orgMeta.designations.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Department *</label>
                    <select value={formDept} onChange={(e) => setFormDept(e.target.value)}>
                      {orgMeta.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
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

  // VIEW 2: MENTOR / EMPLOYEE DASHBOARD
  if (isMentor) {
    return (
      <div className="main-content" style={{ padding: '24px', textAlign: 'left' }}>
        
        {/* Banner */}
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'linear-gradient(135deg, #0e172c, #1a2f5a)', padding: '20px 24px', borderRadius: '14px', color: 'white' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Mentor Space</h2>
            <p style={{ fontSize: '12.5px', opacity: 0.8, marginTop: '4px' }}>Review daily logs, check-ins, compile reviews, and provide feedback.</p>
          </div>
          <Users size={28} style={{ color: '#f59e0b', opacity: 0.9 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Interns</span>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>4 Active</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>All-time grads: 28</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unreviewed daily logs</span>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>2 Pending</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Review before EOD</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unreviewed projects</span>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--active-blue)', marginTop: '4px' }}>1 Submissions</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Grading rating workspace ready</p>
          </div>
        </div>

        {/* Assigned Interns list */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '14px' }}>Assigned Interns Roster</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Aditya Patil', email: 'intern@sarvo.com', progress: 75, status: 'Checked-in' },
              { name: 'Neha Sharma', email: 'neha@gmail.com', progress: 50, status: 'Checked-in' },
              { name: 'Rajesh Kumar', email: 'rajesh@gmail.com', progress: 30, status: 'Yet to check-in' }
            ].map((intern, idx) => (
              <div key={idx} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--active-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                    {intern.name.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{intern.name}</strong>
                    <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{intern.email}</span>
                  </div>
                </div>

                <div style={{ width: '150px' }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <span>Syllabus Progress</span>
                    <span>{intern.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${intern.progress}%`, height: '100%', background: 'var(--active-blue)', borderRadius: '10px' }} />
                  </div>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: intern.status === 'Checked-in' ? 'rgba(16,185,129,0.1)' : 'var(--border-color)',
                  color: intern.status === 'Checked-in' ? '#10b981' : 'var(--text-muted)'
                }}>
                  {intern.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // VIEW 3: STUDENT ACADEMIC DASHBOARD
  if (isStudent) {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
    const firstName = employee?.first_name || employee?.name?.split(' ')[0] || 'Student';

    return (
      <div className="main-content" style={{ padding: '0', overflow: 'auto' }}>

        {/* Hero Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2044 40%, #0a2a5c 70%, #0f3460 100%)',
          padding: '32px 36px 28px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '120px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0, 123, 245, 0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '60px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ background: 'rgba(0, 123, 245, 0.25)', border: '1px solid rgba(0, 123, 245, 0.4)', color: '#60a5fa', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                  🎓 STUDENT PORTAL
                </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11.5px' }}>{dayName}, {dateStr}</span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                {greeting}, {firstName}! 👋
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                {employee?.employee_id || 'SARVO_STU'} &nbsp;•&nbsp; {employee?.department || 'Engineering'} Department
              </p>
            </div>

            {/* Profile Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #007bf5 0%, #00d2ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, color: 'white',
                border: '3px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 20px rgba(0, 123, 245, 0.4)'
              }}>
                {firstName.charAt(0)}
              </div>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)' }}>Active</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
            {[
              { label: 'Attendance', value: '82%', icon: '📅', color: '#10b981', desc: 'This month' },
              { label: 'LMS Progress', value: '68%', icon: '📚', color: '#60a5fa', desc: 'Course completion' },
              { label: 'Projects Done', value: '3/5', icon: '🗂️', color: '#f59e0b', desc: 'Assigned tasks' },
              { label: 'Batch Rank', value: '#4', icon: '🏆', color: '#a78bfa', desc: 'Out of 12 students' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px 16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Body */}
        <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'center' }}>

          {/* SINGLE COLUMN — Batch & Mentor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '480px' }}>

            {/* Batch & Mentor Info — Dynamic */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🏫</span> My Batch
              </h3>

              {batchLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[80, 60, 40].map((w, i) => (
                    <div key={i} style={{ height: '14px', width: `${w}%`, background: 'var(--border-color)', borderRadius: '6px', opacity: 0.5 }} />
                  ))}
                </div>
              ) : !studentBatch ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px', textAlign: 'center', background: 'var(--primary-bg)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  You are not currently assigned to any batch.
                </div>
              ) : (
                <>
                  <div style={{ background: 'linear-gradient(135deg, rgba(0,123,245,0.08), rgba(0,210,255,0.04))', border: '1px solid rgba(0,123,245,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{studentBatch.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Started {studentBatch.startDate} &nbsp;•&nbsp; Ends {studentBatch.endDate}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Batch Progress</span>
                        <span style={{ color: '#007bf5', fontWeight: 700 }}>{studentBatch.progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${studentBatch.progress}%`, height: '100%', background: 'linear-gradient(90deg, #007bf5, #00d2ff)', borderRadius: '10px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>

                  {studentBatch.mentorName && (
                    <>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Mentor</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--primary-bg)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #007bf5, #00d2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {studentBatch.mentorName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{studentBatch.mentorName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{studentBatch.mentorTitle}</div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>



          </div>
        </div>
      </div>
    );
  }

  // VIEW 4: INTERN DEFAULT DASHBOARD (timer, leave, logs summary)
  return (
    <div className="main-content">
      {/* Top Banner Cover */}
      <div className="foliage-banner-wrapper">
        <img 
          src={foliageBanner} 
          alt="Tropical Foliage Background" 
          className="foliage-banner" 
        />
        <button className="banner-dots-btn">···</button>
      </div>

      {/* Grid containing Sidebar Cards and Attendance Table */}
      <div className="dashboard-grid">
        
        {/* Left Column widgets */}
        <div className="left-column">
          
          {/* Main User Timer Card */}
          <div className="card profile-card">
            <div className="profile-avatar-wrapper">
              <img 
                src={employee?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"} 
                alt={employee?.name} 
                className="profile-avatar" 
              />
            </div>
            <div className="profile-id">{employee?.employee_id || 'SARVO_INT'} - {employee?.name}</div>
            <div className="profile-role">{employee?.role} • {employee?.department}</div>
            
            {employee?.role !== 'Student' ? (
              <>
                <div className={`profile-status ${isCheckedIn ? 'checked-in' : 'yet-checkin'}`}>
                  {employee?.status}
                </div>

                <div className="profile-timer">
                  {timerText}
                </div>

                <button 
                  className={`btn-checkin ${isCheckedIn ? 'active' : ''} ${isCheckedOut ? 'disabled' : ''}`}
                  onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                  disabled={isCheckedOut}
                >
                  {isCheckedOut ? 'Checked-out' : (isCheckedIn ? 'Check-out' : 'Check-in')}
                </button>
              </>
            ) : (
              <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Student Training Space (Read-Only)
              </div>
            )}
          </div>

          {/* Department / Manager Widget */}
          <div className="card">
            <div className="small-card-title">Assigned Mentor</div>
            <div className="mini-profile-item">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" 
                alt="Rohit Ghanghav" 
                className="mini-avatar" 
              />
              <div className="mini-info" style={{ textAlign: 'left' }}>
                <div className="mini-name">Rohit Ghanghav</div>
                <div className="mini-title">SARVO002 - Lead Fullstack</div>
                <div className="mini-status checked-in">
                  Online
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column Attendance Sheet */}
        <div className="right-column">
          {/* Sub Tab Bar */}
          <div className="tabs-container">
            <div className="tabs-list">
              {['Attendance', 'Profile', 'Leave'].map((tab) => (
                <button 
                  key={tab} 
                  className={`tab-btn ${tab === activeInnerTab ? 'active' : ''}`}
                  onClick={() => setActiveInnerTab(tab)}
                >
                  {tab}
                </button>
              ))}
              <button className="tab-btn">···</button>
            </div>
            
            <button className="tab-filter-btn">
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Content Body based on tab selection */}
          {activeInnerTab === 'Attendance' ? (
            <div className="attendance-body">
              <div className="attendance-section-title">This Week's Checkin Logs</div>
              
              <div className="attendance-list">
                {attendance.map((day) => {
                  const checkInFormatted = formatRowTime(day.check_in);
                  const checkOutFormatted = formatRowTime(day.check_out);
                  
                  const isAbsent = day.status === 'Absent';
                  const isPresent = day.status === 'Present';
                  const isWeekend = day.status === 'Weekend';
                  const isToday = day.isToday;

                  return (
                    <div 
                      key={day.date} 
                      className={`attendance-row ${isToday ? 'active-day' : ''}`}
                    >
                      <div className="day-column">
                        <span className="day-name">{day.dayName}</span>
                        <div className="day-circle">
                          {String(day.dayNum).padStart(2, '0')}
                        </div>
                      </div>

                      <div className="shift-column" style={{ textAlign: 'left' }}>
                        <span className="shift-title">{day.shift_name}</span>
                        <span className="shift-time">10:30 AM - 06:30 PM</span>
                      </div>

                      <div className="status-column" style={{ textAlign: 'left' }}>
                        {isAbsent ? (
                          <>
                            <span className="status-text absent">No log details</span>
                            <span className="status-desc absent">Absent</span>
                          </>
                        ) : isWeekend ? (
                          <>
                            <span className="status-text yet-checkin">Weekend</span>
                            <span className="status-desc">-</span>
                          </>
                        ) : isPresent ? (
                          <>
                            <span className="status-text present">
                              {checkInFormatted} {checkOutFormatted ? ` - ${checkOutFormatted}` : ' (On-going)'}
                            </span>
                            <span className="status-desc present">Present</span>
                          </>
                        ) : (
                          <>
                            <span className="status-text yet-checkin">Yet to check-in</span>
                            <span className="status-desc">-</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeInnerTab === 'Profile' ? (
            <div className="profile-tab-body" style={{ textAlign: 'left' }}>
              <div className="profile-info-grid">
                <div className="profile-info-box">
                  <div className="profile-box-icon"><Users size={18} /></div>
                  <div className="profile-box-details">
                    <span className="profile-box-lbl">Department</span>
                    <span className="profile-box-val">{employee?.department || 'Engineering'}</span>
                  </div>
                </div>
                <div className="profile-info-box">
                  <div className="profile-box-icon"><Clock size={18} /></div>
                  <div className="profile-box-details">
                    <span className="profile-box-lbl">Shift</span>
                    <span className="profile-box-val">{employee?.shift || 'General (10:30 AM - 06:30 PM)'}</span>
                  </div>
                </div>
                <div className="profile-info-box">
                  <div className="profile-box-icon"><Globe size={18} /></div>
                  <div className="profile-box-details">
                    <span className="profile-box-lbl">Time zone</span>
                    <span className="profile-box-val">India Standard Time (GMT+05:30)</span>
                  </div>
                </div>
                <div className="profile-info-box">
                  <div className="profile-box-icon"><Mail size={18} /></div>
                  <div className="profile-box-details">
                    <span className="profile-box-lbl">Email address</span>
                    <span className="profile-box-val">{employee?.email || 'intern@sarvo.com'}</span>
                  </div>
                </div>
              </div>

              {/* About Me Section */}
              <div className="profile-about-section">
                <div className="about-header-row">
                  <span className="about-title">About Me</span>
                  {!isEditingAbout && (
                    <button className="btn-edit-about" onClick={() => setIsEditingAbout(true)}>
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {isEditingAbout ? (
                  <div className="about-edit-form">
                    <textarea 
                      value={aboutMeText} 
                      onChange={(e) => setAboutMeText(e.target.value)}
                      placeholder="Write a short introduction about yourself"
                      rows={3}
                    />
                    <div className="about-edit-actions">
                      <button className="btn-cancel-about" onClick={() => {
                        setAboutMeText(employee.about_me || '');
                        setIsEditingAbout(false);
                      }}>
                        <X size={14} style={{ marginRight: '4px' }} /> Cancel
                      </button>
                      <button className="btn-save-about" onClick={handleSaveAboutMe}>
                        <Check size={14} style={{ marginRight: '4px' }} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`about-me-display-text ${!employee?.about_me || employee?.about_me === 'Write a short introduction about yourself' ? 'placeholder-style' : ''}`}>
                    {employee?.about_me || 'Write a short introduction about yourself'}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div className="profile-tags-section">
                <span className="tags-title">Academic Details</span>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div>College: <strong>{employee?.college || 'COEP Technological University'}</strong></div>
                  <div>Skills: 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {employee?.skills && employee.skills.map(skill => (
                        <span key={skill} className="profile-tag-pill">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeInnerTab === 'Leave' ? (
            <div className="dashboard-leave-body">
              <div className="dashboard-leave-list">
                {leaveTypes.map((type) => (
                  <div key={type.id} className="dashboard-leave-row" style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <div className="db-leave-left">
                      <div className={`db-leave-icon-box bg-${type.color_theme}`}>
                        {renderLeaveIcon(type.icon_type)}
                      </div>
                      <span className="db-leave-name">{type.name}</span>
                    </div>

                    <div className="db-leave-middle">
                      {type.name !== 'Leave Without Pay' && (
                        <div className="db-leave-col">
                          <span className="db-leave-label">Available</span>
                          <span className={`db-leave-value ${type.available > 0 ? 'available-green' : ''}`}>
                            {type.available} days
                          </span>
                        </div>
                      )}
                      <div className="db-leave-col">
                        <span className="db-leave-label">Booked</span>
                        <span className="db-leave-value">
                          {type.booked} days
                        </span>
                      </div>
                    </div>

                    <div className="db-leave-right">
                      {type.name !== 'Leave Without Pay' && type.name !== 'Compensatory Off' && type.available > 0 && (
                        <button 
                          className="db-btn-apply-leave"
                          onClick={() => {
                            setSelectedLeaveTypeId(type.id);
                            setIsLeaveModalOpen(true);
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>

      </div>

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Apply Leave</h3>
              <button className="modal-close-btn" onClick={closeLeaveModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitLeave} className="modal-form">
              <div className="form-group">
                <label>Leave Type *</label>
                <select 
                  value={selectedLeaveTypeId} 
                  onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                  required
                >
                  {leaveTypes.filter(t => t.name !== 'Leave Without Pay' && t.name !== 'Compensatory Off').map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Available: {t.available})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave *</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief details..."
                  rows={3}
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeLeaveModal}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
