import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Check, 
  X, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { attendanceApi } from '../apis/attendanceApi';
import { authApi } from '../apis/authApi';

function CalendarDayCell({ day }) {
  if (!day.isCurrentMonth) {
    return (
      <div style={{
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        opacity: 0.25,
        fontSize: '13px',
        fontWeight: 500,
        backgroundColor: 'transparent',
        borderRadius: '8px'
      }}>
        {day.dayNum}
      </div>
    );
  }

  // Styles based on status
  let bg = 'transparent';
  let border = '1px solid var(--border-color)';
  let color = 'var(--text-main)';
  let label = '';
  let subtext = '';
  let opacity = 1;

  if (day.status === 'present') {
    bg = 'rgba(16, 185, 129, 0.1)';
    border = '1px solid rgba(16, 185, 129, 0.3)';
    color = '#10b981';
    label = 'Present';
    if (day.log && day.log.total_hours) {
      subtext = `${Number(day.log.total_hours).toFixed(1)} hrs`;
    }
  } else if (day.status === 'absent') {
    bg = 'rgba(239, 68, 68, 0.1)';
    border = '1px solid rgba(239, 68, 68, 0.3)';
    color = '#ef4444';
    label = 'Absent';
  } else if (day.status === 'weekend') {
    bg = 'rgba(255, 255, 255, 0.02)';
    border = '1px dashed var(--border-color)';
    color = 'var(--text-muted)';
    label = 'Weekend';
  } else if (day.status === 'today-unmarked') {
    bg = 'rgba(0, 123, 245, 0.05)';
    border = '1px solid var(--active-blue)';
    color = 'var(--active-blue)';
    label = 'Today';
  } else if (day.status === 'future') {
    bg = 'transparent';
    border = '1px solid rgba(255, 255, 255, 0.03)';
    color = 'var(--text-muted)';
    opacity = 0.5;
  }

  return (
    <div style={{
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 4px',
      borderRadius: '8px',
      backgroundColor: bg,
      border: border,
      color: color,
      opacity: opacity,
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: day.status !== 'future' ? 'pointer' : 'default',
    }}
    onMouseEnter={(e) => {
      if (day.status !== 'future') {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    title={day.log ? `Check-in: ${day.log.check_in_time ? new Date(day.log.check_in_time).toLocaleTimeString() : 'N/A'}\nCheck-out: ${day.log.check_out_time ? new Date(day.log.check_out_time).toLocaleTimeString() : 'N/A'}` : ''}
    >
      <span style={{ fontSize: '13px', fontWeight: 700 }}>{day.dayNum}</span>
      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85 }}>{label}</span>
      {subtext ? (
        <span style={{ fontSize: '8px', fontWeight: 600, opacity: 0.7 }}>{subtext}</span>
      ) : (
        <span style={{ height: '10px' }} />
      )}
    </div>
  );
}

function formatDateLocal(dateInput) {
  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonthLocal(dateInput) {
  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function StudentAttendanceView({ currentUser }) {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerText, setTimerText] = useState('00:00:00 Hrs');
  
  // Regularization Form State
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('10:30');
  const [regCheckOut, setRegCheckOut] = useState('18:30');
  const [regReason, setRegReason] = useState('');
  const [regRequests, setRegRequests] = useState([]);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [alert, setAlert] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    weekend: 0,
    percentage: 0
  });

  const [currentMonth, setCurrentMonth] = useState(formatMonthLocal(new Date())); // YYYY-MM
  const [monthlyLogs, setMonthlyLogs] = useState([]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    let prevY = y;
    let prevM = m - 1;
    if (prevM === 0) {
      prevM = 12;
      prevY = y - 1;
    }
    setCurrentMonth(`${prevY}-${String(prevM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    let nextY = y;
    let nextM = m + 1;
    if (nextM === 13) {
      nextM = 1;
      nextY = y + 1;
    }
    setCurrentMonth(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch profile & today's status
      const profile = await authApi.getProfile();
      const todayStatus = await attendanceApi.getTodayStatus();
      
      setEmployee({
        ...profile,
        checkedIn: todayStatus.checkedIn,
        checkedOut: todayStatus.checkedOut,
        checkInTime: todayStatus.checkInTime,
        checkOutTime: todayStatus.checkOutTime,
        status: todayStatus.checkedIn && !todayStatus.checkedOut ? 'Checked-in' : 'Yet to check-in'
      });

      // 2. Fetch monthly logs
      const logs = await attendanceApi.getMonthlyLogs(currentMonth);
      setMonthlyLogs(logs || []);

      const [yearStr, monthStr] = currentMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;

      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const todayStr = formatDateLocal(new Date());

      const prevMonthDays = [];
      const prevMonthLastDate = new Date(year, month, 0).getDate();
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        prevMonthDays.push({
          dayNum: prevMonthLastDate - i,
          isCurrentMonth: false,
          dateStr: null
        });
      }

      const currentMonthDays = [];
      let presentCount = 0;
      let absentCount = 0;
      let weekendCount = 0;
      let eligibleDaysCount = 0;

      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        const log = logs.find(l => {
          const lDateStr = formatDateLocal(l.date);
          return lDateStr === dateStr;
        });
        
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;

        let status = 'neutral';
        if (isFuture) {
          status = 'future';
        } else if (log && log.status === 'present') {
          status = 'present';
        } else if (isWeekend) {
          status = 'weekend';
        } else if (isToday) {
          status = 'today-unmarked';
        } else {
          status = 'absent';
        }

        currentMonthDays.push({
          dayNum: d,
          isCurrentMonth: true,
          dateStr,
          status,
          log
        });

        if (log && log.status === 'present') {
          presentCount++;
        } else if (isWeekend) {
          weekendCount++;
        } else if (!isFuture) {
          absentCount++;
        }

        if (!isWeekend && !isFuture) {
          eligibleDaysCount++;
        }
      }

      const nextMonthDays = [];
      const totalCells = prevMonthDays.length + currentMonthDays.length;
      const nextPadding = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let d = 1; d <= nextPadding; d++) {
        nextMonthDays.push({
          dayNum: d,
          isCurrentMonth: false,
          dateStr: null
        });
      }

      const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
      setAttendance(calendarDays);

      const pct = eligibleDaysCount > 0 ? Math.round((presentCount / eligibleDaysCount) * 100) : 100;
      
      setStats({
        present: presentCount,
        absent: absentCount,
        weekend: weekendCount,
        percentage: pct
      });

      // 3. Load regularizations
      const regs = await attendanceApi.listRegularizations(profile.id);
      setRegRequests(regs || []);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Timer logic for logged-in session
  useEffect(() => {
    if (!employee || !employee.checkedIn || employee.checkedOut) {
      setTimerText('00:00:00 Hrs');
      return;
    }

    const interval = setInterval(() => {
      const checkInDate = new Date(employee.checkInTime);
      const diffMs = Math.abs(new Date() - checkInDate);
      
      const secs = Math.floor((diffMs / 1000) % 60);
      const mins = Math.floor((diffMs / (1000 * 60)) % 60);
      const hrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      
      setTimerText(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} Hrs`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [employee]);

  const handleCheckIn = async () => {
    try {
      const res = await attendanceApi.checkIn();
      setAlert({ type: 'success', text: 'Checked in successfully! Shift started.' });
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Check-in failed.' });
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await attendanceApi.checkOut();
      setAlert({ type: 'success', text: 'Checked out successfully! Shift closed.' });
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Check-out failed.' });
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!regDate || !regReason) {
      setAlert({ type: 'error', text: 'Please fill in date and reason.' });
      return;
    }

    try {
      setSubmittingReg(true);
      await attendanceApi.submitRegularization({
        date: regDate,
        checkInTime: new Date(`${regDate}T${regCheckIn}:00`).toISOString(),
        checkOutTime: new Date(`${regDate}T${regCheckOut}:00`).toISOString(),
        reason: regReason
      });
      setAlert({ type: 'success', text: 'Regularization request submitted successfully!' });
      setRegDate('');
      setRegReason('');
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to submit regularization.' });
    } finally {
      setSubmittingReg(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--active-blue)', borderRadius: '50%' }}></div>
        <p style={{ marginTop: '12px' }}>Loading attendance...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Alert Banner */}
      {alert && (
        <div className={`auth-alert ${alert.type === 'success' ? 'success' : 'error'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {alert.text}
          </span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* Banner info */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 123, 245, 0.08) 0%, rgba(0, 210, 255, 0.02) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Attendance Tracker</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Your daily training presence is marked automatically upon login. View your log summaries below.
          </p>
        </div>
        <Clock size={24} color="var(--active-blue)" style={{ opacity: 0.8 }} />
      </div>

      {/* Stats Board */}
      <div style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: 'var(--card-shadow)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PRESENT DAYS</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{stats.present}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ABSENT DAYS</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{stats.absent}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', background: 'rgba(0, 123, 245, 0.05)', border: '1px solid rgba(0, 123, 245, 0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ATTENDANCE RATE</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--active-blue)' }}>{stats.percentage}%</span>
        </div>
        <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <TrendingUp size={14} color="#10b981" />
          <span>Attendance compliance requires maintaining a rate above 85%. For corrections, contact your mentor.</span>
        </div>
      </div>

      {/* Monthly Attendance Calendar */}
      <div style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        padding: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
            Monthly Attendance Calendar
          </h3>
          
          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              &larr; Prev
            </button>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', minWidth: '120px', textAlign: 'center' }}>
              {(() => {
                const monthNames = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const [yStr, mStr] = currentMonth.split('-');
                return `${monthNames[parseInt(mStr) - 1]} ${yStr}`;
              })()}
            </span>
            <button 
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Next &rarr;
            </button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <span key={day} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px'
        }}>
          {attendance.map((day, idx) => (
            <CalendarDayCell key={day.dateStr || `empty-${idx}`} day={day} />
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          borderTop: '1px solid var(--border-color)',
          marginTop: '20px',
          paddingTop: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
            <span>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }} />
            <span>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-color)' }} />
            <span>Weekend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(0, 123, 245, 0.05)', border: '1px solid var(--active-blue)' }} />
            <span>Today</span>
          </div>
        </div>
      </div>

    </div>
  );
}
