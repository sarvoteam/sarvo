import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  CalendarDays, 
  ChevronDown, 
  Play, 
  Square,
  Power
} from 'lucide-react';
import { attendanceApi } from '../../../apis/attendanceApi';
import { authApi } from '../../../apis/authApi';

export default function AttendanceSection() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [timerText, setTimerText] = useState('00:00:00 Hrs');
  const [notes, setNotes] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState('Days');

  // Stats calculation
  const [stats, setStats] = useState({
    payableDays: 2,
    present: 0,
    onDuty: 0,
    paidLeave: 0,
    holidays: 0,
    weekend: 2
  });

  const fetchData = async () => {
    try {
      // 1. Fetch employee
      const meData = await authApi.getProfile();
      
      // We need to fetch the today check-in status to set employee status to 'Checked-in' or 'Yet to check-in'
      const statusRes = await attendanceApi.getTodayStatus();
      const meWithStatus = {
        ...meData,
        status: statusRes.checkedIn && !statusRes.checkedOut ? 'Checked-in' : 'Yet to check-in'
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
    fetchData();
    // Sync periodically
    const syncInterval = setInterval(fetchData, 5000);
    return () => clearInterval(syncInterval);
  }, []);

  // Update timer every second
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
  }, [employee, attendance]);

  const handleCheckInToggle = async () => {
    const isCheckedIn = employee?.status === 'Checked-in';
    try {
      if (isCheckedIn) {
        await attendanceApi.checkOut();
      } else {
        await attendanceApi.checkIn();
      }
      fetchData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const isCheckedIn = employee?.status === 'Checked-in';

  // Calculate timeline segment percentages
  const getTimelineStyle = (day) => {
    if (day.status === 'Absent') {
      return { background: '#fee2e2', border: '1px solid #fca5a5' };
    }
    return {};
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

  // Helper for computing linear progress width representing check-in duration
  const getProgressWidthPercent = (day) => {
    if (!day.check_in) return '0%';
    const end = day.check_out ? new Date(day.check_out) : new Date();
    const start = new Date(day.check_in);
    
    // Shift duration is 8 hours (28800000 ms)
    const durationMs = end - start;
    const percent = Math.min(100, (durationMs / 28800000) * 100);
    return `${percent}%`;
  };

  return (
    <div className="attendance-section-container">
      {/* 1. Sub Header Picker Bar */}
      <div className="attendance-header-bar">
        <div className="attendance-date-picker">
          <button className="date-arrow-btn"><ChevronLeft size={16} /></button>
          <div className="date-range-display">
            <Calendar size={14} style={{ marginRight: '6px' }} />
            <span>08-06-2026 - 14-06-2026</span>
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
          >
            <div className="btn-checkin-text">
              <span className="checkin-status-title">{isCheckedIn ? 'Check out' : 'Check in'}</span>
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
                          style={{ width: getProgressWidthPercent(day) }}
                        >
                          <span className="progress-dot start"></span>
                          <span className="progress-dot end"></span>
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
