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
  Sparkles
} from 'lucide-react';
import foliageBanner from '../assets/foliage_banner.png';

const DEFAULT_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', available: 4, booked: 0, icon_type: 'sun', color_theme: 'blue' },
  { id: 2, name: 'Compensatory Off', available: 0, booked: 0, icon_type: 'co', color_theme: 'green' },
  { id: 3, name: 'Earned Leave', available: 12, booked: 0, icon_type: 'clock', color_theme: 'green-light' },
  { id: 4, name: 'Leave Without Pay', available: 0, booked: 0, icon_type: 'lwop', color_theme: 'red' },
  { id: 5, name: 'Paternity Leave', available: 0, booked: 0, icon_type: 'baby', color_theme: 'orange' },
  { id: 6, name: 'Sick Leave', available: 12, booked: 0, icon_type: 'cross', color_theme: 'purple' }
];

export default function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timerText, setTimerText] = useState('00 : 00 : 00');
  
  // Profile Inner Tabs
  const [activeInnerTab, setActiveInnerTab] = useState('Attendance');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutMeText, setAboutMeText] = useState('');

  // Leave Tab States
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Fetch initial user data
  useEffect(() => {
    const savedUser = localStorage.getItem('zoho_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setEmployee(parsed);
      setAboutMeText(parsed.about_me || '');
    }

    const localAtt = localStorage.getItem('zoho_attendance');
    if (localAtt) {
      setAttendance(JSON.parse(localAtt));
    } else {
      const defaultAtt = getMockWeeklyLogs();
      setAttendance(defaultAtt);
      localStorage.setItem('zoho_attendance', JSON.stringify(defaultAtt));
    }

    const localLeaves = localStorage.getItem('zoho_leaves');
    if (localLeaves) {
      setLeaveTypes(JSON.parse(localLeaves));
    } else {
      setLeaveTypes([...DEFAULT_LEAVE_TYPES]);
      localStorage.setItem('zoho_leaves', JSON.stringify(DEFAULT_LEAVE_TYPES));
    }
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

  const handleCheckIn = () => {
    const updatedEmp = { ...employee, status: 'Checked-in' };
    setEmployee(updatedEmp);
    localStorage.setItem('zoho_current_user', JSON.stringify(updatedEmp));

    // Update in list
    const registeredStr = localStorage.getItem('sarvo_registered_interns');
    if (registeredStr) {
      const registered = JSON.parse(registeredStr);
      const idx = registered.findIndex(r => r.email === employee.email);
      if (idx !== -1) {
        registered[idx].status = 'Checked-in';
        localStorage.setItem('sarvo_registered_interns', JSON.stringify(registered));
      }
    }

    const now = new Date();
    const updatedAttendance = attendance.map(log => {
      if (log.isToday) {
        return {
          ...log,
          check_in: now.toISOString(),
          status: 'Present'
        };
      }
      return log;
    });
    setAttendance(updatedAttendance);
    localStorage.setItem('zoho_attendance', JSON.stringify(updatedAttendance));
  };

  const handleCheckOut = () => {
    const updatedEmp = { ...employee, status: 'Yet to check-in' };
    setEmployee(updatedEmp);
    localStorage.setItem('zoho_current_user', JSON.stringify(updatedEmp));

    const registeredStr = localStorage.getItem('sarvo_registered_interns');
    if (registeredStr) {
      const registered = JSON.parse(registeredStr);
      const idx = registered.findIndex(r => r.email === employee.email);
      if (idx !== -1) {
        registered[idx].status = 'Yet to check-in';
        localStorage.setItem('sarvo_registered_interns', JSON.stringify(registered));
      }
    }

    const updatedAttendance = attendance.map(log => {
      if (log.isToday) {
        return {
          ...log,
          check_out: new Date().toISOString()
        };
      }
      return log;
    });
    setAttendance(updatedAttendance);
    localStorage.setItem('zoho_attendance', JSON.stringify(updatedAttendance));
  };

  const handleSaveAboutMe = () => {
    const updatedEmp = { ...employee, about_me: aboutMeText };
    setEmployee(updatedEmp);
    localStorage.setItem('zoho_current_user', JSON.stringify(updatedEmp));
    setIsEditingAbout(false);
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const updatedLeaves = leaveTypes.map(t => {
      if (t.name === selectedLeaveType) {
        return {
          ...t,
          available: Math.max(0, t.available - diffDays),
          booked: t.booked + diffDays
        };
      }
      return t;
    });

    setLeaveTypes(updatedLeaves);
    localStorage.setItem('zoho_leaves', JSON.stringify(updatedLeaves));
    
    // Add leave request to log
    const existingStr = localStorage.getItem('zoho_leave_applications');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.push({
      id: Date.now(),
      leave_type_name: selectedLeaveType,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'Pending',
      internEmail: employee.email,
      internName: employee.name
    });
    localStorage.setItem('zoho_leave_applications', JSON.stringify(existing));

    closeLeaveModal();
    alert('Leave applied successfully!');
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

  // Render role layout
  const isSystemAdmin = employee?.role === 'Admin';
  const isMentor = employee?.role === 'Reporting Manager';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Interns</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>114 Students</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Scaling to target: 1000+</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Training Batches</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--active-blue)', marginTop: '4px' }}>4 Active</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Avg progress: 52.5%</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task Completion</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>91.2%</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>All-time cohorts average</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placement Ratio</span>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>84.5%</h4>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>84 out of 100 graduated</p>
          </div>
        </div>

        {/* Sub grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* Quick Actions & Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Quick Actions Panel */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--sidebar-bg)', marginBottom: '14px' }}>Administrative Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'var(--primary-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <Users size={18} style={{ color: 'var(--active-blue)', margin: '0 auto 6px' }} />
                  <strong style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-main)' }}>Add Employee</strong>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Role assignment</span>
                </div>
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
                {[
                  { text: 'Intern Aditya Patil submitted E-Commerce project repository.', desc: 'Fullstack Cohort • Awaiting mentor review', time: '10 mins ago' },
                  { text: 'Placement openings listed: associate engineer at TechnoCorp.', desc: '₹8.0 LPA package • DevOps skills', time: '1 hour ago' },
                  { text: 'Weekly performance grades updated for UI/UX Design Cohort.', desc: 'Cohort average: 82% efficiency rating', time: '3 hours ago' }
                ].map((act, i) => (
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

          {/* Side stats widget */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sidebar-bg)' }}>Roster Highlights</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roster Capacity utilization</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>11.4% (Targeting 1000)</strong>
                <div style={{ width: '100%', height: '5px', background: 'var(--primary-bg)', borderRadius: '10px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '11.4%', height: '100%', background: 'var(--active-blue)', borderRadius: '10px' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LMS Course coverage</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>82% interactive engagement</strong>
                <div style={{ width: '100%', height: '5px', background: 'var(--primary-bg)', borderRadius: '10px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '82%', height: '100%', background: '#10b981', borderRadius: '10px' }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Project reviews done</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>42 / 48 submissions reviewed</strong>
                <div style={{ width: '100%', height: '5px', background: 'var(--primary-bg)', borderRadius: '10px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '87.5%', height: '100%', background: '#f59e0b', borderRadius: '10px' }} />
                </div>
              </div>
            </div>

          </div>

        </div>

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

  // VIEW 3: INTERN / STUDENT DEFAULT DASHBOARD (timer, leave, logs summary)
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
            
            <div className={`profile-status ${isCheckedIn ? 'checked-in' : 'yet-checkin'}`}>
              {employee?.status}
            </div>

            <div className="profile-timer">
              {timerText}
            </div>

            <button 
              className={`btn-checkin ${isCheckedIn ? 'active' : ''}`}
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            >
              {isCheckedIn ? 'Check-out' : 'Check-in'}
            </button>
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
                      {type.available > 0 && (
                        <button 
                          className="db-btn-apply-leave"
                          onClick={() => {
                            setSelectedLeaveType(type.name);
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
                  value={selectedLeaveType} 
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                  required
                >
                  {leaveTypes.filter(t => t.name !== 'Leave Without Pay').map(t => (
                    <option key={t.id} value={t.name}>{t.name} (Available: {t.available})</option>
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
