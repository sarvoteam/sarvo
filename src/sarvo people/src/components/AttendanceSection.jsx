import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  CalendarDays, 
  ChevronDown, 
  Power,
  Check,
  X,
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { attendanceApi } from '../apis/attendanceApi';
import { authApi } from '../apis/authApi';
import { cohortApi } from '../apis/cohortApi';

export default function AttendanceSection({ subNavItem = 'Attendance Summary', activeSubTab = 'My Data', user }) {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timerText, setTimerText] = useState('00:00:00 Hrs');
  const [notes, setNotes] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState('Days');

  // Regularization form state
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('09:30');
  const [regCheckOut, setRegCheckOut] = useState('18:30');
  const [regReason, setRegReason] = useState('');
  const [regRequests, setRegRequests] = useState([]);
  const [remarksMap, setRemarksMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [alert, setAlert] = useState(null);
  // Stats calculation
  const [stats, setStats] = useState({
    payableDays: 2,
    present: 0,
    onDuty: 0,
    paidLeave: 0,
    holidays: 0,
    weekend: 2
  });

  const isPrivileged = user?.role === 'Admin' || user?.role === 'Mentor' || user?.role === 'HR';

  // Student Attendance states (Mentors / Admins)
  const [teamDate, setTeamDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [tempTimes, setTempTimes] = useState({}); // { [studentId]: { checkIn: '09:30', checkOut: '18:30' } }

  const [batches, setBatches] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [loadingBatches, setLoadingBatches] = useState(false);

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const data = await cohortApi.getCohorts();
      setBatches(data || []);
      if (data && data.length > 0) {
        setSelectedCohortId(data[0].id);
      } else {
        setSelectedCohortId('');
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchStudentRoster = async (date, cohortId = selectedCohortId) => {
    if (!cohortId) {
      setStudentRoster([]);
      return;
    }
    setLoadingRoster(true);
    try {
      const data = await attendanceApi.getStudentsStatus(date, cohortId);
      setStudentRoster(data || []);
      
      // Initialize tempTimes
      const times = {};
      (data || []).forEach(s => {
        const checkInTimeStr = s.check_in_time 
          ? new Date(s.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          : '09:30';
        const checkOutTimeStr = s.check_out_time 
          ? new Date(s.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          : '18:30';
        times[s.id] = { checkIn: checkInTimeStr, checkOut: checkOutTimeStr };
      });
      setTempTimes(times);
    } catch (err) {
      console.error('Failed to fetch student roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleMarkStudentAttendance = async (studentId, status) => {
    try {
      const times = tempTimes[studentId] || { checkIn: '10:30', checkOut: '18:30' };
      const checkInDateTime = status === 'present' ? new Date(`${teamDate}T${times.checkIn}:00`).toISOString() : null;
      const checkOutDateTime = status === 'present' ? new Date(`${teamDate}T${times.checkOut}:00`).toISOString() : null;
      
      await attendanceApi.markStudentAttendance(studentId, teamDate, status, checkInDateTime, checkOutDateTime);
      await fetchStudentRoster(teamDate, selectedCohortId);
      setAlert({ type: 'success', text: `Successfully marked student ${status}` });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to mark attendance' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleMarkAll = async (status) => {
    try {
      for (const student of studentRoster) {
        const times = tempTimes[student.id] || { checkIn: '10:30', checkOut: '18:30' };
        const checkInDateTime = status === 'present' ? new Date(`${teamDate}T${times.checkIn}:00`).toISOString() : null;
        const checkOutDateTime = status === 'present' ? new Date(`${teamDate}T${times.checkOut}:00`).toISOString() : null;
        await attendanceApi.markStudentAttendance(student.id, teamDate, status, checkInDateTime, checkOutDateTime);
      }
      await fetchStudentRoster(teamDate, selectedCohortId);
      setAlert({ type: 'success', text: `Successfully marked all students as ${status}` });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to mark all attendance' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'Team' && (subNavItem === 'Attendance Summary' || !subNavItem)) {
      fetchBatches();
    }
  }, [activeSubTab, subNavItem]);

  useEffect(() => {
    if (activeSubTab === 'Team' && (subNavItem === 'Attendance Summary' || !subNavItem)) {
      fetchStudentRoster(teamDate, selectedCohortId);
    }
  }, [activeSubTab, subNavItem, teamDate, selectedCohortId]);

  const fetchData = async () => {
    try {
      // 1. Fetch employee
      const meData = await authApi.getProfile();
      
      const statusRes = await attendanceApi.getTodayStatus();
      let statusText = 'Yet to check-in';
      if (statusRes.checkedIn && !statusRes.checkedOut) {
        statusText = 'Checked-in';
      } else if (statusRes.checkedIn && statusRes.checkedOut) {
        statusText = 'Checked-out';
      }
      const meWithStatus = {
        ...meData,
        status: statusText
      };
      setEmployee(meWithStatus);

      // 2. Fetch weekly logs
      const backendLogs = await attendanceApi.getWeeklyLogs();
      
      // Map to last 7 days
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
          total_hours: log ? Number(log.total_hours) : 0.00
        });
      }
      
      setAttendance(daysOfWeek);
      calculateStats(daysOfWeek);
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  const fetchRegularizationData = async () => {
    try {
      const targetEmpId = activeSubTab === 'Team' ? null : user?.id;
      const data = await attendanceApi.listRegularizations(targetEmpId);
      setRegRequests(data || []);
    } catch (err) {
      console.error('Regularization list error:', err);
    }
  };

  const calculateStats = (attData) => {
    let presentCount = 0;
    let absentCount = 0;
    let weekendCount = 0;

    attData.forEach(day => {
      if (day.status === 'Present') presentCount++;
      else if (day.status === 'Absent') absentCount++;
      else if (day.status === 'Weekend') weekendCount++;
    });

    setStats({
      payableDays: presentCount + weekendCount,
      present: presentCount,
      onDuty: 0,
      paidLeave: 0,
      holidays: 0,
      weekend: weekendCount
    });
  };

  useEffect(() => {
    if (subNavItem === 'Attendance Summary' || !subNavItem) {
      fetchData();
      const syncInterval = setInterval(fetchData, 5000);
      return () => clearInterval(syncInterval);
    } else if (subNavItem === 'Regularization') {
      fetchRegularizationData();
    }
  }, [subNavItem, activeSubTab, user]);

  // Update timer every second
  useEffect(() => {
    let interval = null;

    if (employee && employee.status === 'Checked-in' && (subNavItem === 'Attendance Summary' || !subNavItem)) {
      const updateTimer = () => {
        const todayLog = attendance.find(log => log.isToday);
        if (todayLog && todayLog.check_in) {
          const diffMs = new Date() - new Date(todayLog.check_in);
          if (diffMs > 0) {
            const secs = Math.floor((diffMs / 1000) % 60);
            const mins = Math.floor((diffMs / (1000 * 60)) % 60);
            const hrs = Math.floor(diffMs / (1000 * 60 * 60));
            
            const pad = (n) => String(n).padStart(2, '0');
            setTimerText(`${pad(hrs)}:${pad(mins)}:${pad(secs)} Hrs`);
          } else {
            setTimerText('00:00:00 Hrs');
          }
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimerText('00:00:00 Hrs');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [employee, attendance, subNavItem]);

  const isCheckedIn = employee?.status === 'Checked-in';
  const isCheckedOut = employee?.status === 'Checked-out';

  const handleCheckInToggle = async () => {
    try {
      if (isCheckedIn) {
        await attendanceApi.checkOut();
      } else {
        await attendanceApi.checkIn();
      }
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Action failed' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!regDate || !regCheckIn || !regCheckOut || !regReason) {
      setAlert({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      const checkInDateTime = `${regDate}T${regCheckIn}:00`;
      const checkOutDateTime = `${regDate}T${regCheckOut}:00`;

      await attendanceApi.submitRegularization({
        date: regDate,
        checkInTime: checkInDateTime,
        checkOutTime: checkOutDateTime,
        reason: regReason
      });

      setAlert({ type: 'success', text: 'Regularization request submitted successfully!' });
      setRegDate('');
      setRegReason('');
      fetchRegularizationData();
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to submit regularization request' });
    }
  };

  const handleAction = async (requestId, status) => {
    const remarks = remarksMap[requestId] || '';
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await attendanceApi.updateRegularizationStatus(requestId, status, remarks);
      setAlert({ type: 'success', text: `Request ${status} successfully!` });
      fetchRegularizationData();
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

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

  // --- RENDER REGULARIZATION TAB ---
  if (subNavItem === 'Regularization') {
    return (
      <div className="attendance-section-container">
        {alert && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '6px',
            backgroundColor: alert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: alert.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${alert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <AlertCircle size={16} />
            <span>{alert.text}</span>
          </div>
        )}

        {activeSubTab === 'Team' ? (
          // --- TEAM VIEW ---
          <div className="attendance-timeline-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>Team Regularization Requests</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Review and approve or reject employee check-in/out log adjustment requests.</p>
            </div>

            {!isPrivileged ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>
                Access Denied: Only Administrators, Mentors, and HR coordinators can view this tab.
              </div>
            ) : regRequests.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No regularization requests pending review.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 14px' }}>Employee</th>
                      <th style={{ padding: '12px 14px' }}>Date</th>
                      <th style={{ padding: '12px 14px' }}>Requested Logs</th>
                      <th style={{ padding: '12px 14px' }}>Reason</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', width: '300px' }}>Action & Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regRequests.map((req) => {
                      const formattedDate = new Date(req.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                      const checkInStr = new Date(req.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const checkOutStr = new Date(req.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      const isPending = req.status === 'pending';
                      
                      return (
                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '12.5px' }}>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{req.employee_name}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{req.employee_code}</div>
                          </td>
                          <td style={{ padding: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{formattedDate}</td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                              <Clock size={12} style={{ color: 'var(--active-blue)' }} /> {checkInStr} - {checkOutStr}
                            </div>
                          </td>
                          <td style={{ padding: '14px', color: 'var(--text-muted)', maxWidth: '200px', wordBreak: 'break-word' }}>{req.reason}</td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: req.status === 'approved' ? 'rgba(16, 185, 129, 0.08)' : req.status === 'rejected' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                              color: req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b'
                            }}>
                              {req.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px' }}>
                            {isPending ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Add remark..."
                                  value={remarksMap[req.id] || ''}
                                  onChange={(e) => setRemarksMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                                  style={{
                                    padding: '6px 8px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none',
                                    background: '#ffffff',
                                    color: '#111827'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleAction(req.id, 'approved')}
                                    disabled={actionLoading[req.id]}
                                    style={{
                                      flexGrow: 1,
                                      padding: '5px 10px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Check size={11} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleAction(req.id, 'rejected')}
                                    disabled={actionLoading[req.id]}
                                    style={{
                                      flexGrow: 1,
                                      padding: '5px 10px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <X size={11} /> Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {req.remarks ? `Remarks: "${req.remarks}"` : 'No remarks added.'}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // --- MY DATA VIEW ---
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Left Form Panel */}
            <div className="attendance-timeline-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>Request Regularization</h3>
              
              <form onSubmit={handleRegularizeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Date</label>
                  <input
                    type="date"
                    required
                    value={regDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRegDate(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#111827'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check In</label>
                    <input
                      type="time"
                      required
                      value={regCheckIn}
                      onChange={(e) => setRegCheckIn(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: '#111827'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check Out</label>
                    <input
                      type="time"
                      required
                      value={regCheckOut}
                      onChange={(e) => setRegCheckOut(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: '#111827'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reason</label>
                  <textarea
                    required
                    placeholder="Enter reason for regularization (e.g. Forgot check-in, system error)"
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    rows={3}
                    style={{
                      padding: '8px 10px',
                      fontSize: '12.5px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      resize: 'none',
                      backgroundColor: '#ffffff',
                      color: '#111827'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--active-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 0.9}
                  onMouseOut={(e) => e.target.style.opacity = 1}
                >
                  Submit Request
                </button>
              </form>
            </div>

            {/* Right List Panel */}
            <div className="attendance-timeline-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>My Regularization History</h3>
              
              {regRequests.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No regularization requests filed yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 10px' }}>Date</th>
                        <th style={{ padding: '8px 10px' }}>Requested Times</th>
                        <th style={{ padding: '8px 10px' }}>Reason</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                        <th style={{ padding: '8px 10px' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regRequests.map((req) => {
                        const formattedDate = new Date(req.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                        const checkInStr = new Date(req.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const checkOutStr = new Date(req.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}>
                            <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>{formattedDate}</td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-main)', fontWeight: 600 }}>{checkInStr} - {checkOutStr}</td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{req.reason}</td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '9px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: req.status === 'approved' ? 'rgba(16, 185, 129, 0.08)' : req.status === 'rejected' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                color: req.status === 'approved' ? '#10b981' : req.status === 'rejected' ? '#ef4444' : '#f59e0b'
                              }}>
                                {req.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontStyle: req.remarks ? 'normal' : 'italic' }}>
                              {req.remarks || 'No remarks yet.'}
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
        )}
      </div>
    );
  }

  // --- RENDER ON DUTY TAB ---
  if (subNavItem === 'On Duty') {
    return (
      <div className="attendance-section-container">
        <div className="attendance-timeline-card" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Briefcase size={40} style={{ color: 'var(--active-blue)', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>On Duty Attendance Policy</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Guidelines for submitting OD requests in Sarvo Tech.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
            <div style={{ background: 'var(--primary-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>When should you file On Duty?</h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Representing the company at client installations, site surveys, or outdoor work.</li>
                <li>Participating in campus recruitment drives, training sessions, or public seminars.</li>
                <li>Attending cohort events or workshops sanctioned by mentors.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>How does it work?</h3>
              <p style={{ margin: 0 }}>
                On Duty applications must be submitted directly to your Mentor or HR Coordinator prior to or immediately following the off-site day. Once approved, the days are marked as payable in your attendance profile, and you are exempt from the daily portal check-in.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(59, 130, 246, 0.08)',
              color: 'var(--active-blue)',
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '12.5px',
              fontWeight: 600
            }}>
              <AlertCircle size={16} />
              <span>To submit an On Duty request, please email your schedule itinerary to HR at hr@sarvo.com.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER TEAM STUDENT ATTENDANCE FOR MENTOR/ADMIN ---
  if (activeSubTab === 'Team' && (subNavItem === 'Attendance Summary' || !subNavItem)) {
    return (
      <div className="attendance-section-container">
        {alert && (
          <div style={{
            padding: '12px 18px',
            borderRadius: '6px',
            backgroundColor: alert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: alert.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${alert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '15px'
          }}>
            <AlertCircle size={16} />
            <span>{alert.text}</span>
          </div>
        )}

        <div className="attendance-timeline-card" style={{ padding: '24px' }}>
          {/* Header Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '20px', 
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Student Roster Attendance</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
                Select a date and click status indicators to mark students present/absent like a roll call.
              </p>
            </div>

            {/* Date Picker & Bulk Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Batch Selector Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Batch</span>
                {loadingBatches ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px' }}>Loading...</div>
                ) : batches.length === 0 ? (
                  <div style={{ fontSize: '12.5px', color: '#ef4444', fontWeight: 600, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)', whiteSpace: 'nowrap' }}>No Batches Assigned</div>
                ) : (
                  <select
                    value={selectedCohortId}
                    onChange={(e) => setSelectedCohortId(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minWidth: '200px',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendance Date</span>
                <input
                  type="date"
                  value={teamDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTeamDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
              </div>
 
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleMarkAll('present')}
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('absent')}
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Mark All Absent
                </button>
              </div>
            </div>
          </div>
 
          {/* Roster Table */}
          {loadingRoster ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading student roster...
            </div>
          ) : studentRoster.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {!selectedCohortId ? 'Please select a batch to view students and mark attendance.' : 'No students found in the selected batch.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Student</th>
                    <th style={{ padding: '12px 14px' }}>Employee Code</th>
                    <th style={{ padding: '12px 14px' }}>Check In</th>
                    <th style={{ padding: '12px 14px' }}>Check Out</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRoster.map((s) => {
                    const times = tempTimes[s.id] || { checkIn: '10:30', checkOut: '18:30' };
                    const isPresent = s.attendance_status === 'present';
                    const isAbsent = s.attendance_status === 'absent';
                    const statusText = s.attendance_status 
                      ? s.attendance_status.toUpperCase() 
                      : 'NOT MARKED';
                    
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '12.5px' }}>
                        <td style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--active-blue), #00d2ff)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {s.first_name ? s.first_name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.first_name} {s.last_name}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{s.employee_code}</td>
                        <td style={{ padding: '14px' }}>
                          <input
                            type="time"
                            value={times.checkIn}
                            onChange={(e) => setTempTimes({
                              ...tempTimes,
                              [s.id]: { ...times, checkIn: e.target.value }
                            })}
                            style={{
                              padding: '5px 8px',
                              fontSize: '12px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              outline: 'none',
                              background: 'var(--card-bg)',
                              color: 'var(--text-main)'
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px' }}>
                          <input
                            type="time"
                            value={times.checkOut}
                            onChange={(e) => setTempTimes({
                              ...tempTimes,
                              [s.id]: { ...times, checkOut: e.target.value }
                            })}
                            style={{
                              padding: '5px 8px',
                              fontSize: '12px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              outline: 'none',
                              background: 'var(--card-bg)',
                              color: 'var(--text-main)'
                            }}
                          />
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: isPresent 
                              ? 'rgba(16, 185, 129, 0.08)' 
                              : isAbsent 
                                ? 'rgba(239, 68, 68, 0.08)' 
                                : 'rgba(100, 116, 139, 0.08)',
                            color: isPresent 
                              ? '#10b981' 
                              : isAbsent 
                                ? '#ef4444' 
                                : '#64748b'
                          }}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleMarkStudentAttendance(s.id, 'present')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: isPresent ? '#10b981' : 'transparent',
                                color: isPresent ? 'white' : 'var(--text-muted)',
                                border: `1px solid ${isPresent ? '#10b981' : 'var(--border-color)'}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleMarkStudentAttendance(s.id, 'absent')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: isAbsent ? '#ef4444' : 'transparent',
                                color: isAbsent ? 'white' : 'var(--text-muted)',
                                border: `1px solid ${isAbsent ? '#ef4444' : 'var(--border-color)'}`,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Absent
                            </button>
                          </div>
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
    );
  }

  const getFormattedDateRange = () => {
    if (!attendance || attendance.length === 0) return 'Loading...';
    const start = new Date(attendance[0].date);
    const end = new Date(attendance[attendance.length - 1].date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(start.getDate())}-${pad(start.getMonth() + 1)}-${start.getFullYear()} - ${pad(end.getDate())}-${pad(end.getMonth() + 1)}-${end.getFullYear()}`;
  };

  // --- DEFAULT ATTENDANCE SUMMARY VIEW ---
  return (
    <div className="attendance-section-container">
      {/* 1. Sub Header Picker Bar */}
      <div className="attendance-header-bar">
        <div className="attendance-date-picker">
          <button className="date-arrow-btn"><ChevronLeft size={16} /></button>
          <div className="date-range-display">
            <Calendar size={14} style={{ marginRight: '6px' }} />
            <span>{getFormattedDateRange()}</span>
          </div>
          <button className="date-arrow-btn"><ChevronRight size={16} /></button>
        </div>

        <div className="attendance-actions-right">
          <div className="toggle-view-buttons">
            <button className="view-btn active"><List size={16} /></button>
            <button className="view-btn"><CalendarDays size={16} /></button>
          </div>

          <button className="btn-request">
            Request
            <ChevronDown size={14} style={{ marginLeft: '6px' }} />
          </button>

          <button className="dots-more-btn">···</button>
        </div>
      </div>

      {/* 2. Main Attendance Entry Card */}
      <div className="attendance-timeline-card">
        {/* Entry Control Panel */}
        <div className="attendance-entry-panel">
          <div className="shift-info">
            <span className="shift-label">General [ 10:30 AM - 6:30 PM ]</span>
          </div>
          
          <input 
            type="text" 
            className="checkin-notes-input"
            placeholder="Add notes for check-in"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Green Pill Check-in button */}
          <button 
            className={`btn-checkin-pill ${isCheckedIn ? 'checked-out-style' : ''}`}
            onClick={handleCheckInToggle}
            disabled={isCheckedOut}
          >
            <div className="btn-checkin-text">
              <span className="checkin-status-title">
                {isCheckedOut ? 'Checked out' : (isCheckedIn ? 'Check out' : 'Check in')}
              </span>
              <span className="checkin-timer">{timerText}</span>
            </div>
            <div className="btn-checkin-icon-circle">
              <Power size={16} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Timeline Table Grid */}
        <div className="timeline-grid-wrapper">
          <div className="timeline-rows-list">
            {attendance.map((day) => {
              const isAbsent = day.status === 'Absent';
              const isWeekend = day.status === 'Weekend';
              const hoursWorked = calculateHoursWorked(day);

              return (
                <div key={day.date} className="timeline-row-item">
                  {/* Day Info */}
                  <div className="timeline-day-label">
                    <span className="day-name-txt">{day.dayName}</span>
                    <div className={`day-circle-num ${day.isToday ? 'active-day-circle' : ''}`}>
                      {String(day.dayNum).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Horizontal Timeline Bar */}
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
                      ) : null}
                    </div>
                  </div>

                  {/* Hours Worked display */}
                  <div className="timeline-hours-worked">
                    <span className="hours-worked-num">{hoursWorked}</span>
                    <span className="hours-worked-lbl">Hrs worked</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Bottom Time Axes */}
          <div className="timeline-time-axes">
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

      {/* 3. Bottom Statistics Summary Grid */}
      <div className="attendance-stats-card">
        <div className="stats-card-tabs">
          {['Days', 'Hours'].map(tab => (
            <button 
              key={tab} 
              className={`stats-tab-btn ${activeBottomTab === tab ? 'active' : ''}`}
              onClick={() => setActiveBottomTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="stats-card-body">
          {activeBottomTab === 'Days' ? (
            <div className="stats-items-grid">
              <div className="stat-grid-item">
                <span className="stat-grid-label">Payable Days</span>
                <span className="stat-grid-value">{stats.payableDays} Days</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Present</span>
                <span className="stat-grid-value">{stats.present} Day</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">On Duty</span>
                <span className="stat-grid-value">{stats.onDuty} Day</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Paid Leave</span>
                <span className="stat-grid-value">{stats.paidLeave} Day</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Holidays</span>
                <span className="stat-grid-value">{stats.holidays} Day</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Weekend</span>
                <span className="stat-grid-value">{stats.weekend} Days</span>
              </div>
            </div>
          ) : (
            <div className="stats-items-grid">
              <div className="stat-grid-item">
                <span className="stat-grid-label">Total Scheduled Hours</span>
                <span className="stat-grid-value">40:00 Hrs</span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Actual Worked Hours</span>
                <span className="stat-grid-value">
                  {String(attendance.reduce((acc, d) => {
                    if (!d.check_in || d.status === 'Absent') return acc;
                    const diff = (d.check_out ? new Date(d.check_out) : new Date()) - new Date(d.check_in);
                    return acc + (diff > 0 ? diff / (1000 * 60 * 60) : 0);
                  }, 0).toFixed(1))} Hrs
                </span>
              </div>
              <div className="stat-grid-item">
                <span className="stat-grid-label">Average Worked Hours</span>
                <span className="stat-grid-value">
                  {stats.present > 0 ? (attendance.reduce((acc, d) => {
                    if (!d.check_in || d.status === 'Absent') return acc;
                    const diff = (d.check_out ? new Date(d.check_out) : new Date()) - new Date(d.check_in);
                    return acc + (diff > 0 ? diff / (1000 * 60 * 60) : 0);
                  }, 0) / stats.present).toFixed(1) : '0.0'} Hrs/Day
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
